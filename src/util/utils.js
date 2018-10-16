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

    italic(msg) {
        return "_" + msg + "_";
    },

    bold(msg) {
        return "*" + msg + "*";
    },

    code(msg) {
        return "`" + msg + "`";
    },

    link(text, url) {
        return "[" + text + "](" + url + ")";
    }
}
