import { users, notifications } from "../../api";
import { utils } from "../../util/utils";
import { Command } from "../command";
import { FullKeyboard } from "../../util/fullKeyboard";

export class Updates extends Command {
  constructor(command) {
    super(command, new FullKeyboard(command.id, [["trader", "updates"]]));
  }

  message() {
    const lastUpdate = this.lastUpdate;
    this.keyboard = new FullKeyboard(this.command.id, [
      [{ text: "PATCHNOTES", url: lastUpdate.link }],
      ["trader", "updates"],
    ]);
    return (
      this.title +
      "\n" +
      utils.bold(lastUpdate.message) +
      "[⠀](" +
      lastUpdate.imageLink +
      ")" +
      "\n" +
      utils.tab(6) +
      utils.italic("Released " + utils.fromNow(lastUpdate.date))
    );
  }

  get lastUpdate() {
    if (this.json) {
      return this.json.filter(n => n.update)[0];
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
      return this.json.filter(n => n.update).map(n => n.id);
    }
  }

  notify(id, boolean) {
    users.db
      .find({ id: id })
      .assign({ notifyUpdates: boolean })
      .write();
  }
}
