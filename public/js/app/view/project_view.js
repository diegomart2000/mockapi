define([], function(){
	var ProjectView = Backbone.View.extend({

		tagName: 'li',
		className: 'project-item animated bounceInLeft',
		template: Handlebars.compile($('#project-template').html()),
		//editTemplate: Handlebars.compile($('#project-edit-template').html()),

		events: {
			'click project': 'edit',
			'click [data-action=close]': 'render',
			'click [data-action=delete]': 'delete',
			'click [data-action=save]': 'save',
			'mouseout': 'hideDropdown'
		},

		initialize: function(options) {
			// Ensure our methods keep the `this` reference to the view itself
			_.bindAll(this, 'render', 'remove', 'save', 'cleanAnimation');

			// If the model changes we need to re-render
			this.model.bind('change', this.render);
			this.model.bind('save', this.render);
			this.model.bind('destroy', this.remove);
		},

		render: function(){
			var project = this.model.toJSON();
			this.$el.html(this.template(project));

			_.delay(this.cleanAnimation, 2000);
			return this;
		},

		edit: function(){
			this.$el.html(this.editTemplate(this.model.toJSON()));
			return this;
		},

		save: function(){
			var project = _.reduce(this.$el.find('input[name], select option:selected'), function(memo, el){
				el = $(el);
				memo[el.attr('name')] = el.val();
				return memo;
			}, {});
			this.model.save(project);
		},

		delete: function(){
			this.model.destroy();
		},

		cleanAnimation: function(){
			this.$el.removeClass('animated bounceInLeft');
		}
	});
	
	return ProjectView;
})