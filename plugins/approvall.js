export default {
    command: 'approveall',
    aliases: ['acceptall'],
    category: 'admin',
    description: 'Approve all pending join requests',
    usage: '.approveall',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        // Needs implementation.
        await sock.sendMessage(chatId, { text: '✅ Feature coming soon.', ...channelInfo }, { quoted: message });
    }
};