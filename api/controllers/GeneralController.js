/**
 * GeneralController
 *
 * @description :: Server-side logic for managing generals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	change_password: function(req, res) {
		return res.view('change_password');
	},

	profile: function(req, res) {
		return res.view('profile');
	},

	welcome: function(req, res) {
		return res.view('welcome');
	}
};

