import { utils } from "../util/utils";
import { info } from "../api";

export class Command {
    constructor(command, keyboard) {
        this.command = command;
        const { id, help } = command;
        if (!id) {
            throw "Id for Command not defined"
        }
        this.ID = id
        this.h = help
        this.msg = "No message set"
        this.keyboard = keyboard;
        this.title = utils.bold(id.toUpperCase());
    }

    set message(msg) {
        this.msg = msg;
    }

    get message() {
        return this.message;
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
        if (this.command.sub) {
            return new Promise(res =>
                info.wfs({ sub: this.command.sub })
                    .then(json => res(json))
            )
        } else {
            return new Promise(res =>
                info.wfs({ fixed: this.command.fixed })
                    .then(json => res(json))
            )
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