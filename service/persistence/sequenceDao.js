/**
 * Sequence DAO Object Module
 */
var logger = require('log4js').getLogger('me.cvgram');
var config = require('../../config/config');
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;
var q = require('q');

var db = require('./databaseDao');

/**
 * Sequence DAO Class
 */
function SequenceDao(){
	this.sequences = db.collection('sequences');
	
	return this;
}

/**
 * GETs the next value for a given sequence name
 */
SequenceDao.prototype.getNext = function(companyId, name, onSuccess, onError){
	logger.info('company dao : getNext : about to get next value for sequence [%s]', name);
	try{
		var sequences = this.sequences;
		var companyOId = db.ObjectId(companyId);

		var ret = sequences.findAndModify(
			{
				query: { companyId: companyOId, name: name},
				update: { $inc: { seq: 1 } },
				new: true,
				upsert: true
			},

			function(err, doc) {
				if(!err){
					onSuccess(doc.seq);
				}else{
					onError(err);
				}
			}
		);

	}catch(error){
		logger.error('company dao : getNext : failed to load company sequence ' + companyId, error);
	}
};

/**
 * GETs the current value for a given sequence name.
 * Used to show next value. Ex: current() + 1 = getNext()
 */
SequenceDao.prototype.current = function(companyId, name){
	logger.info('company dao : current : about to load sequence [%s]', name);
	try{
		var sequences = this.sequences;
		var companyOId = db.ObjectId(companyId);

		var ret = sequences.findOne({ companyId: companyOId, name: name });

		//First time
		return ret ? ret.seq : 1;

	}catch(error){
		logger.error('company dao : current : failed to load company sequence ' + companyId, error);
	}
};

module.exports = SequenceDao;