import store from '../lib/lightweight_store.js';

export default {
    command: 'grouptz',
    aliases: ['tz'],
    category: 'admin',
    description: 'Set group timezone (e.g., Africa/Nairobi)',
    usage: '.grouptz <timezone>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const tz = args.join(' ');
        if (!tz) return sock.sendMessage(chatId, { text: '❌ Provide timezone.', ...channelInfo }, { quoted: message });
        await store.saveSetting(chatId, 'timezone', tz);
        await sock.sendMessage(chatId, { text: `✅ Group timezone set to ${tz}.`, ...channelInfo }, { quoted: message });
    }
};