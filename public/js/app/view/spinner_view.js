define([], function(){
	var SpinnerView = Backbone.View.extend({
		el: '.spinner',

		initialize: function(){
			_.bindAll(this, 'show', 'hide');
			MockApi.Events.on('m.spinner.show', this.show);
			MockApi.Events.on('m.spinner.hide', this.hide);
		},

		show: function(){
			this.$el.show();
		},

		hide: function(){
			this.$el.hide();
		}
	});

	return SpinnerView;
});