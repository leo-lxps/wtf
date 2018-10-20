import { Command } from "../command";
import { utils } from "../../util/utils";
import { FullKeyboard } from "../../util/fullKeyboard";
import { times } from "../handler";
import { users, state, notifications } from "../../api";
import moment from "moment";

export class Trader extends Command {
  constructor(command, keyboard) {
    super(
      command,
      keyboard
        ? keyboard
        : new FullKeyboard(command.id, [["trader", "updates"]]),
    );
    this.dayEmote = "☀";
    this.nightEmote = "🌙";
  }

  message() {
    if (this.json) {
      return this.translate(this.json);
    }
  }

  alert(telegrafFunction) {
    const savedIDS = notifications.ids;
    const canFire = this.ids.reduce(
      (b, id) => (b = !savedIDS.includes(id) && b),
      true,
    );
    if (canFire) {
      this.execute(telegrafFunction);
    }
  }

  get ids() {
    if (this.json) {
      return [this.json.id];
    }
  }

  notify(id, boolean) {
    users.db
      .find({ id: id })
      .assign({ notifyTrader: boolean })
      .write();
  }

  translate(trader) {
    let message = this.title + "\n";
    if (trader.active) {
      message +=
        utils.bold("Location: ") +
        utils.code(trader.location) +
        "\n" +
        trader.inventory.reduce(
          (str, t) =>
            (str +=
              "\t\t\t-\t" +
              utils.italic(t.item) +
              utils.code(" [" + t.ducats + "d + " + t.credits + "cr]\n")),
          "",
        ) +
        "\n" +
        utils.italic("Leaves " + moment(trader.expiry).fromNow());
    } else {
      message +=
        utils.bold("\nWill be at:\t\t") +
        utils.code(trader.location) +
        "\n" +
        utils.italic("Arrives " + moment(trader.activation).fromNow());
    }
    return message;
  }
}
