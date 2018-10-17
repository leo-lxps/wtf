import Bot from 'telegraf';
import config from '../config.json';
import commandParts from 'telegraf-command-parts'
import { Data } from './database/data';
import { State } from './util/state.js';
import { handleCmd } from './commands/handler';

export const state = new State("https://api.warframestat.us", "/pc");
export const users = new Data("users");
export const times = new Data("times");
export const notifications = new Data("notifications");

export let bot = new Bot(config.token);
bot.use(commandParts());

bot.help((ctx) => {
    /** LIST COMMANDS FROM LIST */
});

bot.command((ctx) => {
    users.add(ctx.from);

    const command = ctx.state.command.command;
    const args = ctx.state.command.args
        .split(",")
        .filter(Boolean)
        .map(a => a.trim());
    const telegrafFunction = ctx.replyWithMarkdown;
    handleCmd({ ctx, telegrafFunction, command, args });
});

/**
 * KEYBOARD CALLBACK
*/
bot.on("callback_query", (ctx) => {
    users.add(ctx.from);

    const command = ctx.callbackQuery.data;
    const telegrafFunction = ctx.editMessageText;
    const isCb = true;
    handleCmd({ ctx, telegrafFunction, command, isCb });
});

bot.startPolling();