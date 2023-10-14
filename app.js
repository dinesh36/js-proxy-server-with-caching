const express = require('express');
const {createProxyMiddleware, responseInterceptor} = require('http-proxy-middleware');

const CacheManager = require("./cache-manager");
require('dotenv').config();

class JsProxyWithCaching {
    constructor() {
        this.app = express();
        this.port = 3000;
        this.host = "localhost";
        this.proxyTarget = process.env.proxyTarget;
        this.cacheManager = new CacheManager();
    }

    proxyMethod() {
        return createProxyMiddleware(
            this.cacheManager.isPathNotCached.bind(this.cacheManager),
            {
                target: this.proxyTarget,
                changeOrigin: true,
                selfHandleResponse: true,
                onProxyRes: responseInterceptor(this.onProxyRes.bind(this)),
            });
    }

    init() {
        this.app.use('/', this.proxyMethod.bind(this)());
        this.app.listen(this.port, this.host, () => {
            console.log(`Starting Proxy at ${this.host}:${this.port}`);
        });
    }

    async onProxyRes(responseBuffer, proxyRes, req, res) {
        console.log('inside ==> ',req.url);
        if (req.url === '/portfolio/supermarket-web-app') {
            const response = responseBuffer.toString('utf8'); // convert buffer to string
            return response.replace('Hello', 'Hi'); // manipulate response and return the result
        }
        return responseBuffer;
        // return this.cacheManager.getCachedPathResponse(proxyRes, req, res);
    }
}

const jsProxyWithCaching = new JsProxyWithCaching();
jsProxyWithCaching.init();
