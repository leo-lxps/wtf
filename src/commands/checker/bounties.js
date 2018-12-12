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
      return this.bounties.jobs.reduce(
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
    return (
      "\n" + utils.italic("Expires " + utils.fromNow(this.bounties.expiry))
    );
  }

  get ids() {
    if (this.bounties) {
      return this.bounties.jobs.map(c => c.id);
    }
    return [];
  }

  get syndicates() {
    return this.json.filter(s => this.syndicateList.includes(s.syndicate));
  }

  get bounties() {
    const solarSynd = this.json.find(s => s.syndicate == "Solaris United");
    const ostrSynd = this.json.find(s => s.syndicate == "Ostrons");
    if (ostrSynd.jobs.length > 0 && solarSynd.jobs.length > 0) {
      console.log(ostrSynd.jobs.concat(solarSynd.jobs).length);
      return ostrSynd.jobs.concat(solarSynd.jobs);
    }
    return ostrSynd;
  }

  get jobs() {
    let jobs = [];
    if (this.syndicates) {
      this.syndicates.forEach(syndicate => {
        jobs.concat(syndicate.jobs);
      });
    }
    return jobs;
  }

  translateCheck(job, { allRewards, filtered } = {}) {
    return this.translateJob(job, allRewards);
  }

  count(c) {
    return "(" + c + "/" + this.bounties.jobs.length + ")\n";
  }

  translate(checks, filtered, id) {
    const cmds = filtered
      ? this.check(id, { ignoreCredits: false, ignoreNotified: true }).map(
        c => c.check,
      )
      : checks.find(s => s.syndicate == "Ostrons").jobs;

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
        "\n" +
        utils.italic("Expires " + utils.fromNow(this.bounties.expiry))
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
