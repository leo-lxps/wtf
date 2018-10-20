import list from "./list.json";
//USERDB
import { state, search } from "../api.js";
// COMMANDS
import { Dashboard } from "./dashboard/dashboard.js";
import { Sortie } from "./sortie/sortie.js";
import { Alerts } from "./checker/alerts.js";
import { Items } from "./checker/items.js";
import { Invasions } from "./checker/invasions.js";
import { Bounties } from "./checker/bounties.js";
import { Events } from "./checker/events.js";
import { Missions } from "./sortie/missions.js";
import { Modifiers } from "./sortie/modifiers.js";
import { Times } from "./sortie/times.js";
import { Settings } from "./settings/settings.js";
import { Updates } from "./info/updates.js";
import { Infos } from "./info/infos.js";
import { Trader } from "./info/trader.js";

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
export const settings = new Settings(getCommandFromId("settings"));
export const updates = new Updates(getCommandFromId("updates"));
export const infos = new Infos(getCommandFromId("infos"));
export const trader = new Trader(getCommandFromId("trader"));

export const dashboard = new Dashboard(getCommandFromId("dashboard"));

function getCommandFromId(id) {
  return list.find(cmd => cmd.id === id);
}

export function getCmd(id) {
  switch (id) {
    case "sortie":
      return sortie;
    case "alerts":
      return alerts;
    case "items":
      return items;
    case "invasions":
      return invasions;
    case "bounties":
      return bounties;
    case "events":
      return events;
    case "missions":
      return missions;
    case "modifiers":
      return modifiers;
    case "times":
      return times;
    case "settings":
      return settings;
    case "updates":
      return updates;
    case "infos":
      return infos;
    case "trader":
      return trader;
    case "dashboard":
      return dashboard;
    default:
      break;
  }
}

