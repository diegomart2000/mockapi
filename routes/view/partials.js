var logger = require('log4js').getLogger('co.mockapi');
var config = require('../../config/config');
var _ = require('underscore');

var fs = require('fs');
var jade = require('jade');

var security = require('../../middleware/security');
var connectService = require('../../service/connectService');

var Exception = require('../../service/model/exception');

//Export the router
module.exports = PartialRouter;

/**
 *
 * The Authentication endpoint exposes a set of methods for managing authentication.
 */
function PartialRouter(app){
	app.get('/partial/preview/:type/:partial', preview);
};


/**
 * Helper to render a preview of a partial, embbeded on a full container
 */
function preview(req, res){
	var type = req.params.type;
	var partial = req.params.partial;
	var file = ['./views/partials/sections', type, [partial, 'jade'].join('.')].join('/');

	var template = jade.compile(fs.readFileSync(file,'utf8'), {filename: file})

	logger.debug('partial router : preview : rendering ', partial);
	res.render('preview/index', {type: type, partial: partial, template: template()});
};
