/**
 * Basic Application configuration based on Evn
 * 
 */
var config = require('./app-config.json');
var stage = process.env.MOCKAPI_STAGE || 'DEV';

var localConfig = config[stage];

//Set the stage
localConfig.stage = stage;
localConfig.dev = stage == 'DEV';

//Look for the configuration, if not defined use Environment, if not defined use the hardcoded one.
localConfig.db ={
	connection: process.env.MOCKAPI_DB_CONNECTION
};

//AWS Config
//heroku config:set AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_DOCS_BUCKET_NAME=zzz
localConfig.aws = {
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
	bucket: process.env.AWS_BUCKET_NAME,
	docsBucket: process.env.AWS_DOCS_BUCKET_NAME
};

//Memcached Config
localConfig.cache = {
	server: process.env.MEMCACHIER_SERVERS,
	user: process.env.MEMCACHIER_USERNAME,
	password: process.env.MEMCACHIER_PASSWORD
};

//Redis Config
localConfig.keyStore = {
	url: process.env.REDISCLOUD_URL,
	password: process.env.REDISCLOUD_PASSWORD
};

//Dashboard host?
localConfig.host = 'dashboard';

module.exports = localConfig;