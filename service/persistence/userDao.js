/**
 * User DAO Object Module
 */
var logger = require('log4js').getLogger('co.mockapi');
var config = require('../../config/config');
var User = require('../model/user');
var crypto = require('crypto');
var q = require('q');

var db = require('./databaseDao');

/**
 * Users DAO Class
 */
function UsersDao(){
	this.users = db.collection('users');
	return this;
}

/**
 * To verify if the user exists, if not create it
 */
UsersDao.prototype.register = function(user, onSuccess, onError){
	logger.info('users dao : register : about to register user');
	var users = this.users;
	var dao = this;

	(function(){
		var deferred = q.defer();
		try{
			//Generates 3 values: code (random code to validate the email), emailPrev, creationDate 
			user.creationDate = new Date();
			user.code = crypto.pseudoRandomBytes(16).toString('hex');
			user.codeDate = user.creationDate;
			user.emailPrev = user.email;
			user.tutorial = {};

			//Hash the password
			user.hashedPassword = dao.encrypt(user.password);
			delete user.password;
		
			//Generate the id
			user._id = db.ObjectId(); //Play nice with backbone

			users.insert(user);
			
			deferred.resolve(user);
		}catch(err){
			logger.error('users dao : register : Error while trying to save user', err);
			deferred.reject(err);
		}

		return deferred.promise;
	})().then(onSuccess, onError);
};

/**
 * To login a user for the given email and password
 */
UsersDao.prototype.login = function(email, password, onSuccess, onError){
	logger.info('users dao : login : about to login user');
	var users = this.users;
	var hashed = this.encrypt(password);
	
	users.findOne( 
		{email: email, hashedPassword: hashed},
		function(err, docUser){
			if(!err){
				if(docUser){
					delete docUser.hashedPassword;
					onSuccess(docUser);
				}else{
					onSuccess();
				}
			}else{
				logger.error('users dao : login : Error while trying to load user', err);
				onError(err);
			}
		}
	);
};

/**
 * To get a user by email
 */
UsersDao.prototype.getUserByEmail = function(email, onSuccess, onError){
	logger.info('users dao : getUserByEmail : about to get user [%s]', email);
	var users = this.users;

	users.findOne( 
		{email: email},
		function(err, docUser){
			if(!err){
				onSuccess(docUser);
			}else{
				logger.error('users dao : getUserByEmail : Error while trying to load user', err);
				onError(err);
			}
		}
	);
};

/**
 * Looks up a user in database by the give code. Used on email verification.
 */
UsersDao.prototype.getUserByCode = function(code, onSuccess, onError){
	logger.info('users dao : getUserByCode : about to get user by code %s', code);
	var users = this.users;
		
	users.findOne( 
		{code: code},
		function(err, docUser){
			if(!err){
				if(docUser) logger.info('users dao : getUserByCode : user found for code %s - _id %s', code, docUser._id);
				onSuccess(docUser);
			}else{
				logger.error('users dao : getUserByCode : Error while trying to load user', err);
				onError(err);
			}
		}
	);
};

/**
 * To load a user by Id
 */
