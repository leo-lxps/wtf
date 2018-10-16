import { FullKeyboard } from "../../util/fullKeyboard";
import { Sortie } from "./sortie";
import { utils } from "../../util/utils";

export class Modifiers extends Sortie {
    constructor(command) {
        super(command, new FullKeyboard(command.id, [["missions", "modifiers"]]));
    }

    translateSortieMission(mission, boss, index) {
        return utils.bold(index + ". " +
            (utils.isAssassination(mission.missionType)
                ? mission.missionType + " - " + boss.replace(/\b\w/g, l => l.toUpperCase())
                : mission.missionType)) + "\n" +
            utils.tab(6) + utils.code(mission.modifier.toUpperCase().split(":").join("\n" + utils.tab(3))) + "\n" +
            utils.italic(mission.modifierDescription) + "\n";
    }

}