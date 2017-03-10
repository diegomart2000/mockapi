/**
 * Base Database DAO Object Module
 */

var logger = require('log4js').getLogger('co.mockapi');
var config = require('../../config/config');
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;


var db = mongojs(
	config.db.connection, 
	[
		'users', 
		'events.timed', 
		'sequences',
		'projects'
	]);

module.exports = db;