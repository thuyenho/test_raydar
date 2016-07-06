/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var moment = require('moment');
var bcryptjs = require('bcryptjs');


module.exports = {
	register: function(req, res) {
		var params = req.allParams();
		var needles = ['fullName', 'email', 'password', 'rePassword'];

		if (notEnoughParams(params, needles)) {
			return res.resError('INVALID_PARAM');
		} else {
			if (params.password != params.rePassword) {
				return res.resError('PASSWORD_NOT_MATCH');
			} else {
				User.create(params).exec((err, user) => {
					if (err) return res.badRequest(err);
					setSessionForLoggedUser(req, user.id);
					return res.resSuccess('REGISTER_SUCCESS');
				});
			}
		}
	},

	login: function(req, res) {
    	var params = req.allParams();
    	var needles = ['email', 'password'];

	    if (notEnoughParams(params, needles)) {
      		return res.resError('INVALID_PARAM');
   		} else {
      	User.findOne({email: params.email}).exec((err, user) => {
          	if (err) {
            	return res.resError('SYSTEM_MAINTAIN');
          	} else {
            	if (user) {
              		if (!user.password) {
                		return res.resError('ACCOUNT_NOT_SET_PASSWORD');
              		} else if (bcryptjs.compareSync(params.password, user.password)){
              			setSessionForLoggedUser(req, user.id);
                		return res.resSuccess('LOGIN_SUCCESS');
              		} else {
                		return res.resError('INCORRECT_PASSWORD');
              		}
            	} else {
              		return res.resError('ACCOUNT_NOT_EXIST');
            	}
          	}
      });
    }
 	},

	login_or_register_via_facebook: function(req, res) {
		var params = req.allParams();
		var needles = ['fbAccessToken', 'fbExpiresIn'];

		if (notEnoughParams(params, needles)) {
			return res.resError('INVALID_PARAM');
		} else {
			facebookAPI.verifyToken(params.fbAccessToken).then(response => {
				var now = moment();
				var fbId = response.id;
				var expireInSecond = parseInt(params.fbExpiresIn);
				var fbAccessToken = params.fbAccessToken;
				var expire = now.add(expireInSecond, 'second').toString();

				Facebook.findOne({fbId: fbId}).populate('owner').exec((err, fbExisted) => {
					if (err) return res.resError('LOGIN_FB_FAIL');
					if (fbExisted) {
						// update accessToken
						fbExisted.accessToken = params.fbAccessToken;
						fbExisted.expire = expire;
						fbExisted.save(() => {
							setSessionForLoggedUser(req, fbExisted.owner);
							return res.resSuccess('LOGIN_FB_SUCCESS');
						});

					} else {
						User.create({
							fullName: response.name,
							email: response.email
						}).exec((err, user) => {
							if (err) return res.badRequest(err);

							Facebook.create({
								fbId: fbId,
								accessToken: fbAccessToken,
								expire: expire,
								owner: user.id

							}).exec((err, fb) => {
								if (err) return res.resError('LOGIN_FB_FAIL');

								setSessionForLoggedUser(req, user.id);
								return res.resSuccess('REGISTER_FB_SUCCESS');
							});
						});

					}
				});

			}).catch( function(e) {
				return res.resError('LOGIN_FB_FAIL');
			});
		}
	},

	profile: function(req, res) {
		var params = req.allParams();
		var user = req.session.user;

		try {
			User.findOne(user).exec((err, user) => {
				var hasPassword = user.password;
				if (req.method == 'GET') {
					// user did set password
						if (!hasPassword) {
							return res.resSuccess('USER_NOT_SET_PASSWORD', user);
						} else {
							return res.resSuccess('GET_PROFILE_SUCCESS', user);
						}
				} else if (req.method == 'POST') {
					var needles = ['fullName', 'email'];
					var updatedData = {
						fullName: params.fullName, 
						email: params.email,
					};

					if (!hasPassword) {
						needles.push('password');
						updatedData.password = params.password;
					} 

					if (notEnoughParams(params, needles)) {
						return res.resError('INVALID_PARAM');
					} else {
						User.update({id: user.id}, updatedData)
						.exec((err, user) => {
							if (err) return res.badRequest(err);
							return res.resSuccess('UPDATE_PROFILE_SUCCESS', user);
						});
					}
				} else {
					return res.badRequest();
				}
			});
		} catch (e) {
			return res.res.resError('MAINTAINANCE_SYSTEM');
		}
		
	},

	change_password: function(req, res) {
		var params = req.allParams();
		var user = req.session.user;
		needles = ['password', 'rePassword'];

		if (notEnoughParams(params, needles)) {
			return res.resError('INVALID_PARAM');
		} else {
			if (params.password != params.rePassword) {
				return res.resError('PASSWORD_NOT_MATCH');
			} else {
				User.update({id: user}, {password: params.password}).exec((err, user) => {
					if (err) return res.badRequest(err);
					return res.resSuccess('CHANGE_PASSWORD_SUCCESS');
				});
			}
		}
	}	
};

function notEnoughParams(params, needles) {
	for (var p=0; p < needles.length; p++) {
		if (!params[needles[p]]) return true;
	}
	return false;
}

function setSessionForLoggedUser(req, user) {
	req.session.authenticated = true;
	req.session.user = user;
}