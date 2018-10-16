import { Command } from "../command";
import { utils } from "../../util/utils";
import { FullKeyboard } from "../../util/fullKeyboard";
import { times } from "../handler";
import { users } from "../../api";

export class Sortie extends Command {
    constructor(command, keyboard) {
        super(command, keyboard ? keyboard : new FullKeyboard(command.id, [["missions", "modifiers"]]));
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
        const sortieSecs = sortie.variants.reduce((totalSecs, mission) =>
            totalSecs += parseInt(times.findTime(mission.missionType).avgSecs)
            , 0);
        const minutes = Math.floor(sortieSecs / 60);
        const seconds = Math.floor(sortieSecs - minutes * 60);
        return this.title + "\n" +
            sortie.variants.reduce(
                (str, mission, ind) => str += this.translateSortieMission(mission, sortie.boss, ind + 1) + "\n", "") +
            utils.tab(6) + utils.italic("Resets " + utils.fromNow(sortie.expiry)) + "\n\n" +
            "Expected completion time: \n"+ utils.tab(12) + utils.bold((minutes + 3) + "m " + seconds + "s");
    }

    translateSortieMission(mission, boss, index) {
        return utils.bold(index + ". " +
            (utils.isAssassination(mission.missionType)
                ? mission.missionType + " - " + boss.replace(/\b\w/g, l => l.toUpperCase()) + " [" + time.findTime(boss, true).string + "]"
                : mission.missionType) + " [" + times.findTime(mission.missionType).string + "]") + "\n" +
            utils.tab(6) + utils.code(mission.modifier.toUpperCase().split(":").join("\n" + utils.tab(3)));
    }

    notify(id, boolean) {
        users.db.find({ id: id }).assign({ notifySortie: boolean }).write();
    }
}