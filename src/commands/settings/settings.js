import { Command } from "../command";
import { FullKeyboard } from "../../util/fullKeyboard";
import { users } from "../../api";
import { utils } from "../../util/utils";

export class Settings extends Command {
    constructor(command) {
        super(command, new FullKeyboard(command.id, [["turn sortie notif's off"], ["turn alert notif's off"]]));
    }

    execute(telegramFunction, id) {

        const user = users.db.find({ id: id }).value();

        const on = (b) => b ? "⬤" : "◯";
        const off = (b) => !b ? "⬤" : "◯";

        let itemsKeys = user.items ? user.items.map((item, i) =>
            [{ text: item.toUpperCase(), callback_data: "remove." + i }]
            , []) : []

        if (itemsKeys.length > 0) {
            itemsKeys = [[utils.menu("remove")]].concat(itemsKeys.reduce((all, one, i) => {
                const ch = Math.floor(i / 2);
                all[ch] = [].concat((all[ch] || []), one);
                return all
            }, []))
        }


        const toggles = [utils.menu("options")];
        const infoOpt = ["NOTIFICATIONS", "ON", "OFF"];

        const sortieKeys = [
            { text: "SORTIE:", callback_data: "sortieNotifications" },
            { text: on(user.notifySortie), callback_data: "sortieOn" },
            { text: off(user.notifySortie), callback_data: "sortieOff" }];

        const alertKeys = [
            { text: "ALERTS:", callback_data: "alertsNotifications" },
            { text: on(user.notifyAlerts), callback_data: "alertOn" },
            { text: off(user.notifyAlerts), callback_data: "alertOff" }];

        const updateKeys = [
            { text: "UPDATES:", callback_data: "updateNotifications" },
            { text: on(user.notifyUpdates), callback_data: "updateOn" },
            { text: off(user.notifyUpdates), callback_data: "updateOff" }];

        const traderKeys = [
            { text: "TRADER:", callback_data: "traderNotifications" },
            { text: on(user.notifyTrader), callback_data: "traderOn" },
            { text: off(user.notifyTrader), callback_data: "traderOff" }];

        const configureDash = [{ text: "CONFIGURE DASHBOARD", callback_data: "configure" }]

        const fullExtra = itemsKeys.concat([toggles, infoOpt, sortieKeys, alertKeys, updateKeys, traderKeys, configureDash]);

        this.keyboard = new FullKeyboard(
            this.command.id, fullExtra
        );

        this.msg = this.title + "\n" +
            (itemsKeys.length > 0
                ? utils.bold("REMOVE ITEMS: ") + utils.italic("Click on items to remove them from your Filter.\n\n")
                : "") +
            utils.bold("OPTIONS: ") + utils.italic("Change your notification settings!");

        telegramFunction(this.message(), this.telegraf);
    }

}