/**
 * 400 (Bad Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest(data);
 * return res.badRequest(data, 'some/specific/badRequest/view');
 *
 * e.g.:
 * ```
 * return res.badRequest(
 *   'Please choose a valid `password` (6-12 characters)',
 *   'trial/signup'
 * );
 * ```
 */

module.exports = function badRequest(data, options) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;
  var dataTmp = new Object();
  // Set status code
  res.status(400);

  // Log error to console
  if (data !== undefined) {
    sails.log.verbose('Sending 400 ("Bad Request") response: \n',data);
    dataTmp.code =  !_.isUndefined(data['status']) ? data['status'] : 'E_NOR';
    dataTmp.desc = !_.isUndefined(data['code']) ? data['code'] : 400;
    dataTmp.message = req.__(dataTmp.desc);
    if (typeof data == 'object') {
      // delete some fields unnesscessary
      dataTmp['errors'] = data['Errors'] || data['error'];

      // convert validation error format to customize error
      // e.g: 
          // original format
              // {code: 400,
              //  invalideAttributes: 
              //  message: ...
              //  
              //  }

          // new format
              // {code: 400
              //  status: E_VALIDATE
              //  errors: {
              //    username: "User is required",
              //    password: "Password must at least 8 characters" 
              //    }  
      if (typeof dataTmp['errors'] == 'object') {      
        var fields = Object.keys(dataTmp['errors']);
         dataTmp.data = {};

        fields.forEach(function(field) {
          dataTmp.data[field] = dataTmp['errors'][field][0]['message'];
        });

      } else {
        dataTmp.message = data['error'];
      }

      // with only one error we would like to user 'string' instead of 'object'.
      // so that, change the field 'errors' to 'error'
      delete dataTmp['errors'];

      data = dataTmp;
    }
  }
  else sails.log.verbose('Sending 400 ("Bad Request") response');

  // Only include errors in response if application environment
  // is not set to 'production'.  In production, we shouldn't
  // send back any identifying information about errors.
  // if (sails.config.environment === 'production' && sails.config.keepResponseErrors !== true) {
  //   data = undefined;
  // }

  // If the user-agent wants JSON, always respond with JSON
  // If views are disabled, revert to json
  if (req.wantsJSON || sails.config.hooks.views === false) {
    return res.jsonx(data);
  }

  // If second argument is a string, we take that to mean it refers to a view.
  // If it was omitted, use an empty object (`{}`)
  options = (typeof options === 'string') ? { view: options } : options || {};

  // Attempt to prettify data for views, if it's a non-error object
  var viewData = data;
  if (!(viewData instanceof Error) && 'object' == typeof viewData) {
    try {
      viewData = require('util').inspect(data, {depth: null});
    }
    catch(e) {
      viewData = undefined;
    }
  }

  // If a view was provided in options, serve it.
  // Otherwise try to guess an appropriate view, or if that doesn't
  // work, just send JSON.
  if (options.view) {
    return res.view(options.view, { data: viewData, title: 'Bad Request' });
  }

  // If no second argument provided, try to serve the implied view,
  // but fall back to sending JSON(P) if no view can be inferred.
  else return res.guessView({ data: viewData, title: 'Bad Request' }, function couldNotGuessView () {
    return res.jsonx(data);
  });

};

