import { CheckCommand } from "../checkCommand";
import { utils } from "../../util/utils";

export class Events extends CheckCommand {
  constructor(command) {
    super(command);
  }

  translateCheck(e) {
    const noReward = "No reward";
    const desc = e =>
      utils.code("━┫ ") +
      (e.description
        ? utils.bold(e.description) +
          (e.faction ? "\n" + utils.tab(12) + e.faction : "") +
          "\n"
        : e.tooltip
          ? utils.bold(e.tooltip.replace("Tool Tip", "")) + "\n"
          : e.faction
            ? "\n" + utils.tab(12) + e.faction + "\n"
            : utils.bold("Unknown Event\n"));
    const score = e =>
      e.scoreLocTag
        ? e.scoreLocTag +
          " " +
          (e.maximumScore ? ": `" + e.maximumScore + "`" : "") +
          "\n" +
          utils.tab(6)
        : "";
    const rewards = e =>
      e.rewards
        ? Array.isArray(e.rewards)
          ? e.rewards.length > 0
            ? utils.bold("Rewards: \n") +
              utils.code(
                utils.tab(6) +
                  e.rewards
                    .reduce((s, r) => {
                      if (typeof r == "string" || r instanceof String) {
                        s.push(r);
                      } else {
                        if (r.asString) {
                          s.push(r.asString);
                        } else if (r.itemsStr) {
                          s.push(r.itemsStr);
                        } else {
                          s.push(noReward);
                        }
                      }
                      return s;
                    }, [])
                    .map(s => s.toUpperCase())
                    .join("\n" + utils.tab(6)),
              ) +
              "\n"
            : e.jobs
              ? e.jobs.length > 0
                ? e.jobs.reduce(
                    (str, e, i) => (str += this.translateJob(e) + "\n"),
                    "",
                  )
                : noReward
              : noReward
          : typeof e.rewards == "string" || e.rewards instanceof String
            ? e.rewards
            : noReward
        : e.jobs
          ? e.jobs.length > 0
            ? e.jobs.reduce(
                (str, e, i) => (str += this.translateJob(e) + "\n"),
                "",
              )
            : noReward
          : noReward;
    const node = e =>
      e.node ? utils.italic("Battle on " + e.node) + "\n" : "";
    const remain = e =>
      e.health ? " | " + utils.code(e.health + "%") + " Remaining\n" : "";
    return (
      desc(e) +
      utils.tab(6) +
      score(e) +
      utils.tab(3) +
      rewards(e) +
      utils.tab(6) +
      node(e) +
      utils.tab(3) +
      utils.italic("Ends " + utils.fromNow(e.expiry)) +
      remain(e) +
      "\n"
    );
  }

  translateJob(job) {
    return (
      utils.code("━┫ ") +
      utils.bold(
        job.type +
          " (" +
          job.enemyLevels[0] +
          " - " +
          job.enemyLevels[1] +
          ") [" +
          job.standingStages.reduce((sum, s) => (sum += s), 0) +
          "]",
      ) +
      "\n" +
      utils.code(
        utils.tab(3) +
          job.rewardPool
            .reduce(
              (str, r, i) =>
                (i + 1) % 2 == 0
                  ? (str += r + ",\n" + utils.tab(3))
                  : (str += r + ", "),
              "",
            )
            .toUpperCase(),
      )
    );
  }

  rewardsOfCheck(event, ignoreCredits) {
    if (event.jobs) {
      return event.jobs.reduce((rew, j) => rew.concat(j.rewardPool), []);
    } else if (event.rewards) {
      if (Array.isArray(event.rewards)) {
        return event.rewards.reduce(
          (rew, j) => rew.concat(ignoreCredits ? j.itemString : j.asString),
          [],
        );
      }
    }

    return [];
  }
}
