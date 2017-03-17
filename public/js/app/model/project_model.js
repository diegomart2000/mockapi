//Project Model Class
define([], function() {
	var ProjectModel = Backbone.Model.extend({
		idAttribute: "_id",

		defaults: {
			resources: []
		},

		urlRoot: "/_m_/api/project"
	});

	return ProjectModel;
});