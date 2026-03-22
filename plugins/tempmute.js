import store from '../lib/lightweight_store.js';
import isOwnerOrSudo from '../lib/isOwner.js';
import isAdmin from '../lib/isAdmin.js';

async function addMutedUser(chatId, userId, durationMs) {
    let muted = await store.getSetting(chatId, 'mutedUsers') || [];
    if (!muted.includes(userId)) {
        muted.push(userId);
        await store.saveSetting(chatId, 'mutedUsers', muted);
        setTimeout(async () => {
            let current = await store.getSetting(chatId, 'mutedUsers') || [];
            current = current.filter(id => id !== userId);
            await store.saveSetting(chatId, 'mutedUsers', current);
        }, durationMs);
    }
}

async function removeMutedUser(chatId, userId) {
    let muted = await store.getSetting(chatId, 'mutedUsers') || [];
    muted = muted.filter(id => id !== userId);
    await store.saveSetting(chatId, 'mutedUsers', muted);
}

async function getMutedUsers(chatId) {
    return await store.getSetting(chatId, 'mutedUsers') || [];
}

export async function handleTempMute(sock, chatId, message, userMessage, senderId) {
    const muted = await getMutedUsers(chatId);
    if (muted.includes(senderId)) {
        try {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant: senderId }
            });
        } catch (e) {}
        await sock.sendMessage(chatId, {
            text: `🔇 @${senderId.split('@')[0]} is muted.`,
            mentions: [senderId]
        });
        return true;
    }
    return false;
}

export default {
    command: 'tempmute',
    aliases: ['tmute'],
    category: 'admin',
    description: 'Temporarily mute a user',
    usage: '.tempmute @user <time> (e.g., 10m, 1h, 1d)',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo, senderId } = context;
        const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target || args.length < 2) return sock.sendMessage(chatId, { text: '❌ Mention user and provide time.', ...channelInfo }, { quoted: message });
        const timeStr = args[1];
        const match = timeStr.match(/^(\d+)([smhd])$/);
        if (!match) return sock.sendMessage(chatId, { text: '❌ Invalid time format (e.g., 10m, 2h).', ...channelInfo }, { quoted: message });
        const value = parseInt(match[1]);
        const unit = match[2];
        let seconds;
        if (unit === 's') seconds = value;
        else if (unit === 'm') seconds = value * 60;
        else if (unit === 'h') seconds = value * 3600;
        else seconds = value * 86400;

        await addMutedUser(chatId, target, seconds * 1000);
        await sock.sendMessage(chatId, {
            text: `🔇 @${target.split('@')[0]} muted for ${timeStr}.`,
            mentions: [target],
            ...channelInfo
        }, { quoted: message });
    },
    handleTempMute,
    addMutedUser,
    removeMutedUser,
    getMutedUsers
};