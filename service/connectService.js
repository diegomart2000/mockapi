/**
 * Class to handle all security and session methods
 * 
 */
var logger = require('log4js').getLogger('co.mockapi');
var mailerService = require('./mailerService');

var UserDao = require('./persistence/userDao');
var EventDao = require('./persistence/eventDao');

var User = require('./model/user');
var Exception = require('./model/exception');

var q = require('q');
var _ = require('underscore');

/**
 * Register a new User
 */
exports.register = function(userPlain, onSuccess, onError){
	logger.info('connect service : register : about to register the user [%s]', userPlain.email);

	//Validate user data
	var user = new User();
	user.fill(userPlain);

	//First of all check if the user values are valid
	if(!user.valid()){
		onError(new Exception(400, 'User has invalid fields', user.result.message));
		return;
	}

	var dao = new UserDao();

	//Look up for the user by the given email
	(function(){
		var deferred = q.defer();
		
		//First look if the given email is already registered
		dao.getUserByEmail(user.email, 
			//onSuccess
			function(docUser){
				if(docUser) //User found, Reject
					deferred.reject(new Exception(403, 'User already registered: ' + user.email) );
				else //Not found, reject with an error
					deferred.resolve(user);
					
			}, 
			//onError
			function(err){
				deferred.reject(err);
			}
		);
		
		return deferred.promise;
	})()

	//Then register the user if not found
	.then(function(user){
		var deferred = q.defer();

		dao.register(
			user, 
			//onSuccess
			function(docUser){
				//Check if it is a new user, if so, send the welcome email
				mailerService.sendWelcome(docUser);
				deferred.resolve(user);
			}, 

			//onError
			function(err){
				deferred.reject(err);
			}
		);
		
		return deferred.promise;
	})

	//Finally resolve
	.done(onSuccess, onError);

	logger.info('connect service : register : waitng for user');
};

/**
 * Login the given email and password
 */
exports.signin = function(email, password, onSuccess, onError){
	logger.info('connect service : signin : about to signin the user : ' + email);
	
	var dao = new UserDao();
	dao.login(email, password, onSuccess, onError);
	
	logger.info('connect service : signin : waitng for user');
};

/**
 * Register a forgot password event and sends out the email to the user.
 */
exports.passwordRequest = function(email, onSuccess, onError){
	logger.info('connect service : passwordRequest : about to request password url for [%s]', email);
	
	//Look up for the user by the given code
	function findUserByEmail(email){
		var deferred = q.defer();
		
		var dao = new UserDao();
		dao.getUserByEmail(
				email, 
				//onSuccess
				function(docUser){
					if(docUser) //User found, Ok
						deferred.resolve(docUser);
					else //Not found, reject with an error
						deferred.reject(new Exception(404, 'User not found for email: ' + email) );
				}, 
				//onError
				function(err){
					deferred.reject(err);
				}
			);
		
		return deferred.promise;
	};

	//Once found, create a timed event
	function createPasswordEvent(docUser){
		var deferred = q.defer();
		
		var dao = new EventDao();
		dao.register(
				{userId: docUser._id},

				//onSuccess
				function(passwordEvent){
					passwordEvent.user = docUser;
					deferred.resolve(passwordEvent);
				},
				//onError
				function(err){
					deferred.reject(err);
				});

		return deferred.promise;
	};

	//email created event
	function sendPasswordEvent(passwordEvent){
		var deferred = q.defer();

		mailerService.sendChangePassword(passwordEvent);
		deferred.resolve(passwordEvent);

		return deferred.promise;
	};
	
	findUserByEmail(email)
		.then(createPasswordEvent)
		.then(sendPasswordEvent)
		.then(onSuccess, onError);
};

/**
 * Verify the user email by the given code
 */
exports.verifyEmail = function(code, onSuccess, onError){
	logger.info('connect service : verifyEmail : about to verify users email for code[%s]', code);
	
	//Look up for the user by the given code
	function findUserByCode(code){
		var deferred = q.defer();
		
		var dao = new UserDao();
		dao.getUserByCode(code, 
				//onSuccess
				function(docUser){
					if(docUser) //User found, Ok
						deferred.resolve(docUser);
					else //Not found, reject with an error
						deferred.reject(new Exception(404, 'User not found for code: ' + code) );
				}, 
				//onError
				function(err){
					deferred.reject(err);
				}
			);
		
		return deferred.promise;
	};

	//Once found, remove the verification code to clean up the user and verify the email
	function cleanUserCode(docUser){
		var deferred = q.defer();
		var updatedUser = _.omit(docUser, ['code', 'codeDate', 'emailPrev']);
		var toClean = {'code': null, 'codeDate': null, 'emailPrev': null};
		
		var dao = new UserDao();
		dao.unset(
				docUser._id, 
				toClean,
				//onSuccess
				function(cleaned){
					deferred.resolve(updatedUser);
				},
				//onError
				function(err){
					deferred.reject(err);
				});
		return deferred.promise;
	};

	findUserByCode(code)
		.then(cleanUserCode)
		.then(onSuccess, onError);

	logger.info('connect service : verifyEmail : waitng for user dao...');
};


/**
 * Verify the user forgot request by the given key
 */
exports.verifyPasswordKey = function(key, onSuccess, onError){
	logger.info('connect service : verifyPasswordKey : about to verify user password request by key [%s]', key);
	
	//Look up for the user by the given code
	function findEventByKey(_key){
		var deferred = q.defer();
		
		var dao = new EventDao();
		var userDao = new UserDao();

		dao.getById(_key, 
				//onSuccess
				function(event){
					if(event){ //User found, Ok
						deferred.resolve(event.user._id);
					}else //Not found, reject with an error
						deferred.reject(new Exception(404, 'User key not found: ' + key) );
				}, 
				//onError
				function(err){
					deferred.reject(err);
				}
			);
		
		return deferred.promise;
	};

	//Look for the user
	function getUserById(_id){
		var deferred = q.defer();
		
		var dao = new UserDao();

		dao.getUserById(_id, 
				//onSuccess
				function(user){
					deferred.resolve(user);
				}, 
				//onError
				function(err){
					deferred.reject(err);
				}
			);
		
		return deferred.promise;
	};

	findEventByKey(key)
		.then(getUserById)
		.then(onSuccess, onError);

	logger.info('connect service : verifyPasswordKey : waiting for user dao...');
};