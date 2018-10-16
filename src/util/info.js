import request from 'request';

export class Info {
    constructor(base, platform) {
        this.b = base;
        this.p = platform;
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

    wfs({ sub, fixed } = {}) {
        const extension = sub ? this.platform + sub : fixed ? fixed : "";
        return new Promise(res => {
            request.get({
                url: this.base + extension,
                json: true
            },
                (e, r, json) => {
                    res(json)
                })
        })

    }
}