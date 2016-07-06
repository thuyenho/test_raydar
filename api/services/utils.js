var bcryptjs = require('bcryptjs');

module.exports = {

	hashPassword(password) {
    var salt = bcryptjs.genSaltSync(10),
        encryptedPassword = bcryptjs.hashSync(password, salt);

    return encryptedPassword;
  },
}