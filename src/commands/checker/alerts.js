import { CheckCommand } from "../checkCommand";
import { utils } from "../../util/utils";
import { FullKeyboard } from "../../util/fullKeyboard";

export class Alerts extends CheckCommand {
    constructor(command) {
        super(command, new FullKeyboard(command.id, [["filter.alerts"],["invasions", "bounties", "events"]]))
    }

    translateCheck(alert, index) {
        return utils.bold(
            index + ". " + alert.mission.type +
            " (" + alert.mission.minEnemyLevel + " - " + alert.mission.maxEnemyLevel + ")") + "\n" +
            utils.tab(6) + utils.code(alert.mission.reward.asString.toUpperCase()) + "\n" +
            utils.tab(6) + utils.italic("Expires " + utils.fromNow(alert.expiry));
    }

    rewardsOfCheck(alert, ignoreCredits) {
        return ignoreCredits
            ? alert.mission.reward.itemString.split("+").map(r => r.toUpperCase().trim())
            : alert.mission.reward.asString.split("+").map(r => r.toUpperCase().trim());
    }
}