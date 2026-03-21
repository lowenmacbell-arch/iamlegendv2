export default {
    command: 'slot',
    aliases: ['slots'],
    category: 'games',
    description: 'Spin the slot machine',
    usage: '.slot',
    groupOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const emojis = ['🍒', '🍊', '🍋', '🍉', '💎', '7️⃣'];
        const spin = () => emojis[Math.floor(Math.random() * emojis.length)];
        const a = spin(), b = spin(), c = spin();
        let msg = `🎰 [ ${a} | ${b} | ${c} ]\n`;
        if (a === b && b === c) msg += '🎉 JACKPOT! 🎉';
        else if (a === b || b === c || a === c) msg += '✨ Almost! ✨';
        else msg += '😢 Better luck next time.';
        await sock.sendMessage(chatId, { text: msg, ...channelInfo }, { quoted: message });
    }
};