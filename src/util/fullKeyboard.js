import { Keyboard } from "./keyboard";

let layout = [
    ["dashboard", "sortie", "alerts"],
    ["infos", "settings", "search"]
]

export class FullKeyboard extends Keyboard {
    constructor(selected, extra) {
        super(extra ? extra.concat(layout) : layout, selected);


    }

    select(selected) {
        this.select = selected;
    }
}