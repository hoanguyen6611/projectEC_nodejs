const jwt = require('jsonwebtoken'); 

module.exports = function(req, stringQuery){
    if (req.headers.cookie){
        const cookies = req.headers.cookie.split('; '); 
        const singleCookie = {}; 
        cookies.forEach(cookies => {
            const cookie = cookies.split('='); 
            var cookieName = cookie[0]; 
            var cookieValue = cookie[1]; 
            singleCookie[cookieName] = cookieValue 
        });

        if (singleCookie['token']){
            var valueIndexInCookie = singleCookie['token'].split('%2F'); 
            if (stringQuery == 'getToken'){
                return valueIndexInCookie[1];
            }
            else if (stringQuery == 'getTenTK'){
                return valueIndexInCookie[0];
            }
        }
        return null;
    }
    else {
        return null;
    }
}