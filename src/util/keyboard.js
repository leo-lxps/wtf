
const Extra = require('telegraf/extra')

export class Keyboard {
    constructor(layout, selected) {
        this.layout = layout;
        this.selected = selected;
        this.search = ""
    }

    get inline() {
        return {
            inline_keyboard: this.layout.map(commands =>
                commands.map(cmd => this.inlineKey(cmd))
            )
        };
    }

    get telegraf() {
        return Extra.markdown().markup(this.inline);
    }

    set inlineSearch(search) {
        this.search = search;
    }

    text(name) {
        return name === this.selected ? "REFRESH" : name.toUpperCase();
    }

    inlineKey(id) {
        if (typeof id == "string") {
            if (id == "search") {
                return {
                    text: id.toUpperCase(), switch_inline_query_current_chat: this.search
                };
            } else {
                const name = this.text(id);
                return { text: name, callback_data: id };
            }
        } else if (id.text && (id.callback_data
            || id.switch_inline_query_current_chat
            || id.url)) {
            return id
        }
    }

}