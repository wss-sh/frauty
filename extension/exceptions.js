class DomainExceptions {
    constructor() {
        this.storageKey = 'trusted_domains';
    }

    async getTrustedDomains() {
        const result = await chrome.storage.local.get(this.storageKey);
        return result[this.storageKey] || [];
    }

    async addTrustedDomain(domain) {
        const trustedDomains = await this.getTrustedDomains();
        if (!trustedDomains.includes(domain)) {
            trustedDomains.push(domain);
            await chrome.storage.local.set({ [this.storageKey]: trustedDomains });
        }
    }

    async removeTrustedDomain(domain) {
        const trustedDomains = await this.getTrustedDomains();
        const updatedDomains = trustedDomains.filter(d => d !== domain);
        await chrome.storage.local.set({ [this.storageKey]: updatedDomains });
    }

    async isTrusted(domain) {
        const trustedDomains = await this.getTrustedDomains();
        return trustedDomains.includes(domain);
    }
}

// Make it available globally
window.domainExceptions = new DomainExceptions(); 