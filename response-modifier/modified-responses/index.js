const modifiedResponses = {
    '/api/webhooks/list/subscriptions': (originalResponse)=>{
        return {
            ...originalResponse,
            data:{
                ...originalResponse.data,
                data: [
                    { topicId: ':::::123', dateCreated: new Date().toString(), pendingConfirmation: 'true' },
                    { topicId: ':::::123', dateCreated: new Date().toString(), pendingConfirmation: 'false' },
                    { topicId: ':::::123', dateCreated: new Date().toString(), pendingConfirmation: 1 },
                    { topicId: ':::::123', dateCreated: new Date().toString(), pendingConfirmation: '' },
                ]
            }
        };
    }
}

module.exports = modifiedResponses;
