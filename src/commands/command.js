import { utils } from "../util/utils";
import { state } from "../api";
import { handleErr } from "./handler";

export class Command {
  constructor(command, keyboard) {
    this.command = command;
    const { id, help } = command;
    if (!id) {
      throw "Id for Command not defined";
    }
    this.ID = id;
    this.h = help;
    this.msg = "No message set";
    this.keyboard = keyboard;
    this.title = utils.title(id);
  }

  get inlineKeyboard() {
    return this.keyboard;
  }

  set inlineKeyboard(keyboard) {
    this.keyboard = keyboard;
  }

  message() {
    return this.msg;
  }

  get telegraf() {
    return this.keyboard.telegraf;
  }

  get inline() {
    return this.keyboard.inline;
  }

  get id() {
    return this.ID;
  }

  get help() {
    return this.h;
  }

  /**
   * execute command
   */
  execute(telegrafFunction) {
    telegrafFunction(this.message(), this.telegraf).catch(err =>
      handleErr(err),
    );
  }

  addToMsg(messagePart) {
    this.msg = this.message() + messagePart;
  }

  translate(command) {
    throw Error("Translation for command [" + command.id + "] not implemented");
  }

  get json() {
    if (this.command.sub && state.ws) {
      return state.ws[this.command.sub];
    }
  }

  parseItems(items) {
    return items
      .filter(Boolean)
      .map(i => i.trim().toUpperCase())
      .filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
      });
  }
}
