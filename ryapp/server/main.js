import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
	lisaaKirjaus: function(title, price, date){
		Kirjaukset.insert({
			name : title,
			price : price,
			date: date 
		});
	},
	poistaKirjaus: function(id){
		Kirjaukset.remove(id);
	}
});
