class CacheManager{
    constructor() {
        this.cacheType = 'fileCache';
        this.cachedPaths = ['/client_204'];
    }

    isPathNotCached(pathName){
        return !this.cachedPaths.includes(pathName);
    }

    getCachedPathResponse(proxyRes, req, res){
        console.log('inside the cached response here...');
        return proxyRes;
    }
}

module.exports = CacheManager;
