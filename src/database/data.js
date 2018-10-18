import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

const userAD = new FileSync('./db/users.json')
export const usersDB = low(userAD)
const timesAD = new FileSync('./db/times.json')
const timesDB = low(timesAD)
const notificationsAD = new FileSync('./db/notifications.json')
const notificationsDB = low(notificationsAD)

usersDB.defaults({ users: [] }).write()
timesDB.defaults({ times: [] }).write()
notificationsDB.defaults({ notifications: [] }).write()

export class Data {
    constructor(database) {
        this.DB = eval(database + "DB");
        this.database = database;
    }

    get db() {
        return this.DB.get(this.database);
    }

    get data() {
        return this.db.value()
    }

    get ids() {
        return this.data.map(i => i.id);
    }

    getById(id) {
        return this.db.find({ id: id }).value();
    }

    push(object) {
        this.db.push(object).write()
    }

    assignObjectToId(object, id) {
        this.db.find({ id: id }).assign(object).write();
    }

    add(object) {
        if (object.id && !object.is_bot) {
            const found = this.getById(object.id)
            if (!found) {
                let user = object;
                user.items = [];
                this.push(user)
            }
        } else {
            console.log(object, " has no id field")
        }
    }

    hasId(id) {
        const item = this.db.find({ id: id }).value();
        return item ? true : false
    }

    clear() {
        this.DB.set(this.database, [])
    }
}
