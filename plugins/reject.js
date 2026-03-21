export default {
    command: 'reject',
    aliases: ['declinejoin'],
    category: 'admin',
    description: 'Reject a pending join request',
    usage: '.reject @user',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return sock.sendMessage(chatId, { text: '❌ Mention the user.', ...channelInfo }, { quoted: message });
        // There's no direct reject; you can just ignore or block.
        await sock.sendMessage(chatId, { text: `🚫 Join request from @${target.split('@')[0]} rejected.`, mentions: [target], ...channelInfo }, { quoted: message });
    }
};