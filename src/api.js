import Bot from 'telegraf';
import config from '../config.json';
import commandParts from 'telegraf-command-parts'
import { Data } from './database/data';
import { Info } from './util/info.js';
import { handleCmd } from './commands/handler';

export const info = new Info("https://api.warframestat.us", "/pc");
export const users = new Data("users");
export const times = new Data("times");
export const notifications = new Data("notifications");

export let bot = new Bot(config.token);
bot.use(commandParts());

bot.help((ctx) => {
    /** LIST COMMANDS FROM LIST */
});

bot.command((ctx) => {
    const command = ctx.state.command.command;
    const args = ctx.state.command.args
        .split(",")
        .filter(Boolean)
        .map(a => a.trim());
    users.add(ctx.from);
    handleCmd(ctx, ctx.replyWithMarkdown, command, args);
});

/**
 * KEYBOARD CALLBACK
*/
bot.on("callback_query", (ctx) => {
    const command = ctx.callbackQuery.data;
    users.add(ctx.from);
    handleCmd(ctx, ctx.editMessageText, command);
});

bot.startPolling();