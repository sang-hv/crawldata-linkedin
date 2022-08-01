import { createRequire } from 'module'

const require = createRequire(import.meta.url)
require('dotenv').config()
const Excel = require('exceljs')
import PageData from '../process/page-data.js'

const fs = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
let LIMIT_PAGE = process.env.LIMIT_PAGE ?? 2
let COMPANY_LIST_LINKEDIN_URL = process.env.COMPANY_LIST_LINKEDIN_URL
const pageData = new PageData()
const workbook = new Excel.Workbook()
const nameFileExcel = `data-excel/${process.env.EXCEL_NAME}.xlsx`
const linkedinErrorLog = 'logs/linkedin-error.log'
const linkedinDataLog = 'logs/linkedin-data.log';

(function () {
    if (COMPANY_LIST_LINKEDIN_URL === '') {
        console.log(process.env.LIMIT_PAGE)
        console.log('Link search is missing!')
        return false
    }

    puppeteer.launch({
        headless: process.env.SHOW_BROSWER_INTERFACE,
        args: ['--no-sandbox']
    })
        .then(async browser => {
            const page = await browser.newPage()
            await page.exposeFunction('getContactInformation', (baseUrl, title, dataLinks) => pageData.getContactInformation(baseUrl, title, dataLinks))
            await loginLinkedIn(page)
            await getLinkCompaniesFromLinkedIn(page)
            await browser.close()
        }, pageData)

    const getLinkCompaniesFromLinkedIn = async (page) => {
        let pageNumber = 1
        do {
            await page.goto(COMPANY_LIST_LINKEDIN_URL)
            await page.waitForNavigation
            await autoScrollData(page)
            const linkCompanies = await getInformationOfCompanies(page)
            writeLogs(linkedinDataLog, linkCompanies.join('\n'))
            COMPANY_LIST_LINKEDIN_URL = await getNextPage(page)
            pageNumber++
            updateAttributeEnv('COMPANY_LIST_LINKEDIN_URL', COMPANY_LIST_LINKEDIN_URL)
            await getDetailCompaniesAndSaveData(page, linkCompanies)
        } while (COMPANY_LIST_LINKEDIN_URL !== '' && pageNumber <= LIMIT_PAGE)
    }

    const writeLogs = (path, data) => {
        if (!fs.existsSync(path)) {
            fs.writeFile(path, `\n${data}`,
                function (err) {
                    if (err) return console.log(err)
                })
        } else {
            fs.appendFileSync(path, `\n${data}`)
        }
    }

    const getNextPage = async (page) => {
        try {
            let elNextButtonVal = '.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view'
            await page.waitForSelector(elNextButtonVal)
            const isEnabledNextPage = await page.evaluate((elNextButtonVal) => {
                return !document.querySelector(elNextButtonVal).disabled
            }, elNextButtonVal)
            if (isEnabledNextPage) {
                await page.click(elNextButtonVal)
                return await page.url()
            } else return ''
        } catch (e) {
            writeLogs(linkedinErrorLog, 'Error get next page')
        }
    }

    const getInformationOfCompanies = async (page) => {
        try {
            page.waitForSelector('.artdeco-entity-lockup__content.ember-view')
            return await page.evaluate(() => {
                let result = []
                let blockHTMLCompanies = document.querySelectorAll('.artdeco-entity-lockup__content.ember-view')
                for (const company of blockHTMLCompanies) {
                    result.push('https://www.linkedin.com' + company.childNodes[1].firstElementChild.firstElementChild.getAttribute('href'))
                }
                return result
            })
        } catch (e) {
            writeLogs('logs/linkedin.log', 'Account is blocked or low network!')
            process.exit(0)
        }

    }

    const getDetailCompaniesAndSaveData = async (page, linkCompanies) => {
        let informationOfCompanies = []
        for (const linkCompany of linkCompanies) {
            try {
                await page.goto(linkCompany)
                await page.waitForSelector('.t-black.account-top-card__lockup-content.box-sizing-border-box.full-width.artdeco-entity-lockup__content.ember-view')
                await page.waitForSelector('#ember61')
                const detailInformation = await page.evaluate(() => {
                    let elCompanyName = document.querySelectorAll('.t-black.account-top-card__lockup-content.box-sizing-border-box.full-width.artdeco-entity-lockup__content.ember-view')[0]
                    let elLinkCompany = document.getElementById('ember61')
                    return {
                        name: elCompanyName.firstElementChild.innerHTML.trim(),
                        description: elCompanyName.childNodes[3].firstElementChild.firstElementChild.innerHTML.trim(),
                        link: elLinkCompany.getAttribute('href'),
                        list_form: [],
                        list_email: [],
                    }
                })
                try {
                    await page.goto(detailInformation.link)
                    await page.waitForSelector('a')
                    let contactInfo = await page.evaluate(async () => {
                        let baseUrl = window.location.origin
                        let title = document.title
                        let dataLinks = []
                        document.querySelectorAll('a').forEach(element =>
                            dataLinks.push(element.getAttribute('href'))
                        )
                        return await window.getContactInformation(baseUrl, title, dataLinks)
                    })
                    detailInformation.list_form = contactInfo.list_form
                    detailInformation.list_email = contactInfo.list_email

                    try {
                        console.log('---find email---')
                        await page.goto(detailInformation.list_form[0])
                        detailInformation.list_email = await page.evaluate(() => {
                            const extractEmails = (text) => {
                                return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
                            }
                            const htmlString = document.getElementsByTagName('html')[0].innerHTML
                            return [...new Set(extractEmails(htmlString))]
                        })

                    } catch (e) {
                        console.log(e)
                    }
                    addToExcel(detailInformation)
                    informationOfCompanies.push(detailInformation)
                    console.log('--log info--')
                    console.log(informationOfCompanies)
                } catch (e) {
                    addToExcel(detailInformation)
                    console.log(e)
                }

            } catch (e) {
                console.log('--4--')
                console.log(e)
            }
        }
        return informationOfCompanies
    }

    const addToExcel = (data) => {
        workbook.xlsx.readFile(nameFileExcel)
            .then(function () {
                const worksheet = workbook.getWorksheet('My Sheet')
                let lastRow = worksheet.lastRow.number
                const getRowInsert = worksheet.getRow(++lastRow)
                getRowInsert.getCell('D').value = data.name
                getRowInsert.getCell('H').value = data.description
                getRowInsert.getCell('I').value = data.list_form.join(' \n ')
                getRowInsert.getCell('K').value = data.list_email.join(' \n ')
                getRowInsert.commit()
                return workbook.xlsx.writeFile(nameFileExcel)
            })
    }

    const autoScrollData = async (page) => {
        await page.waitForSelector('#search-results-container')
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                const scroll = document.getElementById('search-results-container')
                let totalHeight = 0
                const distance = 100
                const scrollHeight = scroll.scrollHeight
                const timer = setInterval(() => {
                    scroll.scrollTop += distance
                    totalHeight += distance

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer)
                        resolve()
                    }
                }, 200)
            })
        })
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

    const loginLinkedIn = async (page) => {
        console.log('--Login to Linkedin--')
        await page.goto('https://www.linkedin.com/login')
        await page.waitForSelector('#username')
        await page.waitForSelector('#password')
        await page.type('#username', process.env.USERNAME)
        await page.type('#password', process.env.PASSWORD)
        await clickByText(page, 'Sign in')
        await page.waitForNavigation()
        console.log('--Login successful--')
    }

    function updateAttributeEnv (attrName, newVal, envPath = '.env') {
        let dataArray = fs.readFileSync(envPath, 'utf8').split('\n')

        let replacedArray = dataArray.map((line) => {
            if (line.split('=')[0] == attrName) {
                return attrName + '=' + String(newVal)
            } else {
                return line
            }
        })

        fs.writeFileSync(envPath, '')
        for (let i = 0; i < replacedArray.length; i++) {
            fs.appendFileSync(envPath, replacedArray[i] + '\n')
        }
    }
}())
