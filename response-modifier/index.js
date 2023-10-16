const modifiedResponse = require('./modified-responses');
const replacedResponses = require('./replaced-responses');

class ResponseModifier{
    modifyApiResponse(responseBuffer, proxyRes, res){
        const url = proxyRes.req.path;
        let originalResponse = responseBuffer.toString('utf8');
        try{
            originalResponse = JSON.parse(originalResponse); //parse to JSON if possible
        }   catch(e){
            //Do nothing
        }
        if(modifiedResponse[url]){
            console.log('updating the response ==> ', url);
            return JSON.stringify(modifiedResponse[url](originalResponse));
        } else if(replacedResponses[url]){
            console.log('replacing the response ==> ', url);
            return this.replaceApiResponse(res, url)
        } else {
            return responseBuffer;
        }
    }

    replaceApiResponse(res,url){
        res.statusCode = 200;
        return JSON.stringify(replacedResponses[url]);
    }
}

module.exports = ResponseModifier;
