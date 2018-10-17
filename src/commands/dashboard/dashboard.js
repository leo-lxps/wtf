import { Command } from "../command";
import { FullKeyboard } from "../../util/fullKeyboard";

export class Dashboard extends Command {
    constructor(command, commands) {
        super(command, new FullKeyboard(command.id));
        this.commands = commands;
        this.separator = "\n\n";
    }

    get message() {
        return this.commands.map(cmd => cmd.message);
    }

    async execute(telegramFunction) {
        telegramFunction(
            this.title + "\n" +
            this.message.join(this.separator), this.telegraf
        )

    }
}

