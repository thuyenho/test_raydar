var axios = require('axios');
var facebookProfile = 'https://graph.facebook.com/me';

module.exports = {
    verifyToken: function (fb_access_token) {
        return new Promise((resolve, reject) => {
            var field = 'id,name,email';
            var link = facebookProfile + `/?access_token=${fb_access_token}&fields=${field}`;
            axios.get(link).then(response => {
                resolve(response.data)
            }, error => {
                reject(error);
            });
        });
    },
};
