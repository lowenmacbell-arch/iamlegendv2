import moment from 'moment-timezone';

export default {
    command: 'time',
    aliases: ['datetime'],
    category: 'utility',
    description: 'Show current time in a timezone',
    usage: '.time [timezone] (e.g., Africa/Nairobi)',
    groupOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const tz = args[0] || 'Africa/Nairobi';
        const time = moment().tz(tz).format('HH:mm:ss');
        const date = moment().tz(tz).format('dddd, MMMM Do YYYY');
        await sock.sendMessage(chatId, { text: `🕒 *Time in ${tz}*\n${date}\n${time}`, ...channelInfo }, { quoted: message });
    }
};