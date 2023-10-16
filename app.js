const express = require('express');
const {createProxyMiddleware, responseInterceptor} = require('http-proxy-middleware');
const AUTH_CHECK_API = '/api/user';
const AUTH_CHECK_INTERVAL = 1000 * 60 // 1000 * 60 // One Minute

const CacheManager = require("./cache-manager");
const ResponseModifier = require("./response-modifier");
require('dotenv').config();

class JsProxyWithCaching {
    constructor() {
        this.app = express();
        this.port = 3000;
        this.host = "localhost";
        this.proxyTarget = process.env.proxyTarget;
        this.cacheManager = new CacheManager(this.proxyTarget);
        this.responseModifier = new ResponseModifier();
    }

    proxyMethod() {
        return createProxyMiddleware({
            target: this.proxyTarget,
            changeOrigin: true,
            selfHandleResponse: true,
            onProxyRes: responseInterceptor(this.onProxyRes.bind(this)),
            onProxyReq: this.responseModifier.replaceApiResponse.bind(this.responseModifier)
        });
    }

    init() {
        this.app.use(this.proxyMethod.bind(this)());
        this.app.listen(this.port, this.host, () => {
            console.log(`Starting Proxy at ${this.host}:${this.port}`);
        });
        this.setAuthWithInterval();
    }

    setAuthWithInterval(){
        setInterval(async ()=>{
            await this.cacheManager.callCachedRequest(AUTH_CHECK_API);
        }, AUTH_CHECK_INTERVAL);
    }

    async onProxyRes(responseBuffer, proxyRes, req, res) {
        if (req.url === AUTH_CHECK_API) {
            this.cacheManager.cacheRequest(req, res);
        }
        // const modifiedResponse = this.responseModifier.modifyAssetResponse(responseBuffer, proxyRes);
        return this.responseModifier.modifyApiResponse(responseBuffer, proxyRes, res);
    }
}

const jsProxyWithCaching = new JsProxyWithCaching();
jsProxyWithCaching.init();
