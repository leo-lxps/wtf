import { Command } from "./command";
import { AlertKeyboard } from "../util/fullKeyboard";
import { items, handleErr } from "./handler";
import { users, notifications } from "../api";
import { utils } from "../util/utils";

export class CheckCommand extends Command {
  constructor(command) {
    super(command, new AlertKeyboard(command.id));
    this.noFilter = "You have no " + this.id + " with current Filter.";
    this.alertsOff = "You have alerts turned off in Settings";
  }

  message(filtered, id) {
    if (this.json) {
      return this.translate(this.json, filtered, id);
    }
  }

  count(c) {
    return "(" + c + "/" + this.json.length + ")\n";
  }

  async execute(telegrafFunction, userId) {
    this.inlineKeyboard = new AlertKeyboard(
      this.command.id,
      users.isFiltered(userId),
    );
    const msg = await this.message(users.isFiltered(userId), userId);
    telegrafFunction(
      msg ? msg : this.title + "\n" + utils.bold(this.noFilter),
      this.telegraf,
    ).catch(err => handleErr(err));
  }

  get ids() {
    if (this.json) {
      return this.json.map(c => c.id);
    }
    return [];
  }

  translate(checks, filtered, id) {
    const cmds = filtered
      ? this.check(id, { ignoreCredits: false, ignoreNotified: true }).map(
          c => c.check,
        )
      : checks;

    const msg = cmds.reduce(
      (str, check, index) =>
        (str += this.translateCheck(check, index + 1)
          ? this.translateCheck(check, index + 1) + "\n"
          : ""),
      "",
    );
    if (msg || !filtered) {
      return this.title + this.count(cmds.length) + "\n" + msg;
    } else {
      return "";
    }
  }

  translateCheck(check, index) {
    throw Error("translateCheck is not implemented");
  }

  rewardsOfCheck(check, ignoreCredits) {
    throw Error("rewardsOfCheck is not implemented");
  }

  rewards(ignoreCredits) {
    if (this.json) {
      return this.json.reduce(
        (rewards, check, index) =>
          rewards.concat({
            id: check.id,
            check: check,
            rewards: this.parseItems(this.rewardsOfCheck(check, ignoreCredits)),
            message: this.translateCheck(check, index + 1),
          }),
        [],
      );
    }
  }

  check(id, { ignoreCredits, ignoreNotified }) {
    let foundChecks = [];
    let usedIds = [];
    if (this.json) {
      const items_ = items.get(id);
      const savedIDS = ignoreNotified ? [] : notifications.ids;
      items_.forEach(item => {
        this.rewards(ignoreCredits).forEach(check => {
          if (!savedIDS.includes(check.id)) {
            check.rewards.forEach(reward => {
              if (reward.includes(item) && !this.hasId(foundChecks, check.id)) {
                if (!usedIds.includes(check.id)) {
                  foundChecks.push(check);
                }
                usedIds.push(check.id);
              }
            });
          }
        });
      });
    }
    return foundChecks;
  }

  hasId(arr, id) {
    arr.forEach(i => {
      if (i.id == id) {
        return true;
      }
    });
    return false;
  }

  alert(
    telegrafFunction,
    id,
    { ignoreCredits, ignoreNotified } = {
      ignoreCredits: false,
      ignoreNotified: false,
    },
  ) {
    if (telegrafFunction) {
      this.inlineKeyboard = new AlertKeyboard(
        this.command.id,
        users.isFiltered(id),
      );
      if (users.db.find({ id: id }).value().notifyAlerts) {
        const messages = this.check(id, { ignoreCredits, ignoreNotified }).map(
          check => check.message,
        );
        if (messages.length > 0) {
          telegrafFunction(
            this.title +
              this.count(messages.length) +
              "\n" +
              messages.reduce((str, msg) => (str += msg + "\n"), "") +
              (this.extra ? this.extra : ""),
            this.telegraf,
          ).catch(err => handleErr(err));
        } else if (ignoreNotified) {
          telegrafFunction(
            this.title + "\n" + utils.bold(this.noFilter),
            this.telegraf,
          ).catch(err => handleErr(err));
        }
      } else {
        telegrafFunction(utils.bold(this.alertsOff), this.telegraf).catch(err =>
          handleErr(err),
        );
      }
    }
  }
}
