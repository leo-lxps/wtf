import WfItems from "warframe-items";
import { items } from "../handler";
import { utils } from "../../util/utils";

const wfItems = new WfItems();

export class Search {
  constructor() {
    this.items = wfItems;
    this.lastQuery = "";
    this.queryCount = 0;
    this.currentOffset = 0;
    this.slapped = 0;
    this.results = 20;
  }

  slap(ctx) {
    this.slapped = this.slapped + 1;
    ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: "👋 " + this.slapped,
            callback_data: "slap",
          },
        ],
      ],
    });
  }

  remove(item, ctx) {
    ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: "ADD ITEM",
            callback_data: "addInline." + item,
          },
          {
            text: "SEARCH NEW",
            switch_inline_query_current_chat: "",
          },
        ],
      ],
    });
  }

  add(item, ctx) {
    ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: "REMOVE ITEM",
            callback_data: "removeInline." + item,
          },
          {
            text: "SEARCH NEW",
            switch_inline_query_current_chat: "",
          },
        ],
      ],
    });
  }

  query(ctx, search, userId) {
    if (search == this.lastQuery) {
      this.queryCount++;
    } else {
      this.queryCount = 0;
    }
    this.lastQuery = search;
    const offset = parseInt(ctx.inlineQuery.offset || 0) * this.queryCount;

    let inlineObjects = [];
    let inlinePhotos = [];

    if (search == "") {
      inlineObjects.push({
        type: "article",
        id: "searchitem",
        title: "Start typing to search!",
        description: "Search Warframes, weapons, drops, items and more...\n",
        input_message_content: {
          message_text: "Mission Failed, We'll Get 'Em Next Time",
          parse_mode: "Markdown",
        },
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "GAME OVER",
                switch_inline_query_current_chat: "",
              },
            ],
          ],
        },
      });
    } else {
      const inKey = item => {
        if (items.get(userId).includes(item.name.toUpperCase())) {
          return {
            inline_keyboard: [
              [
                {
                  text: "REMOVE ITEM",
                  callback_data: "removeInline." + item.name,
                },
                {
                  text: "SEARCH NEW",
                  switch_inline_query_current_chat: "",
                },
              ],
            ],
          };
        } else {
          return {
            inline_keyboard: [
              [
                {
                  text: "ADD ITEM",
                  callback_data: "addInline." + item.name,
                },
                {
                  text: "SEARCH NEW",
                  switch_inline_query_current_chat: "",
                },
              ],
            ],
          };
        }
      };
      this.getItems(search).forEach((item, i) => {
        if (item.wikiaThumbnail) {
          inlinePhotos.push({
            type: "photo",
            id: "p" + i,
            photo_url: item.wikiaThumbnail,
            thumb_url: item.wikiaThumbnail,
            title: item.name,
            description: item.type,
            input_message_content: {
              message_text: this.translateItem(item),
              parse_mode: "Markdown",
            },
            reply_markup: inKey(item),
          });
        } else {
          const description = item.description
            ? item.description.replace(/\<([^>]+)\>/g, "").replace(/[*`_]/g, "")
            : "";

          inlineObjects.push({
            type: "article",
            id: "a" + i,
            title: item.name,
            description: description,
            input_message_content: {
              message_text: this.translateItem(item),
              parse_mode: "Markdown",
            },
            reply_markup: inKey(item),
          });
        }
      });
    }

    inlineObjects = inlinePhotos.concat(inlineObjects);

    if (inlineObjects.length < 1) {
      const gifs = [
        "https://i.imgur.com/X8Z1NwC.gif",
        "https://i.imgur.com/ARwMmsw.gif",
        "https://i.imgur.com/WjfSkSS.gif",
        "https://i.imgur.com/HxJXv3F.gif",
      ];
      const randGif = gifs[Math.floor(Math.random() * gifs.length)];
      inlineObjects.push({
        type: "gif",
        id: "valkyr",
        gif_url: randGif,
        thumb_url: randGif,
        title: "ASS",
        description: "NOICE",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "👋 " + this.slapped,
                callback_data: "slap",
              },
            ],
          ],
        },
      });
      inlineObjects.push({
        type: "article",
        id: "noitem",
        title: "No items found!",
        description: "Try another search query.",
        input_message_content: {
          message_text: "Try another search query.",
          parse_mode: "Markdown",
        },
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "SEARCH",
                switch_inline_query_current_chat: "",
              },
            ],
          ],
        },
      });
    }
    ctx
      .answerInlineQuery(inlineObjects.slice(offset, offset + this.results), {
        cache_time: 100,
        next_offset: this.results,
      })
      .catch(err => {
        ctx.answerInlineQuery([
          {
            type: "article",
            id: "error",
            title: "To many results!",
            description: "Keep typing to refine Search",
            input_message_content: {
              message_text: "Try another search query.",
              parse_mode: "Markdown",
            },
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "SEARCH",
                    switch_inline_query_current_chat: "",
                  },
                ],
              ],
            },
          },
        ]);
      });
  }

  getItems(query) {
    const items = this.items;
    const queries = query
      .split(",")
      .filter(q => q != "")
      .map(q => q.trim().toUpperCase());
    let types = [];
    let found = Array.from(items).filter(i => {
      if (!types.includes(i.category)) {
        types.push(i.category);
      }
      let b = false;
      queries.forEach(query => {
        b = this.matchesQuery(i, query);
      });
      return b;
    });
    return found;
  }

  matchesQuery(item, query) {
    const matchStr = [
      item.name,
      item.type,
      item.description,
      item.uniqueName,
      item.category,
    ].join(" ");

    if (matchStr.toUpperCase().includes(query.toUpperCase())) {
      if (item.name.charAt(0) != "/" && !item.name.includes("[Ph]")) {
        return true;
      }
    }
    return false;
  }

  translateItem(item) {
    switch (item.category) {
      case "Archwing":
        if (item.type == "Archwing") {
          return this.translateWarframe(item);
        }
      case "Secondary":
      case "Melee":
      case "Primary":
        return this.translateWeapon(item);
      case "Warframes":
      case "Pets":
      case "Sentinels":
        return this.translateWarframe(item);
      default:
        return this.translateOther(item);
    }
  }

  translateOther(item) {
    const info = item
      ? (item.description
          ? "\n\t\t\t" +
            utils.italic(
              item.description
                .replace(/\<([^>]+)\>/g, "")
                .replace(/[*`_]/g, ""),
            )
          : "") +
        (item.polarity
          ? "\n\t\t\tPolarity: " + utils.code(item.polarity)
          : "") +
        (item.baseDrain && item.fusionLimit
          ? "\n\t\t\tDrain: " +
            utils.code(item.baseDrain + "-" + item.fusionLimit)
          : "")
      : "";

    const drops = item.drops
      ? utils.bold("DROPS:\n") +
        item.drops
          .splice(0, 5)
          .reduce(
            (str, d) =>
              (str +=
                utils.bold(d.type) +
                ": \n" +
                utils.tab(6) +
                utils.code(d.location.toUpperCase()) +
                "\n" +
                utils.tab(6) +
                d.rarity +
                " (" +
                utils.italic(d.chance * 100) +
                "%)\n"),
            "",
          )
      : "";

    return utils.title(item.name) + info + "\n\n" + drops;
  }

  translateWarframe(warframe) {
    let name = warframe.name ? utils.title(warframe.name) + "\n" : "";
    let description = warframe.description
      ? utils.italic(warframe.description) + "\n"
      : "";
    let health = warframe.health
      ? "Health: " + utils.code(warframe.health) + "\n"
      : "";
    let shield = warframe.shield
      ? "Shield: " + utils.code(warframe.shield) + "\n"
      : "";
    let armor = warframe.armor
      ? "Armor: " + utils.code(warframe.armor) + "\n"
      : "";
    let power = warframe.power
      ? "Energy: " + utils.code(warframe.power) + "\n"
      : "";
    let MR = warframe.masteryReq
      ? "Mastery Requirement: " + utils.code(warframe.masteryReq) + "\n"
      : "";
    let sex = warframe.sex
      ? warframe.name == "Nezha"
        ? "It's a Trap!\n"
        : "Gender: " + warframe.sex + "\n"
      : "";
    let trade = warframe.tradable
      ? utils.bold(warframe.name + " is tradable!\n")
      : "";
    let vaulted = warframe.vaulted
      ? utils.bold(warframe.name + " is vaulted!\n")
      : "";
    let abilities = warframe.abilities
      ? this.translateAbilities(warframe.abilities)
      : "";
    let sprint = warframe.sprint
      ? "Sprint Speed: " + utils.code(warframe.sprint) + "\n"
      : "";
    let wikiUrl =
      warframe.name && warframe.wikiaUrl
        ? utils.link(warframe.name, warframe.wikiaUrl) + "\n"
        : "";

    return (
      name +
      description +
      trade +
      vaulted +
      "\n" +
      health +
      shield +
      armor +
      power +
      abilities +
      sprint +
      sex +
      MR +
      wikiUrl
    );
  }
  translateAbilities(abilities) {
    let msg = utils.bold("Abilities:\n");
    abilities.forEach(ability => {
      let name =
        utils.code("|") + utils.tab(3) + utils.bold(ability.name) + ": ";
      let description = utils.italic(ability.description) + "\n";
      msg += name + description;
    });
    return msg;
  }
  translateWeapon(weapon) {
    const dispoFullEmote = "🞉";
    const dispEmptyEmote = "🞅";
    const line = utils.code("|") + utils.tab(3);

    let name = weapon.name ? utils.title(weapon.name) + "\n" : "";
    let type =
      (weapon.category ? weapon.category : "") +
      (weapon.type ? " - " + weapon.type : "") +
      (weapon.trigger ? " (" + weapon.trigger + ")\n" : "\n");
    let description = weapon.description
      ? utils.italic(weapon.description) + "\n"
      : "";
    let magazine =
      weapon.magazineSize && weapon.ammo
        ? "Magazine: " +
          utils.code(weapon.magazineSize + "|" + weapon.ammo) +
          "\n"
        : "";
    let reload = weapon.reloadTime
      ? "Reload Time: " + utils.code(weapon.reloadTime) + "\n"
      : "";
    let dps = weapon.damagePerSecond
      ? utils.bold("DPS: ") + utils.code(weapon.damagePerSecond) + "\n"
      : "";
    let accuracy = weapon.accuracy
      ? "Accuracy: " + utils.code(weapon.accuracy) + "\n"
      : "";
    let CC = weapon.criticalChance
      ? "Critical Change: " +
        utils.code(Math.round(weapon.criticalChance * 100) + "%") +
        "\n"
      : "";
    let CM = weapon.criticalMultiplier
      ? "Critical Multiplier: " +
        utils.code(weapon.criticalMultiplier + "x") +
        "\n"
      : "";
    let SC = weapon.procChance
      ? "Status Chance: " +
        utils.code(Math.round(weapon.procChance * 100) + "%") +
        "\n"
      : "";
    let FR = weapon.fireRate
      ? "Fire Rate: " +
        utils.code(Math.round(weapon.fireRate * 100) / 100) +
        "\n"
      : "";
    let AS = weapon.fireRate
      ? "Attack Speed: " +
        utils.code(Math.round(weapon.fireRate * 100) / 100) +
        "\n"
      : "";
    let MR = weapon.masteryReq
      ? "MR Lock: " + utils.code(weapon.masteryReq) + "\n"
      : "";
    let disposition = weapon.disposition
      ? "Riven Disposition: " +
        utils.code(
          dispoFullEmote.repeat(parseInt(weapon.disposition)) +
            dispEmptyEmote.repeat(5 - parseInt(weapon.disposition)),
        ) +
        "\n"
      : "";
    let trade = weapon.tradable
      ? utils.bold(weapon.name + " is tradable!") + "\n"
      : "";
    let vaulted = weapon.vaulted
      ? utils.bold(weapon.name + " is vaulted!") + "\n"
      : "";
    let latestPatch = weapon.patchlogs
      ? weapon.patchlogs.length > 0
        ? this.translatePatchlog(weapon.patchlogs[0]) + "\n"
        : ""
      : "";
    let attacks =
      "Attacks: \n" +
      (weapon.chargeAttack
        ? line + utils.code(weapon.chargeAttack) + "\t\t\t Charge \n"
        : "") +
      (weapon.spinAttack
        ? line + utils.code(weapon.spinAttack) + "\t\t\t Spin \n"
        : "") +
      (weapon.leapAttack
        ? line + utils.code(weapon.leapAttack) + "\t\t\t Leap\n"
        : "") +
      (weapon.wallAttack
        ? line + utils.code(weapon.wallAttack) + "\t\t\t Wall\n"
        : "");
    let damage = weapon.damageTypes
      ? "\n" + this.translateDamage(weapon.damageTypes) + "\n"
      : "";
    let wikiUrl =
      weapon.wikiaUrl && weapon.name
        ? utils.link(weapon.name, weapon.wikiaUrl) + "\n"
        : "";

    let messageRanged =
      name +
      utils.tab(3) +
      type +
      utils.tab(3) +
      description +
      trade +
      vaulted +
      "\n" +
      magazine +
      reload +
      accuracy +
      FR +
      CC +
      CM +
      SC +
      damage +
      dps +
      MR +
      disposition +
      latestPatch +
      wikiUrl;

    let messageMelee =
      name +
      utils.tab(3) +
      type +
      utils.tab(3) +
      description +
      trade +
      vaulted +
      "\n" +
      AS +
      CC +
      CM +
      SC +
      attacks +
      damage +
      dps +
      MR +
      disposition +
      latestPatch +
      wikiUrl;

    return weapon.trigger == "Melee" ? messageMelee : messageRanged;
  }
  translateDamage(damageTypes) {
    const types = Object.keys(damageTypes);
    const line = utils.code("|") + utils.tab(3);
    let msg = "Damage: \n";
    types.forEach(type => {
      msg +=
        line +
        utils.code(damageTypes[type]) +
        utils.tab(3) +
        type.charAt(0).toUpperCase() +
        type.slice(1) +
        "\n";
    });
    return msg;
  }
  translatePatchlog(patchlog) {
    if (!patchlog) return;
    const line = utils.code("|") + utils.tab(3);

    let title = utils.bold("Latest Patchlog: \n");
    let name = patchlog.name;
    let additions = utils.clean(patchlog.additions);
    let changes = utils.clean(patchlog.changes);
    let fixes = utils.clean(patchlog.fixes);
    let msg =
      title +
      (additions
        ? line + utils.bold("Additions: ") + utils.italic(additions) + "\n"
        : "") +
      (changes
        ? line + utils.bold("Changes: ") + utils.italic(changes) + "\n"
        : "") +
      (fixes ? line + utils.bold("Fixes: ") + utils.italic(fixes) + "\n" : "");
    return msg;
  }
}
