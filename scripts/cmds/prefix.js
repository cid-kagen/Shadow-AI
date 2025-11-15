const fs = require("fs-extra");

module.exports = {
    config: {
        name: "prefix",
        version: "1.0",
        author: "cid",
        role: 0,
        description: "Change bot prefix for your chat or globally (admin only)",
        category: "config",
        guide: {
            en: "{pn} <new prefix> - change prefix\n{pn} <new prefix> -g - global (admin)\n{pn} reset - reset to default"
        }
    },

    langs: {
        en: {
            reset: "🖤 Prefix reset to default: %1",
            onlyAdmin: "⚡ Only admins can change global prefix",
            confirmGlobal: "⚡ React to confirm global prefix change",
            confirmThisThread: "🕶️ React to confirm prefix change in this chat",
            successGlobal: "⚡ Global prefix changed to: %1",
            successThisThread: "🕶️ Prefix changed in this chat to: %1",
            myPrefix: "👁️ Your prefixes:\n🌐 Global: %1\n💬 This chat: %2"
        }
    },

    onStart: async function({ message, role, args, event, threadsData, getLang }) {
        if (!args[0]) return message.SyntaxError();

        if (args[0] === "reset") {
            await threadsData.set(event.threadID, null, "data.prefix");
            return message.reply(getLang("reset", global.GoatBot.config.prefix));
        }

        const newPrefix = args[0];
        const isGlobal = args[1] === "-g";

        if (isGlobal && role < 2) return message.reply(getLang("onlyAdmin"));

        const confirmMsg = isGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");

        return message.reply(confirmMsg, (err, info) => {
            global.GoatBot.onReaction.set(info.messageID, {
                author: event.senderID,
                newPrefix,
                setGlobal: isGlobal
            });
        });
    },

    onReaction: async function({ message, event, Reaction, threadsData, getLang }) {
        if (event.userID !== Reaction.author) return;

        if (Reaction.setGlobal) {
            global.GoatBot.config.prefix = Reaction.newPrefix;
            fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
            return message.reply(getLang("successGlobal", Reaction.newPrefix));
        }

        await threadsData.set(event.threadID, Reaction.newPrefix, "data.prefix");
        return message.reply(getLang("successThisThread", Reaction.newPrefix));
    },

    onChat: async function({ event, message, usersData, getLang, utils }) {
        if (event.body?.toLowerCase() === "prefix") {
            const userName = await usersData.getName(event.senderID);
            return message.reply(getLang(
                "myPrefix",
                global.GoatBot.config.prefix,
                utils.getPrefix(event.threadID)
            ));
        }
    }
};
