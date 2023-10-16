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
        }
        return responseBuffer;
    }

    replaceApiResponse(proxyReq, req, res){
        const url = req.url;
        if(replacedResponses[url]){
            console.log('replacing the response ==> ', url);
            res.end(JSON.stringify(replacedResponses[url]));
        }
    }
}

module.exports = ResponseModifier;
