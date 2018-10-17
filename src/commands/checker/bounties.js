import { CheckCommand } from "../checkCommand";
import { utils } from "../../util/utils";
import { FullKeyboard } from "../../util/fullKeyboard";

export class Bounties extends CheckCommand {
    constructor(command) {
        super(command, new FullKeyboard(command.id, [[{ text: "FILTER", callback_data: "filter.bounties" }],["invasions", "bounties", "events"]]))
    }

    translateCheck(bounties, index) {
        if (bounties.syndicate == "Ostrons") {
            return utils.bold(bounties.syndicate) + "\n" +
                bounties.jobs.reduce((str, job, index) => str += this.translateJob(job, index + 1) + "\n", "") +
                utils.tab(6) + utils.italic("Expires " + utils.fromNow(bounties.expiry))
        }
        return "";
    }

    rewardsOfCheck(bounties) {
        if (bounties.syndicate == "Ostrons") {
            return bounties.jobs.reduce((res, j) => res.concat(j.rewardPool), [])
        }
        return [];
    }

    translateJob(job, index) {
        return utils.bold(index + ". " + job.type +
            " (" + job.enemyLevels[0] + " - " + job.enemyLevels[1] + ") [" +
            job.standingStages.reduce((sum, s) =>
                sum += s, 0
            ) + "]") + "\n" +
            utils.code(utils.tab(3) + job.rewardPool.reduce((str, r, i) =>
                (i + 1) % 2 == 0
                    ? str += r + ",\n" + utils.tab(3)
                    : str += r + ", "
                , "").toUpperCase())
    }
}