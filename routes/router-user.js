import bizJwt from "../service/biz-jwt.js";

export default {
    '/echo': (req) => {
        const keys = [
            'method', 'body', 'headers', 'url', 'httpVersion', '_remoteAddress']
        const res = {}
        for (let key in req) {
            if (keys.indexOf(key) !== -1) {
                res[key] = req[key]
            }
        }
        return res;
    },
    'post /api/user/login.do': (req, res) => {
        const {username, password} = req.body
        if (!username || !password) {
            throw new Error('wtf')
        }
        if (username === 'admin' && password === '123') {
            return bizJwt.set(req, res, {username, password, rd: Math.random()})
        } else {
            throw new Error('login has error')
        }
    },
    'get /api/user/profile.do': (req, res) => {
        return bizJwt.get(req, res)
    },

    'get /api/user/logout.do': (req, res) => {
        bizJwt.invoke(req, res)
        return ''
    },
}
