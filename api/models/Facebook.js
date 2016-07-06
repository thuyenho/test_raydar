/**
 * Facebook.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	accessToken: {
	    type: 'string',
	    required: true,
	    unique: true,
    },

    expire: {
    	type: 'datetime',
    	required: true

    },

    fbId: {
	    type: 'string',
	    required: true,
	    unique: true,
    },

    owner: {
      model: 'user'
    }
  }
};

