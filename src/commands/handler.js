import list from './list.json'
import cron from 'node-cron';
//USERDB
import { users, bot, notifications, state, search } from '../api.js';
// COMMANDS
import { Dashboard } from './dashboard/dashboard.js';
import { Sortie } from './sortie/sortie.js';
import { Alerts } from './checker/alerts.js';
import { Items } from './checker/items.js';
import { Invasions } from './checker/invasions.js';
import { Bounties } from './checker/bounties.js';
import { Events } from './checker/events.js';
import { Missions } from './sortie/missions.js';
import { Modifiers } from './sortie/modifiers.js';
import { Times } from './sortie/times.js';
import { Settings } from './settings/settings.js';
import { Updates } from './info/updates.js';
import { Infos } from './info/infos.js';
import { Trader } from './info/trader.js';


/**
 * !!! NAMES MUST BE SAME AS ID !!!
 */
export const sortie = new Sortie(getCommandFromId("sortie"));
export const alerts = new Alerts(getCommandFromId("alerts"));
export const items = new Items(getCommandFromId("items"));
export const invasions = new Invasions(getCommandFromId("invasions"));
export const bounties = new Bounties(getCommandFromId("bounties"));
export const events = new Events(getCommandFromId("events"));
export const missions = new Missions(getCommandFromId("missions"));
export const modifiers = new Modifiers(getCommandFromId("modifiers"));
export const times = new Times(getCommandFromId("times"));
export const settings = new Settings(getCommandFromId("settings"))
export const updates = new Updates(getCommandFromId("updates"));
export const infos = new Infos(getCommandFromId("infos"));
export const trader = new Trader(getCommandFromId("trader"));

export const dashboard = new Dashboard(getCommandFromId("dashboard"),
    [sortie, infos, trader]);

export function getCmd(id) {
    switch (id) {
        case "alerts":
            return alerts
        case "bounties":
            return bounties
        case "invasions":
            return invasions
        case "events":
            return events
        case "sortie":
            return sortie
        case "trader":
            return trader
        case "infos":
            return infos
        case "updates":
            return updates
        default:
            break;
    }
}


export function handleCmd({ ctx, telegrafFunction, command, args, isCb } = {}) {
    const userId = ctx.from.id;
    if (!state.ws) {
        telegrafFunction("Something went wrong! \nPlease try again")
        return;
    }

    if (command.includes(".")) {
        if (command.split(".")[0] == "add") {
            const item = [command.split(".")[1]];
            items.add(item, userId);
            command = "settings";
        } else if (command.split(".")[0] == "remove") {
            const ind = [command.split(".")[1]];
            const item = [items.get(userId)[ind]];
            items.remove(item, userId);
            command = "settings";
        }

        if (command.split(".")[0] == "<") {
            const item = command.split(".")[1];
            dashboard.addItem(userId, item)
            command = "configure";
        } else if (command.split(".")[0] == ">") {
            const item = command.split(".")[1];
            dashboard.removeItem(userId, item)
            command = "configure";
        }
    }

    switch (command) {
        case "dashboard":
            dashboard.execute(telegrafFunction, userId);
            break;
        case "sortie":
            sortie.execute(telegrafFunction);
            break;
        case "alerts":
            alerts.execute(telegrafFunction);
            break;
        case "infos":
            infos.execute(telegrafFunction);
            break;
        case "trader":
            trader.execute(telegrafFunction);
            break;
        case "updates":
            updates.execute(telegrafFunction);
            break;
        case "add":
            items.add(args, userId);
            break;
        case "remove":
            items.remove(args, userId);
            break;
        case "items":
            items.execute(telegrafFunction, userId);
            break;
        case "filter.alerts":
            alerts.alert(telegrafFunction, userId,
                { ignoreCredits: false, ignoreNotified: true })
            break;
        case "filter.invasions":
            invasions.alert(telegrafFunction, userId,
                { ignoreCredits: false, ignoreNotified: true })
            break;
        case "filter.bounties":
            bounties.alert(telegrafFunction, userId,
                { ignoreCredits: false, ignoreNotified: true })
            break;
        case "filter.events":
            events.alert(telegrafFunction, userId,
                { ignoreCredits: false, ignoreNotified: true })
            break;
        case "invasions":
            invasions.execute(telegrafFunction)
            break;
        case "bounties":
            bounties.execute(telegrafFunction)
            break;
        case "events":
            events.execute(telegrafFunction)
            break;
        case "missions":
            missions.execute(telegrafFunction)
            break;
        case "modifiers":
            modifiers.execute(telegrafFunction)
            break;
        case "time":
            times.add(args, userId, sortie.json, telegrafFunction);
            break;
        case "settings":
            settings.execute(telegrafFunction, userId);
            break;
        case "sortieOn":
            sortie.notify(userId, true);
            settings.execute(telegrafFunction, userId);
            break;
        case "sortieOff":
            sortie.notify(userId, false);
            settings.execute(telegrafFunction, userId);
            break;
        case "sortieNotifications":
            ctx.answerCbQuery("Get daily Sortie notifications!", true);
            break;
        case "alertOn":
            items.notify(userId, true);
            settings.execute(telegrafFunction, userId);
            break;
        case "alertOff":
            items.notify(userId, false);
            settings.execute(telegrafFunction, userId);
            break;
        case "alertsNotifications":
            ctx.answerCbQuery("Get filtered Alert notifications!", true);
            break;
        case "updateOn":
            updates.notify(userId, true);
            settings.execute(telegrafFunction, userId);
            break;
        case "updateOff":
            updates.notify(userId, false);
            settings.execute(telegrafFunction, userId);
            break;
        case "updateNotifications":
            ctx.answerCbQuery("Get new Update notifications!", true)
            break;
        case "traderOn":
            trader.notify(userId, true);
            settings.execute(telegrafFunction, userId);
            break;
        case "traderOff":
            trader.notify(userId, false);
            settings.execute(telegrafFunction, userId);
            break;
        case "traderNotifications":
            ctx.answerCbQuery("Get Baro Ki'Teer notifications!", true)
            break;
        case "slap":
            search.slapped++;
            break;
        case "configure":
            dashboard.config(telegrafFunction, userId)
            break;
        case "show":
            ctx.answerCbQuery("This will be shown on your Dashboard!", true);
            break;
        case "hide":
            ctx.answerCbQuery("This will not be shown on your Dashboard!", true);
            break;
        default:
            break;
    }
}

function getCommandFromId(id) {
    return list.find(cmd => cmd.id === id);
}