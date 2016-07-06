/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	attributes: {
		fullName: {
		  required: true,
		  type: 'string',
		},

		email: {
		  required: true,
		  type: 'email',
		  unique: true,
		},

		password: {
		  type: 'string',
		  minLength: 8,
		  defaultsTo: ''
		},

		facebook: {
	      collection: 'facebook',
	      via: 'owner'
	    }
	},

	beforeCreate: function(values, cb) {
		encryptPassword(values, cb);
	},

	beforeUpdate: function(values, cb) {
		encryptPassword(values, cb);
	}
};

function encryptPassword(values, cb) {
	var password = values.password;
	if (password) {
		values.password = utils.hashPassword(values.password);
	}
	cb();
}