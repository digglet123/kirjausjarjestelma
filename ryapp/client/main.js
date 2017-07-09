import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe("tuotteet");
Session.set("sort_by", "markDate");
Session.set("filter_by", "kaikki");


Template.navigation.events ({
	//Logging out
	'click .logout': function() {
		Meteor.logout();
	}
});
