import { utils } from "../util/utils";
import { state } from "../api";

export class Command {
    constructor(command, keyboard) {
        this.command = command;
        const { id, help } = command;
        if (!id) {
            throw "Id for Command not defined"
        }
        this.ID = id;
        this.h = help;
        this.msg = "No message set";
        this.keyboard = keyboard;
        this.title = "`━┫` " + utils.bold(id.toUpperCase()) + " `┣━`\n";
    }

    get inlineKeyboard() {
        return this.keyboard;
    }

    set inlineKeyboard(keyboard) {
        this.keyboard = keyboard
    }

    set message(msg) {
        this.msg = msg;
    }

    get message() {
        return this.msg;
    }

    get telegraf() {
        return this.keyboard.telegraf;
    }

    get inline() {
        return this.keyboard.inline;
    }

    get id() {
        return this.ID;
    }

    get help() {
        return this.h;
    }

    /**
     * execute command
     */
    execute(telegramFunction) {
        telegramFunction(this.message, this.telegraf);
    }

    addToMsg(messagePart) {
        this.message += messagePart;
    }

    translate(command) {
        throw Error("Translation for command [" + command.id + "] not implemented")
    }

    get json() {
        if (this.command.sub && state.ws) {
            return state.ws[this.command.sub]
        }
    }

    parseItems(items) {
        return items.filter(Boolean)
            .map(i => i.trim().toUpperCase())
            .filter(function (item, pos, self) {
                return self.indexOf(item) == pos;
            });
    }

}