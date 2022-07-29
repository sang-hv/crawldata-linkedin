import { createRequire } from 'module'
const require = createRequire(import.meta.url)

require('dotenv').config()
const fs = require('fs')

const updateEnvFile = async () => {
    await fs.writeFile('.env',
        `COMPANY_LIST_LINKEDIN_URL="${1234}"`,
        function (err) {
            if (err) return console.log(err);
        });
    await console.log(process.env.COMPANY_LIST_LINKEDIN_URL)
}
updateEnvFile().then(r => {})