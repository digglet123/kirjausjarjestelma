import { Meteor } from 'meteor/meteor';

Meteor.methods({
	lisaaArkistoon: function(lisattava){
		Arkisto.insert(lisattava);
	},

	poistaKirjaus: function(id){
		Arkisto.remove(id);
	},
	paivitaTuoteHinta: function(nimi, uusiHinta){
		Tuotteet.update({name : nimi},{$set:{unitPrice : uusiHinta}});
	},
	lisaaTuote: function(lisattava){
		Tuotteet.insert(lisattava);
	}
});

Meteor.publish("arkisto", function(){
	return Arkisto.find();
});

Meteor.publish("tuotteet", function(){
	return Tuotteet.find();
});	