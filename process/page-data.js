export default class PageData {
    constructor () {
        this.linksContactFounded = []
        this.linksFoundOnPage = []
        this.signals = ['/contact', '/contact-us', '/contacts', '/contact/']
        this.contactInformation = {}
    }

    findContactLink (baseUrl, title, dataLinks) {
        this.setBaseUrl(baseUrl)
        this.setContactInformation(title)
        this.findLinkHadSignal(dataLinks)

        if (this.linksContactFounded.length > 0) {
            this.setFullURL()
            this.formatURL()
            this.setLinksContactFounded()
        }
    }

    findLinkHadSignal(dataLinks) {
        this.setLinksFoundOnPage(dataLinks)
        if (this.linksFoundOnPage.length > 0) {
            this.linksContactFounded = this.linksFoundOnPage.filter(linkResult => {
                return linkResult !== null && this.signals.some(signal => linkResult.includes(signal))
            })
        }
    }

    getContactInformation (baseUrl, title, dataLinks) {
        this.findContactLink (baseUrl, title, dataLinks)
        return this.contactInformation;
    }

    setLinksContactFounded () {
        this.linksContactFounded = [...new Set(this.linksContactFounded)];
        this.linksContactFounded = this.linksContactFounded.filter((item) => {
            return this.isValidURL(item)
        })
        this.contactInformation.list_form = this.linksContactFounded;
    }

    setLinksFoundOnPage (data) {
        this.linksFoundOnPage = data
    }

    setBaseUrl (url) {
        this.baseUrl = url
    }

    setFullURL () {
        this.linksContactFounded.forEach((item, index) => {
            if (!this.isValidURL(item)) {
                if (item.charAt(0) !== '/' && item.charAt(0) !== '#' ) {
                    item = '/' + item;
                }
                this.linksContactFounded[index] = this.baseUrl + item;
            }
        });
    }

    formatURL () {
        this.linksContactFounded.forEach((item, index) => {
            if (item.charAt(item.length-1) !== '/') {
                this.linksContactFounded[index] = item + '/';
            }
        });
    }

    setContactInformation (title) {
        return this.contactInformation = {
            list_form: [this.baseUrl],
            company_description: title
        };
    }

    isValidURL (string = '') {
        const pattern = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi) // fragment locator
        return !!pattern.test(string)
    }

}