import moment from "moment";
import request from 'request';


export const utils = {
    arrayHasId(array, id) {
        array.forEach(e => {
            if (e.id == id) {
                return true;
            }
        });
        return false;
    },

    download(url) {
        return new Promise((res, rej) => {
            request.get({ url: url, json: true }, (e, r, json) => {
                res(json)
            })
        })
    },

    isValidJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },

    fromNow(date) {
        return moment(date).fromNow();
    },

    tab(n) {
        return "\t".repeat(n)
    },

    clean(msg) {
        return msg.toString().replace("*", "x").replace("`", "'").replace("_", " ");
    },

    italic(msg) {
        return "_" + this.clean(msg) + "_";
    },

    bold(msg) {
        return "*" + this.clean(msg) + "*";
    },

    code(msg) {
        return "`" + this.clean(msg) + "`";
    },

    link(text, url) {
        return "[" + this.clean(text) + "](" + url + ")";
    },

    title(msg) {
        return "`━┫` " + utils.bold(msg.toUpperCase()) + " `┣━`\n";
    },

    selected(msg) {
        return "◄" + msg + "►";
    },

    menu(msg) {
        return "┏━━━━━━━┫ " + msg.toUpperCase() + " ┣━━━━━━━┓"
    },

    isAssassination(mission) {
        return mission.toUpperCase() === "ASSASSINATION"
            || mission.toUpperCase() === "ASSASSINATE"
    },

    equals(a, b) {
        return a.toUpperCase().trim() == b.toUpperCase().trim();
    }
}