export function handleCmd({ ctx, telegrafFunction, command, args, isCb } = {}) {
  const userId = ctx.from.id;
  if (!state.ws) {
    if (isCb) {
      ctx.answerCbQuery("Something went wrong! \nPlease try again");
      return;
    }
    telegrafFunction("Something went wrong! \nPlease try again").catch(err =>
      handleErr(err),
    );
    return;
  }

  if (command.includes(".")) {
    const item = command.split(".")[1];
    if (command.split(".")[0] == "add") {
      items.add([item], userId);
      command = "settings";
      if (isCb) {
        ctx.answerCbQuery("Adding " + item + " to your item list!");
      }
      isCb = false;
    } else if (command.split(".")[0] == "remove") {
      items.remove([item], userId);
      command = "settings";
      if (isCb) {
        ctx.answerCbQuery("Removing " + item + " from your item list!", true);
      }
      isCb = false;
    }
    if (command.split(".")[0] == "addInline") {
      items.add([item], userId);
      search.add(item, ctx);
      if (isCb) {
        ctx.answerCbQuery("Adding " + item + " to your item list!");
      }
      return;
    } else if (command.split(".")[0] == "removeInline") {
      items.remove([item], userId);
      search.remove(item, ctx);
      if (isCb) {
        ctx.answerCbQuery("Removing " + item + " from your item list!", true);
      }
      return;
    }
    if (command.split(".")[0] == "<") {
      dashboard.addItem(userId, item);
      command = "configure";
      if (isCb) {
        ctx.answerCbQuery("Adding " + item + " to your custom dashboard!");
      }
    } else if (command.split(".")[0] == ">") {
      dashboard.removeItem(userId, item);
      command = "configure";
      if (isCb) {
        ctx.answerCbQuery("Removing " + item + " from your custom dashboard!");
      }
    }
  }

  switch (command) {
    case "dashboard":
      dashboard.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Loading your dashboard!");
      }
      break;
    case "sortie":
      sortie.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Current sortie!");
      }
      break;
    case "alerts":
      alerts.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Current alerts!");
      }
      break;
    case "infos":
      infos.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Time of Day information!");
      }
      break;
    case "trader":
      trader.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Baro Ki'Teer information!");
      }
      break;
    case "updates":
      updates.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("latest update!");
      }
      break;
    case "add":
      items.add(args, userId);
      items.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Adding items!");
      }
      break;
    case "remove":
      items.remove(args, userId);
      if (isCb) {
        ctx.answerCbQuery("Removing items!");
      }
    case "items":
      items.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Showing items in filter!");
      }
      break;
    case "filter.alerts":
      alerts.alert(telegrafFunction, userId, {
        ignoreCredits: false,
        ignoreNotified: true,
      });
      if (isCb) {
        ctx.answerCbQuery("Filtering alerts!");
      }
      break;
    case "filter.invasions":
      invasions.alert(telegrafFunction, userId, {
        ignoreCredits: false,
        ignoreNotified: true,
      });
      if (isCb) {
        ctx.answerCbQuery("Filtering invasions!");
      }
      break;
    case "filter.bounties":
      bounties.alert(telegrafFunction, userId, {
        ignoreCredits: false,
        ignoreNotified: true,
      });
      if (isCb) {
        ctx.answerCbQuery("Filtering bounties!");
      }
      break;
    case "filter.events":
      events.alert(telegrafFunction, userId, {
        ignoreCredits: false,
        ignoreNotified: true,
      });
      if (isCb) {
        ctx.answerCbQuery("Filtering events!");
      }
      break;
    case "invasions":
      invasions.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Current invasions!");
      }
      break;
    case "bounties":
      bounties.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Current bounties!");
      }
      break;
    case "events":
      events.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Ongoing events!");
      }
      break;
    case "missions":
      missions.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Missions with average times!");
      }
      break;
    case "modifiers":
      modifiers.execute(telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Sortie modifiers!");
      }
      break;
    case "time":
      times.add(args, userId, sortie.json, telegrafFunction);
      if (isCb) {
        ctx.answerCbQuery("Attempting to add time!");
      }
      break;
    case "settings":
      settings.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Settings and Items!");
      }
      break;
    case "sortieOn":
      sortie.notify(userId, true);
      settings.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Sortie notifications are now on!");
      }
      break;
    case "sortieOff":
      sortie.notify(userId, false);
      settings.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Sortie notifications are now off!");
      }
      break;
    case "sortieNotifications":
      if (isCb) {
        ctx.answerCbQuery("Get daily Sortie notifications!", true);
      }
      break;
    case "alertOn":
      items.notify(userId, true);
      settings.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Alert notifications are now on!");
      }
      break;
    case "alertOff":
      items.notify(userId, false);
      settings.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Alert notifications are now off!");
      }
      break;
    case "alertsNotifications":
      if (isCb) {
        ctx.answerCbQuery("Get filtered Alert notifications!", true);
      }
      break;
    case "updateOn":
      updates.notify(userId, true);
      settings.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Update notifications are now on!");
      }
      break;
    case "updateOff":
      updates.notify(userId, false);
      settings.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Update notifications are now off!");
      }
      break;
    case "updateNotifications":
      if (isCb) {
        ctx.answerCbQuery("Get new Update notifications!", true);
      }
      break;
    case "traderOn":
      trader.notify(userId, true);
      settings.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Trader notifications are now on!");
      }
      break;
    case "traderOff":
      trader.notify(userId, false);
      settings.execute(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Trader notifications are now off!");
      }
      break;
    case "traderNotifications":
      if (isCb) {
        ctx.answerCbQuery("Get Baro Ki'Teer notifications!", true);
      }
      break;
    case "slap":
      search.slap(ctx);
      if (isCb) {
        const strs = [
          "Slap me harder!",
          "Slap me harder, daddy!",
          "Yes Sir!",
          "Use me Senpai!",
          "Choke me harder!",
          "Choke me harder, daddy!",
          "Do you like what you see?",
          "Ass we can",
          "Oh ho ho ganging up",
          "Warum liegt hier überhaupt Stroh?",
          "Warum hast du `ne Maske auf?",
          "Rip the skin",
          "Fisting is 300 bucks",
          "Deep dark fantasies",
        ];
        const randStr = strs[Math.floor(Math.random() * strs.length)];
        ctx.answerCbQuery(randStr, true);
      }
      break;
    case "configure":
      dashboard.config(telegrafFunction, userId);
      if (isCb) {
        ctx.answerCbQuery("Here you can customize your Dashboard!");
      }
      break;
    case "show":
      if (isCb) {
        ctx.answerCbQuery("This will be shown on your Dashboard!", true);
      }
      break;
    case "hide":
      if (isCb) {
        ctx.answerCbQuery("This will not be shown on your Dashboard!", true);
      }
      break;
    default:
      if (isCb) {
        ctx.answerCbQuery(command);
      }
      break;
  }
}

export function handleErr(err) {
  if (err.code != 400) {
    console.log("[HANDLE ERROR]: ", err);
  }
}
