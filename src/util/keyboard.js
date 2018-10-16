
const Extra = require('telegraf/extra')

export class Keyboard {
    constructor(layout, selected) {
        this.layout = layout;
        this.selected = selected;
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

    text(name) {
        return name === this.selected ? ">" + name : name;
    }

    inlineKey(id) {
        if (id == "search") {
            return {
                text: id.toUpperCase(), switch_inline_query_current_chat: ""
            };
        } else {
            const name = this.text(id);
            return { text: name.toUpperCase(), callback_data: id };
        }
    }

}