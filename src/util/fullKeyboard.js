import { Keyboard } from "./keyboard";
import { utils } from "./utils";

let layout = [
  [utils.menu("menu")],
  ["dashboard", "sortie", "alerts"],
  ["infos", "settings", "search"],
];

export class FullKeyboard extends Keyboard {
  constructor(selected, extra) {
    super(extra ? extra.concat(layout) : layout, selected);
  }

  select(selected) {
    this.select = selected;
  }
}

export class AlertKeyboard extends FullKeyboard {
  constructor(selected, filtered) {
    super(selected, [
      [
        filtered
          ? { text: "ALL", callback_data: selected }
          : { text: "FILTER", callback_data: "filter." + selected },
      ],
      ["invasions", "bounties", "events"],
    ]);
  }
}
