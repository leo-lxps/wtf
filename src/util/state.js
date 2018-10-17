import request from 'request-promise';
import { users, bot, notifications } from '../api';
import { alerts, sortie, updates, invasions, events, bounties, trader } from '../commands/handler';

export class State {
    constructor(base, platform, options = {
        interval: 60000,
        intervalFixed: 600000
    }) {
        this.b = base;
        this.p = platform;
        this.refresh() // Get current version immediately
        this.refreshMissionTypes() // Get current version immediately
        this.refreshSortie()
        this.refreshUpdate()
        setInterval(() => this.refresh(), options.interval);
        setInterval(() => this.refreshMissionTypes(), options.intervalFixed)
        setInterval(() => this.refreshSortie(), options.intervalFixed)
        setInterval(() => this.refreshUpdate(), options.intervalFixed)
    }

    refresh() {
        request.get({ url: this.base + this.platform, json: true })
            .then(res => {
                // UPDATE world state
                this.ws = res;

                // Check for new alerts
                users.data.filter(u => u.notifyAlerts).forEach(user => {
                    const telegrafFunction = (msg, keyboard) => {
                        bot.telegram.sendMessage(user.id, msg, keyboard);
                    }
                    alerts.alert(telegrafFunction, user.id);
                    invasions.alert(telegrafFunction, user.id);
                    events.alert(telegrafFunction, user.id);
                    bounties.alert(telegrafFunction, user.id);
                });
                // Check for new sortie
                users.data.filter(u => u.notifySortie).forEach(user => {
                    const telegrafFunction = (msg, keyboard) => {
                        bot.telegram.sendMessage(user.id, msg, keyboard);
                    }
                    sortie.alert(telegrafFunction);
                });

                // Check for new update
                users.data.filter(u => u.notifyUpdates).forEach(user => {
                    const telegrafFunction = (msg, keyboard) => {
                        bot.telegram.sendMessage(user.id, msg, keyboard);
                    }
                    updates.alert(telegrafFunction, user.id);
                });

                // Check for new trader
                users.data.filter(u => u.notifyUpdates).forEach(user => {
                    const telegrafFunction = (msg, keyboard) => {
                        bot.telegram.sendMessage(user.id, msg, keyboard);
                    }
                    trader.alert(telegrafFunction, user.id);
                });

                // Save ids
                alerts.ids.forEach(id => notifications.add({ id: id }));
                invasions.ids.forEach(id => notifications.add({ id: id }));
                events.ids.forEach(id => notifications.add({ id: id }));
                bounties.ids.forEach(id => notifications.add({ id: id }));
                sortie.ids.forEach(id => notifications.add({ id: id }));
                updates.ids.forEach(id => notifications.add({ id: id }));
                trader.ids.forEach(id => notifications.add({ id: id }));
            })
            .catch(err => {
            })
    }

    refreshMissionTypes() {
        request.get({ url: this.base + "/missionTypes", json: true })
            .then(res => {
                this.missionTypes = res;
            })
            .catch(err => {

            })
    }

    refreshSortie() {
        request.get({ url: this.base + "/sortie", json: true })
            .then(res => {
                this.sortie = res;
            })
            .catch(err => {

            })
    }


    refreshUpdate() {
        request.get({ url: this.base + this.platform + "/news", json: true })
            .then(res => {
                this.update = res;
            })
            .catch(err => {

            })
    }

    get base() {
        return this.b;
    }

    set base(newBase) {
        this.b = newBase;
    }

    get platform() {
        return this.p;
    }

    set platform(newPlatform) {
        this.p = newPlatform;
    }
}