UsersDao.prototype.get = function(userId, onSuccess, onError){
	logger.info('users dao : get : about to load user [%s]', userId);
	
	try{
		var users = this.users;
		var userOId = typeof userId == 'string' ? db.ObjectId(userId) : userId; //Convert the string into an ObjectId
	
		var queryParam = {_id: userOId};
	
		var promise = 
			(function(){
				var deferred = q.defer();
	
				users.findOne(queryParam, function(err, doc) {
					if(!err){
						deferred.resolve(doc);
					}else{
						logger.error('users dao : get : Error while trying to load user', err);
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
		logger.error('users dao : get : failed to load user', userId, error);
		if(onError) onError(error);
		else throw error;
	}
};

/**
 * Updates user values
 */
UsersDao.prototype.update = function(_id, user, onSuccess, onError){
	logger.info('users dao : update : about to update user ', _id);
	var users = this.users;

	try{
		if(typeof _id == 'string') _id = db.ObjectId(_id);	

		users.update({_id: _id}, {"$set": user});
		
		logger.info('users dao : update : user updated');

		onSuccess(user);
	}catch(err){
		logger.error('users dao : update : Error while trying to update user', err);
		return err;
	}
};

/**
 * Removes user values
 */
UsersDao.prototype.unset = function(_id, user, onSuccess, onError){
	logger.info('users dao : unset : about to remove user values [%s]', user);
	var users = this.users;
	try{
		if(typeof _id == 'string') _id = db.ObjectId(_id);	

		users.update({_id: _id}, {"$unset": user});
		
		logger.info('users dao : unset : user values removed');
		onSuccess(user);
	}catch(err){
		logger.error('users dao : unset : Error while trying to remove user values', err);
		return err;
	}
};

/**
 * Adds a user role
 */
UsersDao.prototype.addRole = function(_id, role, onSuccess, onError){
	logger.info('users dao : addRole : about to add user role [%s]', user);
	var users = this.users;
	try{
		if(typeof _id == 'string') _id = db.ObjectId(_id);	

		users.update(
			{_id: _id}, 
			{"$push": {roles: role}}, 
			{safe: true}, 
			function(err, doc){
				if(!err) onSuccess(user);
				else onError(err);
			});
	}catch(err){
		logger.error('users dao : addRole : Error while trying to adding user role', err);
		return err;
	}
};

/**
 * Removes a user role
 */
UsersDao.prototype.removeRole = function(_id, role, onSuccess, onError){
	logger.info('users dao : removeRole : about to remove user role [%s]', user);
	var users = this.users;
	try{
		if(typeof _id == 'string') _id = db.ObjectId(_id);	

		users.update(
			{_id: _id}, 
			{"$pull": {roles: role}}, 
			{safe: true}, 
			function(err, doc){
				if(!err) onSuccess(user);
				else onError(err);
			});
	}catch(err){
		logger.error('users dao : removeRole : Error while trying to remove user role', err);
		return err;
	}
};

/**
 * Updates user password
 */
UsersDao.prototype.updatePassword = function(_id, pass, onSuccess, onError){
	logger.info('users dao : updatePassword : about to update user password [_id: %s]', _id);
	var users = this.users;
	try{
		if(typeof _id == 'string') _id = db.ObjectId(_id);
		var hashed = this.encrypt(pass);
		users.update({_id: _id}, {"$set": {hashedPassword: hashed}});
		
		logger.info('users dao : updatePassword : user updated password [_id: %s]', _id);
		onSuccess(hashed);
	}catch(err){
		logger.error('users dao : updatePassword : Error while trying to update password [_id: %s]', _id, err);
		return err;
	}
};


/**
 * Updates user tutorial state
 */
UsersDao.prototype.updateTutorial = function(_id, tutorial, value, onSuccess, onError){
	logger.info('users dao : updateTutorial : about to update user tutorial state [_id: %s]', _id);
	var users = this.users;
	try{
		var newValue = {};
		newValue["tutorial." + tutorial] = value;

		if(typeof _id == 'string') _id = db.ObjectId(_id);
		users.update({_id: _id}, {"$set": newValue}, {safe: true}, function(err, docs) {
				if(!err){
					logger.info('users dao : updateTutorial : user updated tutorial state [_id: %s]', _id);
					onSuccess(tutorial);
				}else{
					logger.error('user dao : updateTutorial : error while marking tutorial' );
					onError(err);
				}
			});
	}catch(err){
		logger.error('users dao : updateTutorial : Error while trying to update tutorial state [_id: %s]', _id, err);
		return err;
	}
};

/**
 * Encrypts the password using env salt
 * @param pass
 */
UsersDao.prototype.encrypt = function(password){
    if (!password) return '';
    return encrypred = crypto.createHmac('sha1', config.salt).update(password).digest('hex');
};

module.exports = UsersDao;