var logger = require('log4js').getLogger('co.mockapi');
var config = require('../../config/config');

var q = require('q');
var _ = require('underscore');

var memjs = require('memjs');

//Create memcache instance
var client = memjs.Client.create(config.cache.servers, {
	username: config.cache.user,
	password: config.cache.password
});

/**
 * Helper cache method to fetch elements
 */
exports.fetch = function(key, load){
	logger.debug('cache : fetch : about to load from cache [%s]', key);
	
	try{
		var promise = 
		
		//First load from cache
		(function(){
			var deferred = q.defer();
			client.get(key,
				//onSuccess,
				function(err, docs){

					if(!err){
						logger.debug('cache : fetch : cache hit [%s]', docs && true);
						deferred.resolve(docs);
					}else
						deferred.reject(err);
				});
			
			return deferred.promise;
		})()

		//Check if should go to db
		.then(function(docs){
			//ON cache MISS, go to db
			if(!docs){
				return load()
						.then(function(docs){
							client.set(key, JSON.stringify(docs), function(err, success) {
								logger.debug('cache : fetch : cached %s ', success);
							});
							
							return docs;
						});

			//Docs already on cache
			}else{
				return JSON.parse(docs);
			}

		//Return
		});

		return promise;

	}catch(err){
		logger.error('cache : fetch : error while getting for %s', key, err);
		onError(err);
	}
};