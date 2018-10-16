import { Command } from "../command";
import { FullKeyboard } from "../../util/fullKeyboard";
import { users } from "../../api";
import { utils } from "../../util/utils";

export class Items extends Command {
    constructor(command) {
        super(command, new FullKeyboard(command.id));
    }

    set(items, id) {
        if (id && items) {
            users.db.find({ id: id }).assign({ items: items.filter(Boolean) }).write();
        }
    }

    get(id) {
        return users.db.find({ id: id }).get("items").value();
    }

    assign(items, id) {
        if (id && items) {
            users.db.find({ id: id }).assign({ items: this.parseItems(items) }).write();
        }
    }

    add(items, id) {
        if (id && items) {
            this.notify(id, true);
            const newItems = this.parseItems(this.get(id).concat(items));
            this.assign(newItems, id);
        }
    }

    remove(items, id) {
        if (items && id) {
            this.notify(id, true);
            let items_ = this.get(id);
            this.parseItems(items).forEach(item => {
                console.log(item)
                const ind = items_.indexOf(item.toUpperCase());
                if (ind > -1 && ind < items_.length) {
                    items_.splice(ind, 1);
                }
            });
            this.assign(items_, id);
        }
    }

    execute(telegramFunction, userId) {
        telegramFunction(this.genMessage(userId), this.telegraf)
    }

    genMessage(userId) {
        const items = this.get(userId);
        if (items.length > 0) {
            return this.title + "\n" +
                items.reduce((str, item) => str += utils.tab(6) + utils.code(item) + "\n", "");
        } else {
            return this.title + "\n" +
                utils.italic("No Items in Filter!");
        }
    }

    notify(id, boolean) {
        users.db.find({ id: id }).assign({ notifyAlerts: boolean }).write();
    }

}