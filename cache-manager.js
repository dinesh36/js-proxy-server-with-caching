const path = require('path');
const fs = require('fs');
const axios = require('axios');

class CacheManager{
    constructor(proxyTarget) {
        this.proxyTarget = proxyTarget;
        this.plainProxyTarget = proxyTarget
            .replace('http://', '') //remove http from beginning
            .replace('https://', '') //remove https from beginning
            .replace(/\/+$/, '') //remove last "/"
    }

    getCacheRequestFilePath(url){
        const fileName =  `${btoa(url)}${url}-request.json`
            .replace(/\//g,'-')
            .replace(/\\/g,'-');
        return path.join('.','cached-data',fileName);
    }

    removeCachedRequestFile(url){
        const cachedFilePath = this.getCacheRequestFilePath(url);
        if(fs.existsSync(cachedFilePath)){
            fs.unlinkSync(cachedFilePath);
        }
    }

    cacheRequest(req){
        console.log('caching ==> ', req.url);
        const cachedRequestData = {
            url: `${this.proxyTarget.replace(/\/+$/, '')}${req.url}`,
            method: req.method,
            headers: req.headers
        };
        fs.writeFileSync(this.getCacheRequestFilePath(req.url), JSON.stringify(cachedRequestData, null, 4));
    }

    getCachedRequest(url){
        const cachedFilePath = this.getCacheRequestFilePath(url);
        if(fs.existsSync(cachedFilePath)){
            return fs.readFileSync(cachedFilePath).toString();
        }
        return null;
    }

    async callCachedRequest(url){
        console.log('Checking for cached request for ==>', url);
        const cachedAPIRequestStr = this.getCachedRequest(url);
        if(cachedAPIRequestStr) {
            console.log('Found cache here calling API here ==>');
            try {
                const requestData = JSON.parse(cachedAPIRequestStr);
                const headers = {
                    ...requestData.headers,
                    host: this.plainProxyTarget
                }
                const response = await axios.request({
                    ...requestData,
                    headers,
                });
                console.log('Cached call success with response ==> ', response.data);
            } catch(e){
                this.removeCachedRequestFile(url);
                console.error('Error in cache request ==>', e?.response?.data || e);
            }
        } else {
            console.log('Cache not found, ignoring ..')
        }
    }
}

module.exports = CacheManager;
