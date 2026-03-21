export default {
    command: 'lockreact',
    aliases: ['blockreact'],
    category: 'admin',
    description: 'Block message reactions in the group',
    usage: '.lockreact <on/off>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const store = await import('../lib/lightweight_store.js');
        const mode = args[0]?.toLowerCase();
        if (mode === 'on') {
            await store.default.saveSetting(chatId, 'lockreact', true);
            await sock.sendMessage(chatId, { text: '😀 Reactions are blocked.', ...channelInfo }, { quoted: message });
        } else if (mode === 'off') {
            await store.default.saveSetting(chatId, 'lockreact', false);
            await sock.sendMessage(chatId, { text: '😀 Reactions are allowed.', ...channelInfo }, { quoted: message });
        } else {
            const locked = await store.default.getSetting(chatId, 'lockreact');
            await sock.sendMessage(chatId, { text: `Reactions locked: ${locked ? 'ON' : 'OFF'}`, ...channelInfo }, { quoted: message });
        }
    }
};