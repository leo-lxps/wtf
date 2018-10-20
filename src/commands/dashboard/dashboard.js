import { Command } from "../command";
import { FullKeyboard } from "../../util/fullKeyboard";
import { users } from "../../api";
import { getCmd } from "../handler";
import { utils } from "../../util/utils";

export class Dashboard extends Command {
    constructor(command, commands, extra) {
        super(command, new FullKeyboard(command.id, extra));
        this.defaultCommands = ["sortie", "trader", "infos"];
        this.commands = commands;
        this.separator = "`┣━━━━━━━━━━`";
    }

    getUserItems(id) {
        const items = users.db.find({ id: id }).get("dashboardConfig").value();
        if (items) {
            return items;
        }
        this.setUserItems(id, this.defaultCommands);
        return this.defaultCommands;
    }

    setUserItems(id, items) {
        users.db.find({ id: id }).assign({ dashboardConfig: items }).write();
    }

    addItem(id, item) {
        users.db.find({ id: id }).get("dashboardConfig").push(item).write();
    }

    removeItem(id, item) {
        let items = this.getUserItems(id);
        const found = items.indexOf(item);
        if (found > -1) {
            items.splice(found, 1);
            this.setUserItems(id, items);
        }
    }

    /**
     * CONFIG DASHBOARD
     * SHOW     HIDE
     * <        alerts
     * <        bounties
     * <        invasions
     * <        events
     * sortie   >
     * trader   >
     * infos    >
     *
     */
    config(telegrafFunction, id) {

        const items = this.getUserItems(id);
        const cmdKey = (cmd) => items.includes(cmd)
            ? [cmd, { text: "►", callback_data: ">." + cmd }]
            : [{ text: "◄", callback_data: "<." + cmd },
                cmd];

        const extra = [[{ text: utils.menu("configure dashboard"), callback_data: "configure" }],
        ["SHOW", "HIDE"],
        cmdKey("alerts"),
        cmdKey("bounties"),
        cmdKey("invasions"),
        cmdKey("events"),
        cmdKey("sortie"),
        cmdKey("trader"),
        cmdKey("infos"),
        cmdKey("updates")];

        this.execute(telegrafFunction, id, extra);
    }

    message(id) {
        return this.commands.map(cmd =>
            getCmd(cmd).message(true, id))
            .filter(Boolean)
            .join("\n\n" + this.separator);
    }

    async execute(telegrafFunction, id, extra) {
        this.commands = this.getUserItems(id);
        this.inlineKeyboard = new FullKeyboard(this.command.id, extra);
        telegrafFunction(
            this.title + "\n" +
            this.separator + this.message(id), this.telegraf
        )

    }
}

