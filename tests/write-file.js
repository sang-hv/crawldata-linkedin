
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

require('dotenv').config()
const fs = require('fs')
const writeLogs = (path, data) => {
    if (!fs.existsSync(path)) {
        fs.writeFile(path, data,
            function (err) {
                if (err) return console.log(err);
            });
    } else {
        fs.appendFileSync(path, data);
    }

}

writeLogs('logs/linkedin.log', ['https://www.linkedin.com/sales/company/31314551?_ntb=Es2NzS4dT0SnOAHEWPtxqg%3D%3D', 'https://www.linkedin.com/sales/company/31314551?_ntb=Es2NzS4dT0SnOAHEWPtxqg%3D%3D'].join('\n'))