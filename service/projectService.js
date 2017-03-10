/**
 * Project administration service
 */
var logger = require('log4js').getLogger('co.mockapi');
var mailerService = require('./mailerService');
var userService = require('./userService');

var ProjectDao = require('./persistence/projectDao');

var Project = require('./model/project');
var Exception = require('./model/exception');

var crypto = require('crypto');
var q = require('q');
var _ = require('underscore');

/**
 * Load the given _id
 */
exports.list = function(user, onSuccess, onError) {
	logger.info('project service : list : about to load the project [%s]', user._id);

	var userId = typeof user._id == 'string' ? ProjectDao.ObjectId(user._id) : user._id;

	try{
		var dao = new ProjectDao();
		var promise = dao
			.list({userId});

		if(onSuccess) promise.done(onSuccess, onError);
		else return promise;

	} catch (err) {
		logger.error('project service : list : error while listing project ', userId, err);
		onError(err);
	}
};

/**
 * Load the given _id
 */
exports.get = function(projectId, onSuccess, onError) {
	logger.info('project service : get : about to load the project [%s]', projectId);

	try{
		var dao = new ProjectDao();
		var promise = dao
			.get(projectId)
			//Compile paths
			.then(project => {
				project.resources.forEach(resource => {
					logger.debug(`project service : get : compiled path ${resource.path.match(/(:[a-zA-Z0-9]+)/g)}`);
				});

				return project;
			});

		if(onSuccess) promise.done(onSuccess, onError);
		else return promise;
	} catch (err) {
		logger.error('project service : get : error while getting project ', projectId, err);
		onError(err);
	}
};

/**
 * Updates an existing project by the given _id
 */
exports.insert = function(user, plain, onSuccess, onError) {
	logger.info('project service : insert : about to insert a project');

	try {

		var project = new Project();
		project.fill(plain);

		//then check if the insert values are valid
		if (!project.valid()) {
			onError(new Exception(400, 'Project has invalid fields', project.result.message));
			return;
		}

		new ProjectDao()
			.insert(user._id, project)
			.done(onSuccess, onError);

	} catch (err) {
		logger.error('project service : insert : error while updating project ', plain, err);
		onError(err);
	}
};

/**
 * Updates an existing project by the given _id
 */
exports.update = function(user, projectId, plain, onSuccess, onError) {
	logger.info('project service : update : about to update a project');

	try {

		var project = new Project();
		project.fill(plain);

		//First of all check if the update values are valid
		if (!project.valid()) {
			onError(new Exception(400, 'Project has invalid fields', project.result.message));
			return;
		}

		var dao = new ProjectDao();
		dao.update(
				user._id,
				projectId,
				project.getUpdate() //Only update changed fields
			)
			.done(onSuccess, onError);

	} catch (err) {
		logger.error('project service : update : error while updating project ', plain, err);
		onError(err);
	}
};

/**
 * Deletes an existing project
 */
exports.delete = function(user, projectId, onSuccess, onError) {
	logger.info('project service : remove : about to delete project ', projectId);

	try {
		var dao = new ProjectDao();
		dao
			.delete(user._id, projectId)
			.done(onSuccess, onError)

	} catch (err) {
		logger.error('project service : remove : error while deleting project ', projectId, err);
		onError(err);
	}
};