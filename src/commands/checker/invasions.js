import { CheckCommand } from "../checkCommand";
import { utils } from "../../util/utils";

export class Invasions extends CheckCommand {
  constructor(command) {
    super(command);
  }

  translateCheck(invasion, index) {
    if (!invasion.completed) {
      const reward = invasion.vsInfestation
        ? invasion.defenderReward.asString
        : invasion.attackerReward.asString +
          " | " +
          invasion.defenderReward.asString;
      return (
        utils.code("━┫ ") +
        utils.bold(
          invasion.desc +
            " (" +
            Math.abs(invasion.count) +
            "/ " +
            invasion.requiredRuns +
            ")",
        ) +
        "\n" +
        utils.tab(6) +
        utils.code(reward.toUpperCase()) +
        "\n" +
        utils.tab(6) +
        utils.italic(
          "Start " +
            utils.fromNow(invasion.activation) +
            " > Ends in " +
            invasion.eta,
        )
      );
    }
    return "";
  }

  rewardsOfCheck(invasion, ignoreCredits) {
    const key = ignoreCredits ? "itemString" : "asString";
    return (invasion.attackerReward[key] + "+" + invasion.defenderReward[key])
      .split("+")
      .map(r => r.toUpperCase().trim())
      .filter(Boolean);
  }
}
