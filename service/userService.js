/**
 * User administration service
 */
var logger = require('log4js').getLogger('co.mockapi');
var mailerService = require('./mailerService');
var UserDao = require('./persistence/userDao');
var CacheDao = require('./persistence/cacheDao');

var User = require('./model/user');
var Exception = require('./model/exception');

var crypto = require('crypto');
var q = require('q');
var _ = require('underscore');

var USER_ROLES_KEY = 'U';

/**
 * Load the given _id
 */
exports.get = function(_id, onSuccess, onError){
	logger.info('user service : get : about to load the user [%s]', _id);
	
	var dao = new UserDao();
	dao.get(_id, onSuccess, onError);
};

/**
 * Load the given _id
 */
exports.getRoles = function(_id, onSuccess, onError){
	logger.debug('user service : get : about to load user roles [%s]', _id);
	
	var promise =
		CacheDao
			.fetch(
				[USER_ROLES_KEY, _id].join(':'),

				//On miss load roles
				function(){
					return new UserDao()
						.get(_id)
						.then(function(user){
							return user.roles;
						});
				});

	if(onSuccess) promise.done(onSuccess, onError);
	else return promise;
};

/**
 * Updates an existing user by the given URL
 */
exports.update = function(user, userPlain, onSuccess, onError){
	logger.info('user service : update : about to update a company user');
	
	try{

		var update = new User();
		update.fill(userPlain);

		//First of all check if the update values are valid
		if(!update.valid()){
			onError(new Exception(400, 'User has invalid fields', update.result.message));
			return;
		}

		//Verify if the user has changed the email
		if(update.email && user.email != update.email){
			//Generates 3 values: code (random code to validate the email), emailPrev, creationDate 
			update.code = crypto.pseudoRandomBytes(16).toString('hex');
			update.codeDate = new Date();
			update.emailPrev = user.email;
		}

		var userDao = new UserDao();
		userDao.update(
				user._id,
				update.getUpdate(), //Only update changed fields

				//onSuccess
				function(userDoc){
					//once the user has been updated, check if we have to send the email verification message
					if(user.email != userPlain.email){
						mailerService.sendVerifyEmail(userPlain);
					}
					
					//Update back the user
					_.extend(user, userPlain);
					onSuccess(user);
				}, 
				onError);

	}catch(err){
		logger.error('user service : update : error while posting company user ' + userPlain, err);
		onError(err);
	}
};

/**
 * Updates current users password
 */
exports.password = function(user, password, onSuccess, onError){
	logger.info('user service : password : about to update user password [_id: %s]', user._id);
	
	try{
		var userDao = new UserDao();

		//If the user already has password, validate the old one
		if(user.hashedPassword && password.old){
			var oldEncrypted = userDao.encrypt(password.old);
			if(oldEncrypted != user.hashedPassword){
				onError(new Exception(403, 'Invalid password'));
				return;
			}			
		}
			
		userDao.updatePassword(user._id, password.password, onSuccess, onError);
	}catch(err){
		logger.error('user service : password : error while updating user password [_id: %s]', user._id, err);
		onError(err);
	}
};

/**
 * Deletes an existing user
 */
exports.removeUser = function(user, onSuccess, onError){
	logger.info('user service : remove : about to delete a company user');
	
	try{
		//To make a user deleted, Set status = DEL, Set deletedMail = email, Set deletedId = id, Delete email, Delete id, Delete hashedPassword
		user.deletedId = user.id;
		user.deletedMail = user.email;
		user.status = 'DEL';
		delete user.email;
		delete user.id;
		delete user.hashedPassword;
				
		var userDao = new UserDao();
		userDao.save(
			user,
			//onSuccess
			function(docUser){
				logger.info('user service : remove : we have lost [%s]', user._id);
				mailerService.sendUserDeleted(docUser);
				onSuccess(docUser);
			},
			
			onError
		);
	}catch(err){
		logger.error('user service : remove : error while deleting user ' + user, err);
		onError(err);
	}
};

/**
 * Updates current users tutorial state
 */
exports.updateTutorial = function(user, tutorial, value, onSuccess, onError){
	logger.info('user service : updateTutorial : about to update user tutorial [_id: %s]', user._id);
	
	try{
		var userDao = new UserDao();
		userDao.updateTutorial(user._id, tutorial, value, onSuccess, onError);
	}catch(err){
		logger.error('user service : updateTutorial : error while updating user tutorial [_id: %s]', user._id, err);
		onError(err);
	}
};
