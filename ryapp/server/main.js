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
