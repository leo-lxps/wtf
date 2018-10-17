import { Command } from "../command";
import { FullKeyboard } from "../../util/fullKeyboard";
import { users } from "../../api";
import { utils } from "../../util/utils";

export class Settings extends Command {
    constructor(command) {
        super(command, new FullKeyboard(command.id, [["turn sortie notif's off"], ["turn alert notif's off"]]));
    }

    execute(telegramFunction, id) {
        this.message = this.title + "\n" +
            utils.italic("Change your settings here!");

        const user = users.db.find({ id: id }).value();

        const on = (b) => b ? ">" + "ON" : "ON";
        const off = (b) => !b ? ">" + "OFF" : "OFF";

        const sortieKeys = [
            { text: "Sortie Notifications:", callback_data: "sortieNotifications" },
            { text: on(user.notifySortie), callback_data: "sortieOn" },
            { text: off(user.notifySortie), callback_data: "sortieOff" }];

        const alertKeys = [
            { text: "Alert Notifications:", callback_data: "alertsNotifications" },
            { text: on(user.notifyAlerts), callback_data: "alertOn" },
            { text: off(user.notifyAlerts), callback_data: "alertOff" }];

        const updateKeys = [
            { text: "Update Notifications:", callback_data: "updateNotifications" },
            { text: on(user.notifyUpdates), callback_data: "updateOn" },
            { text: off(user.notifyUpdates), callback_data: "updateOff" }];

        const traderKeys = [
            { text: "Update Notifications:", callback_data: "updateNotifications" },
            { text: on(user.notifyUpdates), callback_data: "updateOn" },
            { text: off(user.notifyUpdates), callback_data: "updateOff" }];

        const separator = ["⸻"]

        this.keyboard = new FullKeyboard(
            this.command.id, [sortieKeys, alertKeys, updateKeys, separator]
        );

        telegramFunction(this.message, this.telegraf);
    }

}