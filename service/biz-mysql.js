import {createRequire} from "module";
import mysql from 'mysql2/promise.js'

const require = createRequire(import.meta.url)
const config = require('../config.json')
process.env.TZ = 'Asia/Shanghai'

class BizMysql {
    constructor(databaseConfig) {
        this.inited = false
        this.pool = undefined
        this.databaseConfig = databaseConfig
    }

    async getConn() {
        if (!this.inited) {
            console.log('mysql init pool')
            this.inited = true
            this.pool = mysql.createPool(this.databaseConfig || config.mysql)
            console.log('mysql set time_zone +8')
            this.pool.query(`set time_zone='+08:00'`)
        }
        return this.pool
    }

    async query(sql, params) {
        return (await this.getConn()).query(sql, params)
    }
}

export default new BizMysql()