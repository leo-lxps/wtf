import list from './list.json'
import cron from 'node-cron';
//USERDB
import { users, bot, notifications } from '../api.js';
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

export const dashboard = new Dashboard(getCommandFromId("dashboard"), [sortie, alerts]);


export function handleCmd(ctx, telegrafFunction, command, args) {
    const userId = ctx.from.id;
    switch (command) {
        case "dashboard":
            dashboard.execute(telegrafFunction);
            break;
        case "sortie":
            sortie.execute(telegrafFunction);
            break;
        case "alerts":
            alerts.execute(telegrafFunction);
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
        case "filterAlerts":
            alerts.alert(telegrafFunction, userId, true)
            break;
        case "filterInvasions":
            invasions.alert(telegrafFunction, userId, true)
            break;
        case "invasions":
            invasions.execute(telegrafFunction)
            break;
        case "filterBounties":
            bounties.alert(telegrafFunction, userId, true)
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
            sortie.json.then(sortie =>
                times.add(args, userId, sortie, telegrafFunction));
            break;
        default:
            break;
    }
}

function getCommandFromId(id) {
    return list.find(cmd => cmd.id === id);
}

// ================= SCHEDULES ===============
/**
 * ALERT CHECKING
 */
cron.schedule('*/10 * * * * *', () => {
    users.data.filter(u => u.notifyAlerts).forEach(user => {
        const telegrafFunction = (msg, keyboard) => {
            bot.telegram.sendMessage(user.id, msg, keyboard);
        }
        alerts.alert(telegrafFunction, user.id);
    });
    alerts.ids.then(ids => {
        ids.forEach(id => notifications.add({ id: id }))
    });
});