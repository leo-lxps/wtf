import { Command } from "../command";
import { utils } from "../../util/utils";
import { FullKeyboard } from "../../util/fullKeyboard";
import { info } from "../../api";
import { times } from "../handler";

export class Missions extends Command {
    constructor(command) {
        super(command, new FullKeyboard(command.id, [["missions", "modifiers"]]));
    }

    get message() {
        return new Promise(res => this.translate(res));
    }

    async execute(telegramFunction) {
        telegramFunction(await this.message, this.telegraf);
    }

    get missions() {
        return new Promise(res => this.json.then(missions => {
            const keys = Object.keys(missions);
            res(keys.map(key => missions[key].value));
        }));
    }

    get bosses() {
        return new Promise(res => info.wfs({ fixed: "/sortie" }).then(fixedSortie => {
            const keys = Object.keys(fixedSortie.bosses);
            res(keys.map(key => fixedSortie.bosses[key].name));
        }));
    }

    translate(res) {
        this.missions.then(missions => {
            this.bosses.then(bosses => {
                const pMissions = times.findTimes(missions);
                const pBosses = times.findTimes(bosses, true);
                const bossesStr = pBosses.reduce((str, boss) =>
                    str += boss.time
                        ? utils.tab(6) + "`>` " + boss.name + utils.code(" [" + boss.time + "]") + "\n"
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
            });
        });
    }
}