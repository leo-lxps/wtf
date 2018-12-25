

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
            telegrafFunction("Rebooting!").then(m => {
                const exec = require('child_process').exec;
                var yourscript = exec('sh reboot.sh',
                    (error, stdout, stderr) => {
                        console.log(`${stdout}`);
                        console.log(`${stderr}`);
                        if (error !== null) {
                            console.log(`exec error: ${error}`);
                        }
                    });
            }).catch(err =>
                handleErr(err),
            );
        }
    }
}