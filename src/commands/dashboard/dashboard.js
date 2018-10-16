import { Command } from "../command";
import { FullKeyboard } from "../../util/fullKeyboard";

export class Dashboard extends Command {
    constructor(command, commands) {
        super(command, new FullKeyboard(command.id));
        this.commands = commands;
        this.separator = "\n\n";
    }

    get message() {
        var promises = this.commands.map(
            cmd => new Promise(
                res => cmd.json.then(json => {
                    res(cmd.translate(json))
                })
            )
        );
        return Promise.all(promises);
    }

    async execute(telegramFunction) {
        await this.message.then(v =>
            telegramFunction(
                this.title + "\n" +
                v.join(this.separator), this.telegraf
            )
        );
    }
}

