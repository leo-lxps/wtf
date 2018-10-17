import { Command } from "../command";
import { utils } from "../../util/utils";
import { FullKeyboard } from "../../util/fullKeyboard";
import { times } from "../handler";
import { users, state } from "../../api";
import moment from "moment";


export class Infos extends Command {
    constructor(command, keyboard) {
        super(command, keyboard ? keyboard : new FullKeyboard(command.id, [["trader", "updates"]]));
        this.dayEmote = "☀";
        this.nightEmote = "🌙";
    }

    get message() {
        return this.translate()
    }

    translate() {
        return this.title + "\n" +
            this.cetusCircle + "\n" +
            this.earthCircle + "\n\n" +
            this.constructionProgress + "\n\n" +
            this.serverReset
    }

    get earthCircle() {
        if (state.ws) {
            const ec = state.ws.earthCycle;
            return utils.bold("Earth: ") +
                (ec.isDay ? this.dayEmote : this.nightEmote) + " " +
                utils.italic(ec.timeLeft);
        }
    }

    get cetusCircle() {
        if (state.ws) {
            const cc = state.ws.cetusCycle;
            return utils.bold("Cetus: ") +
                (cc.isDay ? this.dayEmote : this.nightEmote) + " " +
                utils.italic(cc.timeLeft);
        }
    }

    get constructionProgress() {
        if (state.ws) {
            const cp = state.ws.constructionProgress;
            return "Formorian production progress: " + utils.code(cp.fomorianProgress) + "%\n" +
                "Razorback production progress: " + utils.code(cp.razorbackProgress) + "%\n" +
                "Other unknown progress: " + utils.code(cp.unknownProgress) + "%";
        }
    }

    get serverReset() {
        return utils.italic("Next server day " + moment().utc().endOf("day").fromNow());
    }

}