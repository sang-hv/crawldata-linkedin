import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
let COMPANY_LIST_LINKEDIN_URL = process.env.COMPANY_LIST_LINKEDIN_URL
let accountIndex = 1;

(function () {
    puppeteer.launch({
        headless: false,
        args: ['--no-sandbox']
    })
        .then(async browser => {
            const page = await browser.newPage()
            await loginLinkedIn(page)
            // await browser.close()
        })

    const loginLinkedIn = async (page, username = process.env.USERNAME, password = process.env.PASSWORD) => {
        console.log('--Login to Linkedin--')
        await page.goto('https://www.linkedin.com/login')
        await page.waitForSelector('#username')
        await page.waitForSelector('#password')
        await page.type('#username', username)
        await page.type('#password', password)
        await clickByText(page, 'Sign in')
        await page.waitForNavigation()
        try {
            await page.goto(COMPANY_LIST_LINKEDIN_URL)
            await page.waitForSelector('#search-results-container')
            console.log('--Login successful--')
        } catch (e) {
            console.log('--Login fail--')
            console.log('--Account is blocked--');
            await loginLinkedIn(page, process.env[`USERNAME${accountIndex}`], process.env[`PASSWORD${accountIndex}`]);
            accountIndex++;
        }
    }

    const escapeXpathString = str => {
        const splitedQuotes = str.replace(/'/g, `', "'", '`)
        return `concat('${splitedQuotes}', '')`
    }

    const clickByText = async (page, text) => {
        const escapedText = escapeXpathString(text)
        const linkHandlers = await page.$x(`//button[contains(text(), ${escapedText})]`)

        if (linkHandlers.length > 0) {
            await linkHandlers[0].click()
        } else {
            throw new Error(`Link not found: ${text}`)
        }
    }

}())