/**
 * Project DAO Object Module
 */
var logger = require('log4js').getLogger('co.mockapi');
var config = require('../../config/config');
var SequenceDao = require('./sequenceDao');
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;
var q = require('q');
var _ = require('underscore');

var db = require('./databaseDao');

/**
 * Project DAO Class
 */
function ProjectDao(){
	this.projects = db.collection('projects');
	
	return this;
}

/**
 * GET a list of projects
 * projects
 */
ProjectDao.prototype.list = function(query, onSuccess, onError){
	logger.info('projects dao : list : about to load projects');
	try{
		var projects = this.projects;

		var promise = 
			q.Promise((resolve, reject) => {
				projects.find(query)
					.sort({_id: -1})
					.toArray(function(err, docs) {
						if(!err){
							resolve(docs);
						}else{
							logger.error('projects dao : list : Error while trying to load projects', err);
							reject(err);
						}
					});
			});

	
		if(onSuccess)
			promise.done(onSuccess, onError);
		else
			return promise;

	}catch(error){
		logger.error('projects dao : list : failed to load projects', query, error);
		if(onError) onError(error);
		else throw error;
	}
};

/**
 * GET a project for a given projectId
 * projectId <String>
 */
ProjectDao.prototype.get = function(projectId, onSuccess, onError){
	logger.info('projects dao : get : about to load project [%s]', projectId);
	try{
		var projects = this.projects;
	
		var queryParam = {_id: projectId};
	
		var promise = 
			(function(){
				var deferred = q.defer();
	
				projects.findOne(queryParam, function(err, doc) {
					if(!err){
						deferred.resolve(doc);
					}else{
						logger.error('projects dao : get : Error while trying to load project', err);
						deferred.reject(err);
					}
				});
	
				return deferred.promise;
			})();
	
		if(onSuccess)
			promise.done(onSuccess, onError);
		else
			return promise;
		
	}catch(error){
		logger.error('projects dao : get : failed to load project', projectId, error);
		if(onError) onError(error);
		else throw error;
	}
};

/**
 * Inserts a brand new project.
 * user <User model, as owner>
 * projectId <String, unique project id>
 */
ProjectDao.prototype.insert = function(userId, project, onSuccess, onError){
	logger.info('projects dao : insert : about to save project for user ', userId);
	try{
		
		var projects = this.projects;

		project._id = project._id.toLowerCase(); //Project Id must be provided as string, if not, create a new one, but an ugly one
		project.userId = typeof userId == 'string' ? db.ObjectId(userId) : userId; //Convert the string into an ObjectId
		
		project.creationDate = new Date().getTime();
	
		var promise = 
			q.Promise((resolve, reject) => {
				projects.insert(project, {safe: true}, function(err, doc) {
					if(!err){
						logger.info('projects dao : insert : done for [%s]', project._id);
						resolve(project);
					}else{
						logger.error('projects dao : insert : failed to save project', err);
						reject(err);
					}
	
				});
			})
	
		if(onSuccess)
			promise.done(onSuccess, onError);
		else
			return promise;
	
	}catch(error){
		logger.error('projects dao : insert : failed to save project', error);
		if(onError) onError(error);
		else throw error;
	}
};

/**
 * Updates the project with the values given on updates param
 * userId <project owner id>
 * projectId <project id to be updated>
 * updates <values to be updated>
 */
ProjectDao.prototype.update = function(userId, projectId, updates, onSuccess, onError){
	logger.info('projects dao : update : about to update project');
	try{
		var projects = this.projects;
		
		var userOId = typeof userId == 'string' ? db.ObjectId(userId) : userId; //Convert the string into an ObjectId

		var promise = 
			q.Promise((resolve, reject) => {

				projects.findAndModify(
					{
						query: {_id: projectId, userId: userOId},
						update: {"$set": updates},
						new: true
					},

					(err, result) => {
						if(!err){
							logger.info('projects dao : update : done for [%s]', projectId);
							resolve(result);
						}else{
							logger.error('projects dao : update : failed to update project', err);
							reject(err);
						}
					});	
			});
		
		if(onSuccess)
			promise.done(onSuccess, onError);
		else
			return promise;
	
	}catch(error){
		logger.error('projects dao : update : failed to update project', error);
		if(onError) onError(error);
		else throw error;
	}
};

/**
 * Delete a given project
 * Only owner user can delete it's project
 */
ProjectDao.prototype.delete = function(userId, projectId, onSuccess, onError){
logger.info('projects dao : delete : about to delete project');
	try{
		
		var projects = this.projects;
		var userOId = typeof userId == 'string' ? db.ObjectId(userId) : userId; //Convert the string into an ObjectId

		var promise = 
			(function(){
				var deferred = q.defer();
				projects.remove({_id: projectId, userId: userOId}, function(err, result) {
					if(!err){
						logger.info('projects dao : delete : done for [%s]', projectId);
						deferred.resolve(projectId);

					}else{
						logger.error('projects dao : delete : failed to delete project', err);
						deferred.reject(err);
					}
				});

				return deferred.promise;
			})();
		
		if(onSuccess)
			promise.done(onSuccess, onError);
		else
			return promise;

	}catch(error){
		logger.error('projects dao : delete : failed to delete project', error);
		if(onError) onError(error);
		else throw error;
	}
};

ProjectDao.ObjectId = db.ObjectId;

module.exports = ProjectDao;