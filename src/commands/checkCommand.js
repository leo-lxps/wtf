import { Command } from "./command";
import { FullKeyboard } from "../util/fullKeyboard";
import { items } from "./handler";
import { users, notifications } from "../api";
import { utils } from "../util/utils";


export class CheckCommand extends Command {
    constructor(command, keyboard) {
        super(command, keyboard ? keyboard : new FullKeyboard(command.id, [["invasions", "bounties", "events"]]))
    }

    get message() {
        if (this.json) {
            return this.translate(this.json)
        }
    }

    async execute(telegramFunction) {
        telegramFunction(await this.message, this.telegraf);
    }

    get ids() {
        if (this.json) {
            return this.json.map(c => c.id)
        }
    }

    translate(checks) {
        return this.title + "\n" + checks.reduce(
            (str, check, index) =>
                str += this.translateCheck(check, index + 1)
                    ? this.translateCheck(check, index + 1) + "\n"
                    : ""
            , "")
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
                                && !foundChecks.includes(check.message)) {
                                foundChecks.push(check.message);
                            }
                        });
                    }
                });
            });
        }
        return foundChecks;
    }

    alert(telegramFunction, id, { ignoreCredits, ignoreNotified }
        = { ignoreCredits: false, ignoreNotified: false }) {
        if (users.db.find({ id: id }).value().notifyAlerts) {
            const messages = this.check(id, { ignoreCredits, ignoreNotified });
            if (messages.length > 0) {
                telegramFunction(messages.reduce((str, msg) => str += msg + "\n", ""), this.telegraf);
            } else if (ignoreNotified) {
                telegramFunction(utils.bold("You have no " + this.id + " with current Filter."), this.telegraf);
            }
        } else {
            telegramFunction(utils.bold("You have alerts turned off in Settings"), this.telegraf);
        }
    }
}