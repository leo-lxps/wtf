

import { Command } from "../command";
import { handleErr } from "../handler";

export class Update extends Command {
    constructor(command) {
        super(command);
    }

    /**
     * execute command
     */
    execute(telegrafFunction, userId) {
        if (userId && this.needsAdmin && !this.isAdmin(userId)) {
            telegrafFunction("User not an admin!").catch(err =>
                handleErr(err),
            );
        } else {
            const exec = require('child_process').exec;
            exec('sh ./update.sh',
                (error, stdout, stderr) => {
                    console.log(`${stdout}`);
                    console.log(`${stderr}`);
                    telegrafFunction(`${stdout}`).catch(err =>
                        handleErr(err),
                    );
                    if (error !== null) {
                        console.log(`exec error: ${error}`);
                    }
                });
        }
    }
}