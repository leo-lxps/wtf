import { Command } from "./command";
import { FullKeyboard } from "../util/fullKeyboard";
import { items } from "./handler";
import { users } from "../api";
import { utils } from "../util/utils";


export class CheckCommand extends Command {
    constructor(command, keyboard) {
        super(command, keyboard ? keyboard : new FullKeyboard(command.id, [["invasions", "bounties", "events"]]))
    }

    get message() {
        return new Promise(res => this.json.then(checks => {
            res(this.translate(checks))
        }));
    }

    async execute(telegramFunction) {
        telegramFunction(await this.message, this.telegraf);
    }

    get ids() {
        return new Promise(res => this.json.then(check => res(check.map(c => c.id))))
    }

    translate(checks) {
        return this.title + "\n" + checks.reduce(
            (str, check, index) =>
                str += this.translateCheck(check, index + 1)
                    ? this.translateCheck(check, index + 1) + "\n"
                    : ""
            , "")
    }

    /**
     * Translate a check object to string
     *
     * @param {check} check type of check
     * @param {number} index place in array
     * @returns {String}
     */
    translateCheck(check, index) {
        throw Error("translateCheck is not implemented")
    }

    rewardsOfCheck(check, ignoreCredits) {
        throw Error("rewardsOfCheck is not implemented")
    }

    rewards(ignoreCredits) {
        return new Promise(res => {
            this.json.then(checks => {
                res(checks.reduce((rewards, check, index) =>
                    rewards.concat(
                        {
                            rewards: this.parseItems(this.rewardsOfCheck(check, ignoreCredits)),
                            message: this.translateCheck(check, index + 1)
                        }
                    ), [])
                )
            })
        });
    }

    check(id, ignoreCredits) {
        let foundChecks = [];
        const items_ = items.get(id);
        return new Promise(res => {
            this.rewards(ignoreCredits).then(checks => {
                items_.forEach(item => {
                    checks.forEach(check => {
                        check.rewards.forEach(reward => {
                            if (reward.includes(item) && !foundChecks.includes(check.message)) {
                                foundChecks.push(check.message);
                            }
                        });
                    });
                });
                res(foundChecks);
            });
        });
    }

    alert(telegramFunction, id, ignoreCredits) {
        if (users.db.find({ id: id }).value().notifyAlerts) {
            this.check(id, ignoreCredits).then(messages => {
                if (messages.length > 0) {
                    telegramFunction(messages.reduce((str, msg) => str += msg + "\n", ""), this.telegraf);
                } else {
                    telegramFunction(utils.bold("No " + this.id + " with current filter."), this.telegraf);
                }
            })
        } else {
            telegramFunction(utils.bold("You have alerts turned off in Settings"), this.telegraf);
        }
    }
}