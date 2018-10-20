import { Command } from "./command";
import { AlertKeyboard } from "../util/fullKeyboard";
import { items } from "./handler";
import { users, notifications } from "../api";
import { utils } from "../util/utils";


export class CheckCommand extends Command {
    constructor(command) {
        super(command, new AlertKeyboard(command.id))
    }

    message(filtered, id) {
        if (this.json) {
            return this.translate(this.json, filtered, id)
        }
    }

    async execute(telegramFunction) {
        this.inlineKeyboard = new AlertKeyboard(this.command.id, false);
        telegramFunction(await this.message(), this.telegraf);
    }

    get ids() {
        if (this.json) {
            return this.json.map(c => c.id)
        }
    }

    translate(checks, filtered, id) {
        const cmds = filtered
            ? this.check(id, { ignoreCredits: false, ignoreNotified: true })
                .map(c => c.check)
            : checks

        const msg = cmds.reduce(
            (str, check, index) =>
                str += this.translateCheck(check, index + 1)
                    ? this.translateCheck(check, index + 1) + "\n"
                    : ""
            , "");
        if (msg || !filtered) {
            return this.title + "\n" + msg;
        } else {
            return "";
        }
    }

    translateCheck(check, index) {
        throw Error("translateCheck is not implemented")
    }

    rewardsOfCheck(check, ignoreCredits) {
        throw Error("rewardsOfCheck is not implemented")
    }

    rewards(ignoreCredits) {
        if (this.json) {
            return this.json.reduce((rewards, check, index) =>
                rewards.concat(
                    {
                        id: check.id,
                        check: check,
                        rewards: this.parseItems(this.rewardsOfCheck(check, ignoreCredits)),
                        message: this.translateCheck(check, index + 1)
                    }
                ), [])
        }
    }

    check(id, { ignoreCredits, ignoreNotified }) {
        let foundChecks = [];
        if (this.json) {
            const items_ = items.get(id);
            const savedIDS = ignoreNotified ? [] : notifications.ids;
            items_.forEach(item => {
                this.rewards(ignoreCredits).forEach(check => {
                    if (!savedIDS.includes(check.id)) {
                        check.rewards.forEach(reward => {
                            if (reward.includes(item)
                                && !this.hasId(foundChecks, check.id)) {
                                foundChecks.push(check);
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

    alert(telegramFunction, id, { ignoreCredits, ignoreNotified }
        = { ignoreCredits: false, ignoreNotified: false }) {
        this.inlineKeyboard = new AlertKeyboard(this.command.id, true);
        if (users.db.find({ id: id }).value().notifyAlerts) {
            const messages = this.check(id, { ignoreCredits, ignoreNotified }).map(check => check.message);
            if (messages.length > 0) {
                telegramFunction(this.title + "\n" + messages.reduce((str, msg) => str += msg + "\n", ""), this.telegraf);
            } else if (ignoreNotified) {
                telegramFunction(this.title + "\n" + utils.bold("You have no " + this.id + " with current Filter."), this.telegraf);
            }
        } else {
            telegramFunction(utils.bold("You have alerts turned off in Settings"), this.telegraf);
        }
    }
}