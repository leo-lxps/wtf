import { utils } from "../../util/utils";
import { times, users } from "../../api";
import { Command } from "../command";
import { FullKeyboard } from "../../util/fullKeyboard";

export class Times extends Command {
  constructor(command) {
    super(command, new FullKeyboard(command.id, [["missions", "sortie"]]));
  }

  /**
   * Gets list of mission or bosses and return sorted list with times
   * shortest time first
   *
   * @param {array} array of strings (missions/bosses)
   */
  findTimes(array, isBosses) {
    return array
      .map(e => {
        return { name: e, time: this.findTime(e, isBosses).string };
      })
      .sort((a, b) => {
        const aTime = this.findTime(a.name, isBosses);
        const bTime = this.findTime(b.name, isBosses);
        return (
          aTime.minutes * 60 +
          aTime.seconds -
          (bTime.minutes * 60 + bTime.seconds)
        );
      });
  }

  /**
   * gets mission or boss and gets avg time
   *
   * @param {string} e mission or boss
   */
  findTime(e, isBoss) {
    const undefinedTime = {
      minutes: 0,
      seconds: 0,
      avgSecs: 0,
      totalSeconds: 0,
      string: "",
    };
    const relevantTimes = times.data.filter(t => {
      if (t.mission) {
        if (isBoss) {
          return utils.isAssassination(t.mission) && utils.equals(t.boss, e);
        }
        return utils.equals(t.mission, e);
      } else {
        return false;
      }
    });

    if (relevantTimes.length > 0) {
      const timesCount = relevantTimes.length;
      const total = relevantTimes.reduce(
        (total, time) => (total += time.minutes * 60 + time.seconds),
        0,
      );
      const avgSecs = total / timesCount;
      const minutes = Math.floor(avgSecs / 60);
      const seconds = Math.floor(avgSecs - minutes * 60);
      return {
        minutes: minutes,
        seconds: seconds,
        avgSecs: avgSecs,
        totalSeconds: total,
        string: minutes + ":" + ("0" + seconds).slice(-2),
      };
    }
    return undefinedTime;
  }

  add(args, userId, sortie, telegrafFunction) {
    if (users.db.find({ id: userId }).value().isAdmin) {
      if (
        this.parseTimes(args) &&
        sortie &&
        args.length >= sortie.variants.length
      ) {
        let message = utils.bold("Recorded times: \n\n");
        args.forEach((t, i) => {
          const mission = sortie.variants[i].missionType;
          this.addTime(t, mission, sortie.boss);
          message +=
            utils.bold("Mission: ") +
            utils.code(mission) +
            "\n" +
            utils.tab(6) +
            utils.bold("Boss: ") +
            utils.code(sortie.boss) +
            "\n" +
            utils.tab(6) +
            utils.bold("Time: ") +
            utils.code(t) +
            "\n\n";
        });
        telegrafFunction(message);
      } else {
        telegrafFunction(
          "Not a valid time format: \n" +
            utils.code(args.join(", ")) +
            utils.italic("\n\nUse this format: \n") +
            utils.code("/time < mm:ss >, < mm:ss >, < mm:ss >"),
        );
      }
    } else {
      console.log("User with id: ", userId, " not an admin");
    }
  }

  addTime(time, mission, boss) {
    times.push({
      mission: mission,
      minutes: parseInt(time.split(":")[0]),
      seconds: parseInt(time.split(":")[1]),
      boss: boss,
    });
  }

  parseTimes(times) {
    return times.reduce((b, t) => (b = this.parseTime(t) && b), true);
  }

  parseTime(time) {
    /** time in format mm:ss with mm:(0-inf) and ss:(0-59) */
    var timeRx = new RegExp("^(([0-5]?[0-9])+:([0-5]?[0-9]))$");
    return timeRx.test(time);
  }
}
