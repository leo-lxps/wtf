import { Command } from "../command";
import { utils } from "../../util/utils";
import { FullKeyboard } from "../../util/fullKeyboard";
import { times } from "../handler";
import { users, state } from "../../api";
import moment from "moment";


export class Trader extends Command {
    constructor(command, keyboard) {
        super(command, keyboard ? keyboard : new FullKeyboard(command.id, [["trader", "updates"]]));
        this.dayEmote = "☀";
        this.nightEmote = "🌙";
    }

    get message() {
        if (this.json) {
            return this.translate(this.json)
        }
    }

    translate(trader) {
        let message = this.title + "\n"
        if (trader.active) {
            message +=
                utils.italic("Leaves " +
                    moment(trader.expiry).fromNow()) +
                utils.bold("\nLocation:\t\t") +
                utils.code(trader.location) + "\n" +
                trader.inventory.reduce(
                    (str, t) =>
                        (str +=
                            "\t\t\t-\t" +
                            utils.italic(t.item) +
                            utils.code(" (" +
                                t.ducats +
                                "d, " +
                                t.credits +
                                "cr)\n")),
                    ""
                );

        } else {
            message +=
                utils.italic("Arrives " +
                    moment(trader.activation).fromNow()) +
                utils.bold("\nWill be at:\t\t") +
                utils.code(trader.location) +
                "\n";
        }
        return message;
    }

}