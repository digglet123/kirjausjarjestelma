import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
	lisaaArkistoon: function(lisattava){
		Arkisto.insert(lisattava);
	},

	poistaKirjaus: function(id){
		Arkisto.remove(id);
	},
	
});

Meteor.publish("arkisto", function(){
	return Arkisto.find();
});

Meteor.publish("tuotteet", function(){
	return Tuotteet.find();
});