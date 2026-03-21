import config from '../config.js';
import commandHandler from '../lib/commandHandler.js';
import path from 'path';
import fs from 'fs';

// ═══════════════════════════════════════════════════════════
// 🕐 TIME, GREETING & QUOTE HELPERS
// ═══════════════════════════════════════════════════════════

function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { period: 'morning', sign: '☀' };
    if (hour >= 12 && hour < 18) return { period: 'afternoon', sign: '☁' };
    if (hour >= 18 && hour < 21) return { period: 'evening', sign: '☾' };
    return { period: 'night', sign: '✦' };
}

function getGreeting(period, name) {
    const greetings = {
        morning: [`Good morning, @${name}`, `Rise and shine, @${name}`, `Morning vibes, @${name}`],
        afternoon: [`Good afternoon, @${name}`, `Afternoon energy, @${name}`, `Keep going, @${name}`],
        evening: [`Good evening, @${name}`, `Evening calm, @${name}`, `Unwind time, @${name}`],
        night: [`Good night, @${name}`, `Late night mode, @${name}`, `Rest well, @${name}`]
    };
    const list = greetings[period] || greetings.evening;
    return list[Math.floor(Math.random() * list.length)];
}

async function fetchRandomQuote() {
    const APIs = [
        `https://shizoapi.onrender.com/api/texts/quotes?apikey=shizo`,
        `https://discardapi.dpdns.org/api/quotes/random?apikey=guru`
    ];
    for (const url of APIs) {
        try {
            const res = await fetch(url, { timeout: 5000 });
            if (!res.ok) continue;
            const data = await res.json();
            return data?.quote || data?.text || data?.message || data?.body || "Stay legendary";
        } catch (e) { continue; }
    }
    const fallbacks = [
        "Code with passion, deploy with pride.",
        "Every expert was once a beginner.",
        "Stay legendary, stay humble.",
        "Dream big, code bigger.",
        "Your potential is endless."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false,
        timeZone: config.timeZone || 'Africa/Nairobi'
    });
}

function getChatType(context) {
    const { isGroup, isPrivate } = context;
    if (isPrivate) return 'Private';
    if (isGroup) return 'Group';
    return 'Channel';
}

// ═══════════════════════════════════════════════════════════
// 📋 COMMAND FORMATTER (shared by all styles)
// ═══════════════════════════════════════════════════════════

function formatCommands(categories, prefix) {
    const result = [];
    let totalCount = 0;
    for (const [cat, cmds] of categories) {
        const catUpper = cat.toUpperCase();
        const catData = { category: catUpper, count: cmds.length, commands: [] };
        totalCount += cmds.length;
        for (const cmdName of cmds) {
            const cmd = commandHandler.commands.get(cmdName);
            if (!cmd) continue;
            const desc = cmd.description || cmd.usage || 'No description';
            const nameUpper = cmdName.toUpperCase();
            catData.commands.push({ name: nameUpper, description: desc });
        }
        result.push(catData);
    }
    result.total = totalCount;
    return result;
}

// ═══════════════════════════════════════════════════════════
// 📄 RENDER A CATEGORY BLOCK (unified layout – used by all styles)
// ═══════════════════════════════════════════════════════════

function renderCategory(cat, prefix) {
    let block = `       🫥${cat.category}\n`;
    block += `          < ${cat.count} COMMANDS >\n\n`;
    for (const cmd of cat.commands) {
       
         block += `  ├➣ *${cmd.name}*\n`;
        
        block += `  ├➣ ${cmd.description}\n\n`;
    }
    return block;
}

// ═══════════════════════════════════════════════════════════
// 🎨 20 DISTINCT STYLES (5 designs × 4 variants)
//    Designs: Compact Box, Pure Minimal, Smooth Edge, Fresh Line, Soft Frame
// ═══════════════════════════════════════════════════════════

