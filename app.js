const express = require('express');
const {createProxyMiddleware, responseInterceptor} = require('http-proxy-middleware');
const AUTH_CHECK_API = '/api/user';
const AUTH_CHECK_INTERVAL = 1000 * 30 // 1000 * 30 // Thirty Seconds

const CacheManager = require("./cache-manager");
require('dotenv').config();

class JsProxyWithCaching {
    constructor() {
        this.app = express();
        this.port = 3000;
        this.host = "localhost";
        this.proxyTarget = process.env.proxyTarget;
        this.cacheManager = new CacheManager(this.proxyTarget);
    }

    proxyMethod() {
        return createProxyMiddleware({
            target: this.proxyTarget,
            changeOrigin: true,
            selfHandleResponse: true,
            onProxyRes: responseInterceptor(this.onProxyRes.bind(this)),
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

    async onProxyRes(responseBuffer, proxyRes, req) {
        if (req.url === AUTH_CHECK_API) {
            this.cacheManager.cacheRequest(req);
        }
        return responseBuffer;
    }
}

const jsProxyWithCaching = new JsProxyWithCaching();
jsProxyWithCaching.init();
