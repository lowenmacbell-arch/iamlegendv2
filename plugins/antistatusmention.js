/*****************************************************************************
 *                                                                           *
 *                     Developed By STANY TZ                                 *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/Stanytz378/iamlegendv2                 *
 *  ▶️  YouTube  : https://youtube.com/@STANYTZ                              *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7fzu4EwEjmsD4Tzs1p     *
 *                                                                           *
 *    © 2026 STANY TZ. All rights reserved.                                 *
 *                                                                           *
 *    Description: Block users who mention a group in their WhatsApp status *
 *                                                                           *
 ***************************************************************************/

import store from '../lib/lightweight_store.js';
import isOwnerOrSudo from '../lib/isOwner.js';

const SETTING_KEY = 'antistatusgroup';

async function getConfig() {
    const config = await store.getSetting('global', SETTING_KEY);
    return config || { enabled: false, action: 'warn' };
}

async function saveConfig(config) {
    await store.saveSetting('global', SETTING_KEY, config);
}

/**
 * Check if a status message mentions any group (@g.us).
 * @param {object} msg - The status message object
 * @returns {boolean}
 */
function mentionsGroup(msg) {
    const mentionedJid = msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    return mentionedJid.some(jid => jid.endsWith('@g.us'));
}

/**
 * Handler to be called inside the status update event.
 * @param {object} sock - Baileys socket
 * @param {object} status - The status event object
 * @returns {boolean} - true if action was taken
 */
export async function handleStatusGroupMention(sock, status) {
    const config = await getConfig();
    if (!config.enabled) return false;

    // Extract the message object from the status event
    let msg = null;
    if (status.messages && status.messages.length) {
        msg = status.messages[0];
    } else if (status.key && status.key.remoteJid === 'status@broadcast') {
        return false; // no message content to inspect
    }
    if (!msg || !msg.message) return false;

    const senderJid = msg.key.participant || msg.key.remoteJid;
    // Skip if sender is owner or sudo
    const isOwnerSudo = await isOwnerOrSudo(senderJid, sock);
    if (isOwnerSudo) return false;

    // Check for group mention
    if (!mentionsGroup(msg)) return false;

    const action = config.action;
    console.log(`[ANTISTATUSGROUP] User ${senderJid} mentioned a group in status. Action: ${action}`);

    if (action === 'warn') {
        await sock.sendMessage(senderJid, {
            text: `⚠️ *Warning*\n\nYou mentioned a group in your WhatsApp status. This is not allowed.\n\nIf you continue, you may be blocked.`
        }).catch(() => {});
    } else if (action === 'block') {
        try {
            await sock.updateBlockStatus(senderJid, 'block');
            // Try to send a final message (may not be delivered)
            await sock.sendMessage(senderJid, {
                text: `🔒 *You have been blocked*\n\nReason: Mentioning a group in status is prohibited.`
            }).catch(() => {});
        } catch (err) {
            console.error('Failed to block user:', err.message);
        }
    }

    return true; // action taken (but we still allow further status processing)
}

export default {
    command: 'antistatusgroup',
    aliases: ['asg', 'blockstatusgroup'],
    category: 'owner',
    description: 'Block or warn users who mention a group in their WhatsApp status',
    usage: '.antistatusgroup <on|off|set warn|block|status>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const config = await getConfig();
        const action = args[0]?.toLowerCase();

        if (!action || action === 'status') {
            const statusText = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const actionText = config.action === 'warn' ? 'Warn' : 'Block';
            return await sock.sendMessage(chatId, {
                text: `🔇 *Anti‑Status‑Group*\n\nCurrent: ${statusText}\nAction: ${actionText}\n\nCommands:\n.antistatusgroup on — enable\n.antistatusgroup off — disable\n.antistatusgroup set warn — only warn\n.antistatusgroup set block — block users\n.antistatusgroup status — show current`,
                ...channelInfo
            }, { quoted: message });
        }

        if (action === 'on') {
            if (config.enabled) {
                return await sock.sendMessage(chatId, {
                    text: '⚠️ Anti‑status‑group is already enabled.',
                    ...channelInfo
                }, { quoted: message });
            }
            config.enabled = true;
            await saveConfig(config);
            return await sock.sendMessage(chatId, {
                text: '✅ Anti‑status‑group enabled. Users who mention a group in their status will be warned/blocked.',
                ...channelInfo
            }, { quoted: message });
        }

        if (action === 'off') {
            if (!config.enabled) {
                return await sock.sendMessage(chatId, {
                    text: '⚠️ Anti‑status‑group is already disabled.',
                    ...channelInfo
                }, { quoted: message });
            }
            config.enabled = false;
            await saveConfig(config);
            return await sock.sendMessage(chatId, {
                text: '❌ Anti‑status‑group disabled. Users may now mention groups in statuses.',
                ...channelInfo
            }, { quoted: message });
        }

        if (action === 'set') {
            const sub = args[1]?.toLowerCase();
            if (!sub || !['warn', 'block'].includes(sub)) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Please specify action: `warn` or `block`\n\nExample: `.antistatusgroup set warn`',
                    ...channelInfo
                }, { quoted: message });
            }
            config.action = sub;
            await saveConfig(config);
            return await sock.sendMessage(chatId, {
                text: `✅ Action set to *${sub.toUpperCase()}*. Users who mention a group in status will now be ${sub === 'warn' ? 'warned' : 'blocked'}.`,
                ...channelInfo
            }, { quoted: message });
        }

        return await sock.sendMessage(chatId, {
            text: '❌ Invalid command. Use `.antistatusgroup` to see options.',
            ...channelInfo
        }, { quoted: message });
    }
};