const menuStyles = [
    // ========== COMPACT BOX (styles 1–4) ==========
    {
        name: 'Compact Box #1',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `┌─ IAMLEGEND\n│\n`;
            t += `│ ${timeSign} ${greeting}\n`;
            t += `│ ⏱ ${info.time}  •  ${chatType}\n`;
            t += `│ ${quote}\n│\n`;
            t += `│ Owner: ${info.owner}\n`;
            t += `│ Total: ${info.total} commands\n│\n`;
            for (const cat of categories) {
                t += `│  ├• ${cat.category}\n`;
                t += `│  < ${cat.count} COMMANDS >\n│\n`;
                for (const cmd of cat.commands) {
                    t += `│  ├➣ *${cmd.name}*\n`;
                    t += `│  ├➣ ${cmd.description}\n`;
                }
                t += `│\n`;
            }
            t += `└─\n`;
            t += `    ${info.bot} v${info.version}\n`;
            return t;
        }
    },
    {
        name: 'Compact Box #2',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `┌── IAMLEGEND ──┐\n`;
            t += `│ ${timeSign} ${greeting}\n`;
            t += `│ ⏱ ${info.time}  •  ${chatType}\n`;
            t += `│ ${quote}\n`;
            t += `├──────────────┤\n`;
            t += `│ Owner: ${info.owner}\n`;
            t += `│ Total: ${info.total} commands\n`;
            t += `└──────────────┘\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `───────────────\n`;
            t += `    ${info.bot} v${info.version}\n`;
            return t;
        }
    },
    {
        name: 'Compact Box #3',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `╭─ IAMLEGEND ─╮\n`;
            t += `│ ${timeSign} ${greeting}\n`;
            t += `│ ⏱ ${info.time}  •  ${chatType}\n`;
            t += `│ ${quote}\n`;
            t += `├──────────────┤\n`;
            t += `│ Owner: ${info.owner}\n`;
            t += `│ Total: ${info.total} commands\n`;
            t += `╰──────────────╯\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `───────────────\n`;
            t += `    ${info.bot} v${info.version}\n`;
            return t;
        }
    },
    {
        name: 'Compact Box #4',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `┌─ IAMLEGEND ─┐\n`;
            t += `│ ${timeSign} ${greeting}\n`;
            t += `│ ⏱ ${info.time}  •  ${chatType}\n`;
            t += `│ ${quote}\n`;
            t += `├──────────────┤\n`;
            t += `│ Owner: ${info.owner}\n`;
            t += `│ Total: ${info.total} commands\n`;
            t += `└──────────────┘\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `───────────────\n`;
            t += `    ${info.bot} v${info.version}\n`;
            return t;
        }
    },

    // ========== PURE MINIMAL (styles 5–8) ==========
    {
        name: 'Pure Minimal #1',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `╍╍╍ IAMLEGEND ╍╍╍\n\n`;
            t += `${timeSign} ${greeting}\n`;
            t += `⏱ ${info.time}  •  ${chatType}\n`;
            t += `${quote}\n\n`;
            t += `Owner: ${info.owner}  |  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `╍╍╍ ${info.bot} v${info.version} ╍╍╍\n`;
            return t;
        }
    },
    {
        name: 'Pure Minimal #2',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `▪▪▪ IAMLEGEND ▪▪▪\n\n`;
            t += `${timeSign} ${greeting}\n`;
            t += `⏱ ${info.time}  •  ${chatType}\n`;
            t += `${quote}\n\n`;
            t += `Owner: ${info.owner}  |  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `▪▪▪ ${info.bot} v${info.version} ▪▪▪\n`;
            return t;
        }
    },
    {
        name: 'Pure Minimal #3',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `── IAMLEGEND ──\n\n`;
            t += `${timeSign} ${greeting}\n`;
            t += `⏱ ${info.time}  •  ${chatType}\n`;
            t += `${quote}\n\n`;
            t += `Owner: ${info.owner}  |  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `── ${info.bot} v${info.version} ──\n`;
            return t;
        }
    },
    {
        name: 'Pure Minimal #4',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `✧ IAMLEGEND ✧\n\n`;
            t += `${timeSign} ${greeting}\n`;
            t += `⏱ ${info.time}  •  ${chatType}\n`;
            t += `${quote}\n\n`;
            t += `Owner: ${info.owner}  |  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `✧ ${info.bot} v${info.version} ✧\n`;
            return t;
        }
    },

    // ========== SMOOTH EDGE (styles 9–12) ==========
    {
        name: 'Smooth Edge #1',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `╭──────────────╮\n`;
            t += `│    IAMLEGEND    \n`;
            t += `├──────────────┤\n`;
            t += `│ ${timeSign} ${greeting}\n`;
            t += `│ ⏱ ${info.time}  •  ${chatType}\n`;
            t += `│ ${quote}\n`;
            t += `├──────────────┤\n`;
            t += `│ Owner: ${info.owner}\n`;
            t += `│ Total: ${info.total} commands\n`;
            t += `╰──────────────╯\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `╭──────────────╮\n`;
            t += `│  ${info.bot} v${info.version}\n`;
            t += `╰──────────────╯\n`;
            return t;
        }
    },
    {
        name: 'Smooth Edge #2',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `╭─────────╮\n`;
            t += `│ IAMLEGEND │\n`;
            t += `╰─────────╯\n\n`;
            t += `${timeSign} ${greeting}\n`;
            t += `⏱ ${info.time}  •  ${chatType}\n`;
            t += `${quote}\n\n`;
            t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `╭─────────────╮\n`;
            t += `│  ${info.bot} v${info.version} │\n`;
            t += `╰─────────────╯\n`;
            return t;
        }
    },
    {
        name: 'Smooth Edge #3',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `╭───────────╮\n`;
            t += `│IAMLEGEND│\n`;
            t += `╰───────────╯\n\n`;
            t += `${timeSign} ${greeting}  •  ⏱ ${info.time}\n`;
            t += `${chatType}  •  ${quote}\n\n`;
            t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `╭───────────╮\n`;
            t += `│  ${info.bot} v${info.version} │\n`;
            t += `╰───────────╯\n`;
            return t;
        }
    },
    {
        name: 'Smooth Edge #4',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `╭───────────────╮\n`;
            t += `│      IAMLEGEND      │\n`;
            t += `├───────────────┤\n`;
            t += `│ ${timeSign} ${greeting}\n`;
            t += `│ ⏱ ${info.time}  •  ${chatType}\n`;
            t += `│ ${quote}\n`;
            t += `├───────────────┤\n`;
            t += `│ Owner: ${info.owner}\n`;
            t += `│ Total: ${info.total} commands\n`;
            t += `╰───────────────╯\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `╭───────────────╮\n`;
            t += `│  ${info.bot} v${info.version} │\n`;
            t += `╰───────────────╯\n`;
            return t;
        }
    },

    // ========== FRESH LINE (styles 13–16) ==========
    {
        name: 'Fresh Line #1',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `───────── IAMLEGEND ─────────\n\n`;
            t += `${timeSign} ${greeting}\n`;
            t += `⏱ ${info.time}  •  ${chatType}\n`;
            t += `${quote}\n\n`;
            t += `Owner: ${info.owner}  |  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `──────────────────────\n`;
            t += `     ${info.bot} v${info.version}\n`;
            return t;
        }
    },
    {
        name: 'Fresh Line #2',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `───── IAMLEGEND ─────\n\n`;
            t += `${timeSign} ${greeting}\n`;
            t += `⏱ ${info.time}  •  ${chatType}\n`;
            t += `${quote}\n\n`;
            t += `Owner: ${info.owner}  |  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `────────────────\n`;
            t += `     ${info.bot} v${info.version}\n`;
            return t;
        }
    },
    {
        name: 'Fresh Line #3',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `──── IAMLEGEND ────\n\n`;
            t += `${timeSign} ${greeting}\n`;
            t += `⏱ ${info.time}  •  ${chatType}\n`;
            t += `${quote}\n\n`;
            t += `Owner: ${info.owner}  |  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `──────────────────\n`;
            t += `     ${info.bot} v${info.version}\n`;
            return t;
        }
    },
    {
        name: 'Fresh Line #4',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `═════ IAMLEGEND ═════\n\n`;
            t += `${timeSign} ${greeting}\n`;
            t += `⏱ ${info.time}  •  ${chatType}\n`;
            t += `${quote}\n\n`;
            t += `Owner: ${info.owner}  |  Total: ${info.total}\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `════════════════\n`;
            t += `     ${info.bot} v${info.version}\n`;
            return t;
        }
    },

    // ========== SOFT FRAME (styles 17–20) ==========
    {
        name: 'Soft Frame #1',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
            t += ` IAMLEGEND\n`;
            t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
            t += ` ${timeSign} ${greeting}\n`;
            t += ` ⏱ ${info.time}  •  ${chatType}\n`;
            t += ` ${quote}\n`;
            t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
            t += ` Owner: ${info.owner}\n`;
            t += ` Total: ${info.total} commands\n`;
            t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
            t += `    ${info.bot} v${info.version}\n`;
            return t;
        }
    },
    {
        name: 'Soft Frame #2',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
            t += `  IAMLEGEND\n`;
            t += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
            t += `  ${timeSign} ${greeting}\n`;
            t += `  ⏱ ${info.time}  •  ${chatType}\n`;
            t += `  ${quote}\n`;
            t += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
            t += `  Owner: ${info.owner}\n`;
            t += `  Total: ${info.total} commands\n`;
            t += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
            t += `    ${info.bot} v${info.version}\n`;
            return t;
        }
    },
    {
        name: 'Soft Frame #3',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n`;
            t += `  IAMLEGEND\n`;
            t += `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n`;
            t += `  ${timeSign} ${greeting}\n`;
            t += `  ⏱ ${info.time}  •  ${chatType}\n`;
            t += `  ${quote}\n`;
            t += `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n`;
            t += `  Owner: ${info.owner}\n`;
            t += `  Total: ${info.total} commands\n`;
            t += `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n`;
            t += `    ${info.bot} v${info.version}\n`;
            return t;
        }
    },
    {
        name: 'Soft Frame #4',
        render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
            let t = `◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌\n`;
            t += `  IAMLEGEND\n`;
            t += `◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌\n`;
            t += `  ${timeSign} ${greeting}\n`;
            t += `  ⏱ ${info.time}  •  ${chatType}\n`;
            t += `  ${quote}\n`;
            t += `◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌\n`;
            t += `  Owner: ${info.owner}\n`;
            t += `  Total: ${info.total} commands\n`;
            t += `◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌\n\n`;
            for (const cat of categories) t += renderCategory(cat, prefix);
            t += `◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌◌\n`;
            t += `    ${info.bot} v${info.version}\n`;
            return t;
        }
    }
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════
// 🤖 MAIN COMMAND HANDLER
// ═══════════════════════════════════════════════════════════

