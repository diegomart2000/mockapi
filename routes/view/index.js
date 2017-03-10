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
	app.get('/projects', security.session, projects);

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
	if(host === config.host){
		res.redirect('/projects');
	//Otherwise route to the project
	}else{
		next();
	}

};

/**
 * Helper to render a index of a partial, embbeded on a full container
 */
function projects(req, res) {
	res.send(req.session.id);
};

function resources(req, res) {
	var host = req.header('host').split('.').reverse().pop();

	logger.debug('resources : check for [%s, %s, %s]', (path = req.originalUrl), (method = req.route.method), (host));
	try {
		projectService
			.get(host)
			.done(
				//success
				function(project){
					if(project){
						res.send(project);
					}else{
						res.send(Exception.notFound('Project', host));
					}
				},

				//error
				function(err){
					res.send(err);
				});

		} catch (err) {
			var title = 'Error loading project';
			logger.error(title, err);
			res.send(new Exception(500, title, err.message, err));
		}
}
