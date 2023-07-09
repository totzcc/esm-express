import * as uuid from 'uuid'
import jwt from 'jsonwebtoken'

const jwtSecret = 'express'
const jwtExpiresIn = 7 * 24 * 3600

class BizJwt {
    set(req, res, obj) {
        if (!obj['jid']) {
            obj['jid'] = uuid.v4()
        }
        delete obj.exp
        delete obj.iat
        const authorization = jwt.sign(obj, jwtSecret, {expiresIn: jwtExpiresIn})
        res.header('Authorization', `Bearer ${authorization}`)
        res.cookie('jwt', authorization, {maxAge: jwtExpiresIn * 1000, httpOnly: true})
        return obj['jid']
    }

    get(req, res) {
        let authorization = req.header('Authorization') || req.cookies['jwt'] || ''
        authorization = authorization.replace('Bearer ', '')
        if (!authorization) {
            throw new Error('wtf 未登录')
        }
        try {
            const obj = jwt.verify(authorization, jwtSecret, {expiresIn: jwtExpiresIn})
            if (Math.random() * 100 < 20) {
                this.set(req, res, obj)
            }
            return obj
        } catch (e) {
            throw new Error('wtf 未登录')
        }
    }

    invoke(req, res) {
        res.header('Authorization', '')
    }
}

export default new BizJwt()