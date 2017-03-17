//Project Collection
define(['../model/project_model'], function(Project) {
	var ProjectCollection = Backbone.Collection.extend({
		model: Project,
		url: "/_m_/api/project"
	});

	return ProjectCollection;
});