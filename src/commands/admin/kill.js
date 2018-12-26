import { Command } from "../command";
import { handleErr } from "./handler";

export class Kill extends Command {
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
      // shutdown.js

      // Require child_process
      var exec = require('child_process').exec;

      // Create shutdown function
      function shutdown(callback) {
        exec('shutdown now', function (error, stdout, stderr) { callback(stdout); });
      }

      telegrafFunction("Shutting down!").then(m => {
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
