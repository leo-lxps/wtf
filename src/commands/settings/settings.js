import { Command } from "../command";
import { FullKeyboard } from "../../util/fullKeyboard";
import { users } from "../../api";

export class Missions extends Command {
    constructor(command) {
        super(command, new FullKeyboard(command.id, [["missions", "modifiers"]]));
    }

}