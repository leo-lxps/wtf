import { Command } from "../command";
import { utils } from "../../util/utils";
import { FullKeyboard } from "../../util/fullKeyboard";
import { state } from "../../api";
import { times } from "../handler";

export class Missions extends Command {
    constructor(command) {
        super(command, new FullKeyboard(command.id, [["missions", "modifiers"]]));
    }

    get json() {
        return state.missionTypes;
    }

    message() {
        return new Promise(res => this.translate(res));
    }

    async execute(telegramFunction) {
        telegramFunction(await this.message(), this.telegraf);
    }

    get missions() {
        if (this.json) {
            const keys = Object.keys(this.json);
            return keys.map(key => this.json[key].value);
        }
    }

    get bosses() {
        const fixedSortie = state.sortie;
        const keys = Object.keys(fixedSortie.bosses);
        return keys.map(key => fixedSortie.bosses[key].name);
    }

    translate(res) {
        const missions = this.missions;
        const bosses = this.bosses;
        const pMissions = times.findTimes(missions);
        const pBosses = times.findTimes(bosses, true);
        const bossesStr = pBosses.reduce((str, boss) =>
            str += boss.time
                ? utils.tab(6) + "`>` " + utils.italic(boss.name) + utils.code(" [" + boss.time + "]") + "\n"
                : "",
            "");
        res(this.title + "\n" +
            pMissions.reduce((str, mission) => {
                str += mission.name && mission.time
                    ? "`>` " + utils.bold(mission.name) + utils.code(" [" + mission.time + "]") + "\n"
                    : ""
                if (utils.isAssassination(mission.name)) {
                    str += bossesStr;
                }
                return str;
            },
                "")
        )
    }
}