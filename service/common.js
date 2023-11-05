import {createRequire} from "module";

const require = createRequire(import.meta.url)
const config = require('../config.json')

class Common {
    getConfig() {
        return config
    }
}

export default new Common()
