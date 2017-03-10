/**
 * Timed Events DAO Object Module
 */
var logger = require('log4js').getLogger('co.mockapi');
var config = require('../../config/config');
var mongojs = require('mongojs');
var q = require('q');

var db = require('./databaseDao');

/**
 * Events DAO Class
 */
function EventsDao(){
	this.collection = db.collection('events.timed');
	return this;
}

/**
 * To register an event that will expire in 4hs
 */
EventsDao.prototype.register = function(event, onSuccess, onError){
	logger.info('events dao : register : about to register event');
	var collection = this.collection;

	try{
		event._id = db.ObjectId();
		event.creationDate = new Date();
		collection.save(event);
		onSuccess(event);
	}catch(err){
		logger.error('events dao : register : Error while trying to save event', err);
		onError(err);
	}
};

/**
 * To get an event by its Id
 */
EventsDao.prototype.getById = function(id, onSuccess, onError){
	logger.info('events dao : getById : finding event [%s]', id);
	var collection = this.collection;

	try{
		var _id = db.ObjectId(id);
		collection.findOne(
				{_id: _id},
				function(err, docEvent){
					if(!err){
						onSuccess(docEvent);
					}else{
						logger.error('events dao : getById : Error while trying to load event [%s]', id, err);
						onError(err);
					}
				});
	}catch(err){
		logger.error('events dao : getById : Error while trying to load event [%s]', id, err);
		onError(err);
	}
};

/**
 * To remove an event by its Id
 */
EventsDao.prototype.remove = function(id, onSuccess, onError){
	logger.info('events dao : register : about to register event');
	var collection = this.collection;

	try{
		var _id = db.ObjectId(id);
		collection.findOne(
				{_id: _id},
				function(err, docEvent){
					if(!err){
						onSuccess(docEvent);
					}else{
						logger.error('users dao : getUserByEmail : Error while trying to load user', err);
						onError(err);
					}
				});
		onSuccess(event);
	}catch(err){
		logger.error('events dao : register : Error while trying to save event', err);
		onError(err);
	}
};

module.exports = EventsDao;