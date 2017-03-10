var logger = require('log4js').getLogger('co.mockapi');

var Exception = require('../service/model/exception');

//Export the middleware
module.exports = ErrorHandlerMiddleware;

/**
 * Error Handler Middleare Setups the error handlers on the application
 */
function ErrorHandlerMiddleware(app){
	app.use(function(err, req, res, next) {
		logger.error('ERROR HANDLER : internal server error: ', err);

		res.status(500).send(
			new Exception()
				.fromError(500, "Internal Server Error", err.message, req.requestId, err)
		);
	});
};