/**
 * Security check middleware
 */
var logger = require('log4js').getLogger('co.mockapi');
var config = require('../config/config');

var express = require('express');
var RedisStore = require('connect-redis')(express);

var userService = require('../service/userService');

var q = require('q');
var _ = require('underscore');
var Exception = require('../service/model/exception');

//Access Control List
var ACL = {
	methodMap: {
		get: "R",
		post: "W",
		put: "W",
		delete: "W"
	},

	roles: {
		"ADMIN USER": {
			"/api/admin/user/:id": {"R": 1, "W": 1},
			"/api/admin/user": {"R": 1, "W": 1},
			"/api/admin/user/:id/role": {"W": 1}
		}
	},

	//Check whether the role can do the action
	canDo: function(path, method, role){
		return ((this.roles[role] || {})[path] || {})[this.methodMap[method]] == 1;
	}
};

const ANONYMUS = '111111111111111111111111';

//Session middleware, to be used only on API or Dashboard
exports.session = express.session({
	secret: 'gositio like a sir',
	cookie: {maxAge: 30 * 24 * 60 * 60 * 1000},
	store: new RedisStore({
		url: config.keyStore.url
	})
});

//User Session Restricted
exports.restrict = function(req, res, next) {
	if (req.user = req.session.user) {
		next();
	} else {
		res.send(new Exception(403, 'Forbidden. No user session found.'));
	}
};

//User Session
exports.user = function(req, res, next) {
	if (!req.session.user) req.session.user = {_id: ANONYMUS, isAnonymus: true};
	req.user = req.session.user;
	next();
};

//If the user is anonymus, make the id always public prefixed
exports.project = function(req, res, next) {
	if(req.user._id === ANONYMUS){
		if(req.params.id) req.params.id = !req.params.id.match(/^public\-/) ? ['public', req.params.id].join('-') : req.params.id;
		if(req.body._id) req.body._id = !req.body._id.match(/^public\-/) ? ['public', req.body._id].join('-') : req.body._id;
	}
	next();
};

//Restricts operations by acl
exports.acl = function(req, res, next){
	logger.debug('acl : check for [%s, %s, %s]', (path = req.route.path), (method = req.route.method), (role = req.user.role));

	if(ACL.canDo(path, method, role))
		next();
	else
		res.send(new Exception(403, ['User has no permissions to', method, 'requested resource'].join(' ')));
};