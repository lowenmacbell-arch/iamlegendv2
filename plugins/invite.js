export default {
    command: 'invite',
    aliases: ['addbyphone'],
    category: 'admin',
    description: 'Invite a user by phone number (must be saved in bot’s contacts)',
    usage: '.invite 255712345678',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const number = args[0]?.replace(/\D/g, '');
        if (!number || number.length < 7) return sock.sendMessage(chatId, { text: '❌ Provide a valid phone number.', ...channelInfo }, { quoted: message });
        const jid = `${number}@s.whatsapp.net`;
        try {
            await sock.groupParticipantsUpdate(chatId, [jid], 'add');
            await sock.sendMessage(chatId, { text: `✅ @${number} invited.`, mentions: [jid], ...channelInfo }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(chatId, { text: `❌ Could not invite: ${e.message}`, ...channelInfo }, { quoted: message });
        }
    }
};