import { users } from "../../api";
import { Command } from "../command";

export class Kill extends Command {
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
        // shut down
    }
  }
}
