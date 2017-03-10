var logger = require('log4js').getLogger('co.mockapi');
var config = require('../../config/config');
var _ = require('underscore');

var security = require('../../middleware/security');
var projectService = require('../../service/projectService');

var Exception = require('../../service/model/exception');

//Export the router
module.exports = ProjectRouter;

/**
 *
 * The Project endpoint exposes a set of methods for managing project objects.
 */
function ProjectRouter(app){
	app.get('/api/project', security.session, security.restrict, list);
	app.get('/api/project/:id', security.session, security.user, security.project, get);
	app.post('/api/project/:id', security.session, security.user, security.project, post);
	app.put('/api/project/:id', security.session, security.user, security.project, put);
	app.del('/api/project/:id', security.session, security.user, security.project, del);
};

/**
 * To get a project object by the given id
 */
function list(req, res){
	var user = req.user;
	var projectId = req.params.id;

	logger.info('project router : list : list project by id ', projectId);

	try{
		projectService.list(
			user,

			//onSuccess
			function(projects){
				res.send(projects);
			},
		
			//onError
			function(err){
				res.send(err)
			});

	}catch(err){
		var title = 'Error while calling list project service';
		logger.error(title, err);
		res.send(new Exception(500, title, err.message, err));
	}
};

/**
 * To get a project object by the given id
 */
function get(req, res){
	var user = req.user;
	var projectId = req.params.id;

	logger.info('project router : get : get project by id ', projectId);

	try{
		projectService.get(
			projectId,

			//onSuccess
			function(project){
				project = project || Exception.notFound('Project', projectId);
				res.send(project);
			},
		
			//onError
			function(err){
				res.send(err)
			});

	}catch(err){
		var title = 'Error while calling get project service';
		logger.error(title, err);
		res.send(new Exception(500, title, err.message, err));
	}
};

/**
 * To post a project object by the given id
 */
function post(req, res){
	var user = req.user;
	var projectId = req.params.id;
	var project = req.body;

	logger.info('project router : post : insert project by id ', projectId);

	try{

		projectService.insert(
			user,
			projectId,
			project,

			//onSuccess
			function(newProject){
				res.send(newProject);
			},
		
			//onError
			function(err){
				res.send(err)
			});

	}catch(err){
		var title = 'Error while calling the insert project service';
		logger.error(title, err);
		res.send(new Exception(500, title, err.message, err));
	}
};

/**
 * To put a project object by the given id
 */
function put(req, res){
	var user = req.user;
	var projectId = req.params.id;
	var project = req.body;

	logger.info('project router : put : update project by id ', projectId);

	try{
		projectService.update(
			user,
			projectId,
			project,

			//onSuccess
			function(project){
				project = project || Exception.notFound('Project', projectId);
				res.send(project);
			},
		
			//onError
			function(err){
				res.send(err)
			});
	}catch(err){
		var title = 'Error while calling the update project service';
		logger.error(title, err);
		res.send(new Exception(500, title, err.message, err));
	}
};

/**
 * To del a project object by the given id
 */
function del(req, res){
	var user = req.user;
	var projectId = req.params.id;

	logger.info('project router : del : remove project by id ', projectId);

	try{
		projectService.delete(
			user,
			projectId,

			//onSuccess
			function(newProject){
				res.send(newProject);
			},
		
			//onError
			function(err){
				res.send(err)
			});
	}catch(err){
		var title = 'Error while calling the remove project service';
		logger.error(title, err);
		res.send(new Exception(500, title, err.message, err));
	}
};