import { CheckCommand } from "../checkCommand";
import { utils } from "../../util/utils";
import { AlertKeyboard } from "../../util/fullKeyboard";
import { users } from "../../api";

export class Bounties extends CheckCommand {
  constructor(command) {
    super(command);
    this.syndicateList = ["Ostrons", "Solaris United"];
  }

  rewards(ignoreCredits) {
    if (this.json) {
      return this.jobs.reduce(
        (rewards, check) =>
          rewards.concat({
            id: check.id,
            check: check,
            rewards: this.parseItems(this.rewardsOfCheck(check, ignoreCredits)),
            message: this.translateCheck(check, true),
          }),
        [],
      );
    }
  }

  get extra() {
    let ex = []
    this.syndicates.forEach(syndicate => {
      if (syndicate.jobs.length > 0) {
        ex.push(utils.italic(syndicate.syndicate + " bounties expire " + utils.fromNow(syndicate.expiry)));
      }
    })
    return (
      "\n" + ex.join("\n"));
  }

  get ids() {
    return this.jobs.map(c => c.id);
  }

  get syndicates() {
    const syndicates = this.json;//.filter(s => this.syndicateList.includes(s.syndicate));
    return syndicates
  }

  get jobs() {
    let jobs = [];
    this.syndicates.forEach(syndicate => {
      syndicate.jobs.forEach(job => {
        jobs.push(job);
      })
    });
    return jobs;
  }

  translateCheck(job, { allRewards, filtered } = {}) {
    return this.translateJob(job, allRewards);
  }

  count(c) {
    return "(" + c + "/" + this.jobs.length + ")\n";
  }

  translate(checks, filtered, id) {
    const cmds = filtered
      ? this.check(id, { ignoreCredits: false, ignoreNotified: true }).map(
        c => c.check,
      )
      : this.jobs;

    const msg = cmds.reduce(
      (str, check) =>
        (str += this.translateCheck(check, { filtered })
          ? this.translateCheck(check, { filtered }) + "\n"
          : ""),
      "",
    );
    if (msg || !filtered) {
      return (
        this.title +
        this.count(cmds.length) +
        "\n" +
        msg +
        this.extra
      );
    } else {
      return "";
    }
  }

  rewardsOfCheck(job, ignoreCredits) {
    if (Array.isArray(job.rewardPool)) {
      return job.rewardPool.filter(r =>
        ignoreCredits ? !r.includes("Credits Cache") : true,
      );
    }
    return [];
  }

  translateJob(job, allRewards = true) {
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
        (Array.isArray(job.rewardPool)
          ? allRewards
            ? job.rewardPool.join(" | ").toUpperCase()
            : "..." +
            job.rewardPool
              .slice(-2)
              .join(" | ")
              .toUpperCase()
          : typeof job.rewardPool == "string"
            ? job.rewardPool
            : ""),
      )
    );
  }
}
