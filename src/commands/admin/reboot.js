import { Command } from "../command";

export class Reboot extends Command {
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
            // reboot.js

            // Require child_process
            var exec = require('child_process').exec;

            // Create shutdown function
            function shutdown(callback) {
                exec('shutdown -r now', function (error, stdout, stderr) { callback(stdout); });
            }
            telegrafFunction("Rebooting!", this.telegraf).then(m => {
                // Reboot computer
                shutdown(function (output) {
                    console.log(output);
                });
            }).catch(err =>
                handleErr(err),
            );

        }
    }
}