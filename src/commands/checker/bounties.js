import { CheckCommand } from "../checkCommand";
import { utils } from "../../util/utils";

export class Bounties extends CheckCommand {
    constructor(command) {
        super(command)
    }

    translateCheck(bounties) {
        if (bounties.syndicate == "Ostrons") {
            return utils.bold(bounties.syndicate) + "\n" +
                bounties.jobs.reduce((str, job) => str += this.translateJob(job) + "\n", "") + "\n" +
                utils.italic("Expires " + utils.fromNow(bounties.expiry))
        }
        return "";
    }

    rewardsOfCheck(bounties) {
        if (bounties.syndicate == "Ostrons") {
            return bounties.jobs.reduce((res, j) => res.concat(j.rewardPool), [])
        }
        return [];
    }

    translateJob(job) {
        return utils.code("━┫ ") + utils.bold(job.type +
            " (" + job.enemyLevels[0] + " - " + job.enemyLevels[1] + ") [" +
            job.standingStages.reduce((sum, s) =>
                sum += s, 0
            ) + "]") + "\n" +
            utils.code(utils.tab(3) + "... " + job.rewardPool.slice(-2).join(" | ").toUpperCase())
    }
}