export default {
    command: 'menu',
    aliases: ['help', 'commands', 'h', 'list'],
    category: 'general',
    description: 'Show all commands with descriptions',
    usage: '.menu [command]',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo, senderId, senderName, isGroup, isPrivate } = context;
        const prefix = config.prefixes[0];
        const imagePath = path.join(process.cwd(), 'assets/thumb.png');

        // ─── Handle command lookup ───
        if (args.length && args[0] !== 'style' && !args[0].match(/^\d+$/)) {
            const searchTerm = args[0].toLowerCase();
            let cmd = commandHandler.commands.get(searchTerm);
            if (!cmd && commandHandler.aliases.has(searchTerm)) {
                const mainCommand = commandHandler.aliases.get(searchTerm);
                cmd = commandHandler.commands.get(mainCommand);
            }
            if (!cmd) {
                return sock.sendMessage(chatId, {
                    text: `❌ Command "${args[0]}" not found.\n\nUse ${prefix}menu to see all commands.`,
                    ...channelInfo
                }, { quoted: message });
            }
            const text = `╭━━━━━━━━━━━━━━⬣
┃ 📌 COMMAND INFO
┃
┃ ⚡ Command: ${prefix}${cmd.command}
┃ 📝 Desc: ${cmd.description || 'No description'}
┃ 📖 Usage: ${cmd.usage || `${prefix}${cmd.command}`}
┃ 🏷️ Category: ${cmd.category || 'misc'}
┃ 🔖 Aliases: ${cmd.aliases?.length ? cmd.aliases.map(a => prefix + a).join(', ') : 'None'}
┃
╰━━━━━━━━━━━━━━⬣`;
            if (fs.existsSync(imagePath)) {
                return sock.sendMessage(chatId, {
                    image: { url: imagePath },
                    caption: text,
                    ...channelInfo
                }, { quoted: message });
            }
            return sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
        }

        // ─── Prepare dynamic content ───
        const userName = senderName || senderId.split('@')[0];
        const timeInfo = getTimePeriod();
        const greeting = getGreeting(timeInfo.period, userName);
        const quote = await fetchRandomQuote();
        const formattedCategories = formatCommands(commandHandler.categories, prefix);
        const chatType = getChatType({ isGroup, isPrivate });

        // ─── Select random style (or a specific one if given) ───
        const styleIndex = args.find(a => a.match(/^\d+$/));
        const style = styleIndex ? menuStyles[parseInt(styleIndex) - 1] : pick(menuStyles);

        // ─── Render menu using the chosen style ───
        const text = style.render({
            greeting,
            quote,
            prefix,
            timeSign: timeInfo.sign,
            chatType,
            categories: formattedCategories,
            info: {
                bot: config.botName,
                owner: config.botOwner || 'STANY TZ',
                prefix: config.prefixes.join(', '),
                total: commandHandler.commands.size,
                version: config.version || "6.0.0",
                time: formatTime()
            }
        });

        // ─── Send message with mention ───
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chatId, {
                image: { url: imagePath },
                caption: text,
                mentions: [senderId],
                ...channelInfo
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text,
                mentions: [senderId],
                ...channelInfo
            }, { quoted: message });
        }
    }
};