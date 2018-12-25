

import { Command } from "../command";

export class Update extends Command {
    constructor(command) {
        super(command);
    }

    /**
     * execute command
     */
    execute(telegrafFunction, userId) {
        if (userId && this.needsAdmin && !this.isAdmin(userId)) {
            telegrafFunction("User not an admin!", this.telegraf).catch(err =>
                handleErr(err),
            );
        } else {
            const shell = require('shelljs');
            shell.exec('./update.sh');
        }
    }
}