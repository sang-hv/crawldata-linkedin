import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const Excel = require('exceljs');
import PageData from '../process/page-data.js'
const fs = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
let LIMIT_PAGE = process.env.LIMIT_PAGE ?? 20;
let COMPANY_LIST_LINKEDIN_URL = process.env.COMPANY_LIST_LINKEDIN_URL ?? "https://www.linkedin.com/sales/search/company?page=3&query=(filters%3AList((type%3AREGION%2Cvalues%3AList((id%3A102454443%2Ctext%3ASingapore%2CselectionType%3AINCLUDED)))%2C(type%3AINDUSTRY%2Cvalues%3AList((id%3A133%2Ctext%3AWholesale%2CselectionType%3AINCLUDED)))))&sessionId=glAH3YQUQQabeUhN20JQNg%3D%3D";
const pageData = new PageData();
const nameFileExcel = `data-excel/${process.env.EXCEL_NAME}.xlsx`;
const workbook = new Excel.Workbook();

(function () {
    puppeteer.launch({
        headless: false,
        args: ['--no-sandbox']
    })
        .then(async browser => {
            const page = await browser.newPage()
            await page.exposeFunction('getContactInformation', (baseUrl, title, dataLinks) => pageData.getContactInformation(baseUrl, title, dataLinks));
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

            COMPANY_LIST_LINKEDIN_URL = await getNextPage(page)
            pageNumber++;
            fs.writeFile('./logs/history-log.txt',
                `${pageNumber} - ${COMPANY_LIST_LINKEDIN_URL}`,
                function (err) {
                if (err) return console.log(err);
            });

            await getDetailCompaniesAndSaveData(page, linkCompanies)
        } while (COMPANY_LIST_LINKEDIN_URL !== '' && pageNumber <= LIMIT_PAGE)
    }

    const getNextPage = async (page) => {
        let elNextButtonVal = '.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view'
        const isEnabledNextPage = await page.evaluate((elNextButtonVal) => {
            return !document.querySelector(elNextButtonVal).disabled
        }, elNextButtonVal)
        if (isEnabledNextPage) {
            await page.click(elNextButtonVal)
            return await page.url()
        } else return ''
    }

    const getInformationOfCompanies = async (page) => {
        return await page.evaluate(() => {
            let result = []
            let blockHTMLCompanies = document.querySelectorAll('.artdeco-entity-lockup__content.ember-view')
            for (const company of blockHTMLCompanies) {
                result.push('https://www.linkedin.com'+ company.childNodes[1].firstElementChild.firstElementChild.getAttribute('href'))
            }
            return result
        })
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
                        link: elLinkCompany.getAttribute('href')
                    }
                })
                try {
                    await page.goto(detailInformation.link)
                    let contactInfo = await page.evaluate(async () => {
                        let baseUrl = window.location.origin
                        let title = document.title
                        let dataLinks = [];
                        document.querySelectorAll('a').forEach(element =>
                            dataLinks.push(element.getAttribute('href'))
                        );
                        return await window.getContactInformation(baseUrl, title, dataLinks);
                    });
                    detailInformation.list_form = contactInfo.list_form
                    detailInformation.list_email = contactInfo.list_email

                    try {
                        console.log('---find email---')
                        await page.goto(detailInformation.list_form[0])
                        detailInformation.list_email = await page.evaluate(() => {
                            const extractEmails = (text) => {
                                return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                            }
                            const htmlString = document.getElementsByTagName('html')[0].innerHTML;
                            return [...new Set(extractEmails(htmlString))];
                        })

                    } catch (e) {
                        console.log(e)
                    }
                    addToExcel(detailInformation)
                    informationOfCompanies.push(detailInformation)
                    console.log('--log info--')
                    console.log(informationOfCompanies)
                } catch (e) {
                    console.log('--3--')
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
            .then(function()  {
                const worksheet = workbook.getWorksheet("My Sheet");
                let lastRow = worksheet.lastRow.number;
                const getRowInsert = worksheet.getRow(++lastRow);
                getRowInsert.getCell('D').value = data.name;
                getRowInsert.getCell('H').value = data.description;
                getRowInsert.getCell('I').value = data.list_form.join(' \n ');
                getRowInsert.getCell('K').value = data.list_email.join(' \n ');
                getRowInsert.commit();
                return workbook.xlsx.writeFile(nameFileExcel);
            });
    }

    const autoScrollData = async (page) => {
        await page.waitForSelector('#search-results-container');
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
            });
        });
    }

    const escapeXpathString = str => {
        const splitedQuotes = str.replace(/'/g, `', "'", '`);
        return `concat('${splitedQuotes}', '')`;
    };

    const clickByText = async (page, text) => {
        const escapedText = escapeXpathString(text);
        const linkHandlers = await page.$x(`//button[contains(text(), ${escapedText})]`);

        if (linkHandlers.length > 0) {
            await linkHandlers[0].click();
        } else {
            throw new Error(`Link not found: ${text}`);
        }
    };

    const loginLinkedIn = async (page) => {
        await page.goto("https://www.linkedin.com/login")
        await page.waitForSelector('#username');
        await page.waitForSelector('#password');
        await page.type('#username', 'huynq@deha-soft.com');
        await page.type('#password', '0180301999');
        await clickByText(page, 'Sign in')
        await page.waitForNavigation()
    }
}())