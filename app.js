#!/usr/bin/env node
import express from "express";
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import routes from "./routes/index.js";
import fs from "fs";
import util from "util";

process.env.TZ = 'Asia/Shanghai'
if (fs.realpathSync(".").indexOf("/root") !== -1) {
    const loggerFile = fs.createWriteStream('c.log', {flags: 'a'})
    const originLog = console.log
    console.log = function (...data) {
        if (data.length === 1) {
            data = data[0]
        }
        const str = (typeof (data) === 'string' ? data : util.inspect(data))
        loggerFile.write(str + '\n')
        originLog(str)
    }
    console.error = console.log
}

process.on('uncaughtException', (e) => {
    console.log('uncaughtException', e)
})
const app = express()
const port = process.env.PORT || '80'
console.log('run on ' + port)
app.listen(port)
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static('public', {
    maxAge: 7 * 24 * 3600000,
    setHeaders: (res, path1) => {
        if (path1.indexOf('.html') !== -1) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        }
    }
}));
app.use((req, res, next) => {
    res.header('X-Up', process.uptime().toFixed(2) + '')
    res.header('X-Ts', Date.now() + '')
    res.header('Access-Control-Allow-Origin', req.header('Origin') || '*')
    res.header('Access-Control-Allow-Headers', ['Content-Type', 'Authorization'].join(','))
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
});
routes.forEach(handler => {
    const contextPath = process.env.CONTEXT_PATH || ''
    for (const handlerKey in handler) {
        const handlerValue = handler[handlerKey]
        const systemStatus = (res, st) => {
            if (!res.finished) {
                res.header('X-Time', Date.now() - st)
            }
        }
        const sendSuccess = (res, data, st) => {
            systemStatus(res, st)
            if (!res.finished) {
                if (data === undefined) {
                    res.send('')
                } else {
                    if (typeof (data) === 'string' && data.startsWith('<')) {
                        res.send(data)
                    } else {
                        res.send({
                            code: 0,
                            data
                        })
                    }
                }
            }
        }
        const sendError = (res, e, st) => {
            systemStatus(res, st)
            if (e.message.indexOf('wtf') === -1) {
                console.error(e)
            }
            res.send({
                code: 1,
                error: {
                    ...e,
                    message: e.message
                }
            })
        }
        const requestHandler = async (req, res) => {
            const st = Date.now()
            try {
                const value = handlerValue(req, res)
                if (value instanceof Promise) {
                    sendSuccess(res, await value, st)
                } else {
                    sendSuccess(res, value, st)
                }
            } catch (e) {
                if (typeof(e) === 'string') {
                    e = {message: e}
                }
                sendError(res, e, st)
            }
        }
        const paths = handlerKey.split(' ')
        let reqPath = contextPath + handlerKey
        if (paths.length === 2) {
            reqPath = contextPath + paths[1]
            app[paths[0].toLowerCase()](reqPath, requestHandler)
        } else {
            app.all(reqPath, requestHandler)
        }
    }
})
app.use((req, res) => {
    res.header('X-Up', process.uptime().toFixed(2))
    if (req.method === 'OPTIONS') {
        res.send('')
    } else {
        res.send({
            code: 1,
            error: {message: 'api path not found'}
        })
    }
});
