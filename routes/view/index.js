var logger = require('log4js').getLogger('co.mockapi');
var config = require('../../config/config');
var _ = require('underscore');

var fs = require('fs');
var jade = require('jade');
var stylus = require('stylus');

var security = require('../../middleware/security');
var projectService = require('../../service/projectService');

var Exception = require('../../service/model/exception');

//Export the router
module.exports = IndexRouter;

/**
 *
 * The Authentication endpoint exposes a set of methods for managing authentication.
 */
function IndexRouter(app) {
	app.get('/', index);
	app.get('/_m_/projects', security.session, security.user, projects);

	//To resolve all resources
	app.get('/', resources);
	app.all('/*', resources);
};

/**
 * Helper to render a index of a partial, embbeded on a full container
 */
function index(req, res, next) {
	var host = req.header('host').split('.').reverse().pop();

	logger.debug('index router : index : rendering ', host);

	//Route to the dash baby
	if (host === config.host) {
		res.redirect('/_m_/projects');
		//Otherwise route to the project
	} else {
		next();
	}

};

/**
 * Helper to render a index of a partial, embbeded on a full container
 */
function projects(req, res) {
	var user = req.user;
	logger.debug('index router : projects : rendering ', user);
	res.render('dashboard/main', {user});
};

/**
 * Renders the mocked API response
 */
function resources(req, res, next) {
	var host = req.header('host').split('.').reverse().pop();

	//If the host is dashboard, omit this
	if(host === config.host){
		next();
		return;
	}

	logger.debug('resources : check for [%s, %s, %s]', (path = req.originalUrl), (method = req.route.method), (host));

	//Allow CORS
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	try {
		projectService
			.get(host)
			.done(
				//success
				function(project) {
					if (project) {
						res.send(project);
					} else {
						res.status(404).send(Exception.notFound('Project', host));
					}
				},

				//error
				function(err) {
					res.send(err);
				});

	} catch (err) {
		var title = 'Error loading project';
		logger.error(title, err);
		res.status(500).send(new Exception(500, title, err.message, err));
	}
}