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
        this.port = 3005;
        this.host = "localhost";
        this.proxyTarget = process.env.proxyTarget;
        this.APIProxyTarget = process.env.APIProxyTarget;
        this.cacheManager = new CacheManager(this.proxyTarget);
        this.responseModifier = new ResponseModifier();
    }

    proxyMethod({target, path}) {
        return createProxyMiddleware(path, {
            target,
            changeOrigin: true,
            selfHandleResponse: true,
            onProxyRes: responseInterceptor(this.onProxyRes.bind(this))
        });
    }

    init() {
        this.app.use('/api/*', this.proxyMethod.bind(this)({target: this.APIProxyTarget, path: '/api/*'}));
        this.app.use('/*', this.proxyMethod.bind(this)({target: this.proxyTarget, path: '/'}));
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
