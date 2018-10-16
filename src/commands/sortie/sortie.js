import { Command } from "../command";
import { utils } from "../../util/utils";
import { FullKeyboard } from "../../util/fullKeyboard";

export class Sortie extends Command {
    constructor(command) {
        super(command, new FullKeyboard(command.id, [["missions", "modifiers"]]));
    }

    get message() {
        return new Promise(res => this.json.then(sortie => {
            res(this.translate(sortie))
        }));
    }

    async execute(telegramFunction) {
        telegramFunction(await this.message, this.telegraf);
    }

    translate(sortie) {
        return this.title + "\n" +
            sortie.variants.reduce(
                (str, mission, ind) => str += this.translateSortieMission(mission, ind + 1) + "\n", "") +
            utils.tab(6) + utils.italic("Resets " + utils.fromNow(sortie.expiry));
    }

    translateSortieMission(mission, index) {
        return utils.bold(index + ". " + mission.missionType) + "\n" +
            utils.tab(6) + utils.code(mission.modifier.toUpperCase().split(":").join("\n" + utils.tab(8)));
    }
}