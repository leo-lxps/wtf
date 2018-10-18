import { CheckCommand } from "../checkCommand";
import { utils } from "../../util/utils";
import { FullKeyboard, AlertKeyboard } from "../../util/fullKeyboard";

export class Events extends CheckCommand {
    constructor(command) {
        super(command)
    }

    translateCheck(e, index) {
        const noReward = "No reward";
        const desc = e =>
            e.description
                ? "*" +
                e.description +
                "*" +
                (e.faction ? ": " + e.faction : "") +
                "\n"
                : e.tooltip
                    ? "*" + e.tooltip.replace("Tool Tip", "") + "*\n"
                    : e.faction
                        ? "*" + e.faction + "*\n"
                        : "*Unknown Event:*\n";
        const score = e =>
            e.scoreLocTag
                ? e.scoreLocTag +
                " " +
                (e.maximumScore ? ": `" + e.maximumScore + "`" : "") +
                "\n" + utils.tab(6)
                : "";
        const rewards = e =>
            e.rewards
                ? Array.isArray(e.rewards)
                    ? e.rewards.length > 0
                        ? e.rewards.reduce(
                            (s, r) =>
                                (s +=
                                    typeof r == "string" || r instanceof String
                                        ? r + " + "
                                        : r.asString
                                            ? r.asString
                                            : r.itemString
                                                ? r.itemsStr + r.credits
                                                    ? " + " + r.credits + "cr"
                                                    : ""
                                                : noReward),
                            "*Rewards*: \n\t\t\t\t\t\t`"
                        ) + "`\n"
                        : e.jobs
                            ? e.jobs.length > 0
                                ? e.jobs.reduce((str, e, i) =>
                                    str += this.translateJob(e, i + 1) + "\n", "")
                                : noReward
                            : noReward
                    : typeof e.rewards == "string" || e.rewards instanceof String
                        ? e.rewards
                        : noReward
                : e.jobs
                    ? e.jobs.length > 0
                        ? e.jobs.reduce((str, e, i) =>
                            str += this.translateJob(e, i + 1) + "\n", "")
                        : noReward
                    : noReward
        const node = e => (e.node ? "_Battle on " + e.node + "_\n" : "");
        const remain = e => (e.health ? "`" + e.health + "%` Remaining\n" : "");
        return desc(e) +
            score(e) +
            rewards(e) +
            utils.tab(6) +
            node(e) +
            utils.italic("Ends " + utils.fromNow(e.expiry)) +
            " | " +
            remain(e);

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

    rewardsOfCheck(event) {
        return event.jobs.reduce((rew, j) =>
            rew.concat(j.rewardPool), [])
    }
}