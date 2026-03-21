import store from '../lib/lightweight_store.js';

export default {
    command: 'muteuser',
    aliases: ['silence'],
    category: 'admin',
    description: 'Mute a user in the group (they cannot speak)',
    usage: '.muteuser @user',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return sock.sendMessage(chatId, { text: '❌ Mention the user.', ...channelInfo }, { quoted: message });
        let muted = await store.getSetting(chatId, 'mutedUsers') || [];
        if (!muted.includes(target)) {
            muted.push(target);
            await store.saveSetting(chatId, 'mutedUsers', muted);
            await sock.sendMessage(chatId, { text: `🔇 @${target.split('@')[0]} muted.`, mentions: [target], ...channelInfo }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ Already muted.`, ...channelInfo }, { quoted: message });
        }
    }
};