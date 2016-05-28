import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.body.helpers({
    kirjaukset: function(){
        return Kirjaukset.find();
    },
    etsi: function() {
    	return Kirjaukset.find().fetch().map(function(it){ return it.name; });
  	},
  	auto: function(event, suggestion){
  		$("#pr").val(Kirjaukset.find({name: suggestion.value}).fetch().reverse()[0].price);
  	},
  	select: function(event, suggestion){
  		$("#pr").val(Kirjaukset.find({name: suggestion.value}).fetch().reverse()[0].price);
  	}
});

var dateDropperOptions = { 
	animation: "dropdown",          
    format:"d-m-Y",
    animate_current: false,
    lock: "to",
    color: "#33cc33",
    //set placeholder to current date
    placeholder: new Date().toISOString().substring(8,10) 
    + "-" + new Date().toISOString().substring(5,8) 
    + new Date().toISOString().substring(0,4)
                  
  };

Template.body.rendered = function() {
  $("#dt").dateDropper(dateDropperOptions);
}


Template.body.events({
	'submit .new-kirjaus': function(event){
		var title = event.target.prodName.value;
		var price = event.target.prodPrice.value;
		var date = event.target.purchaseDate.value;

		Meteor.call("lisaaKirjaus", title, price, date);

		event.target.prodName.value = "";
		event.target.prodPrice.value = "";
		event.target.prodName.focus();

		return false;
	}
});


Template.kirjaus.events({
	'click .delete': function(){
		Meteor.call("poistaKirjaus", this._id);
	}
});

Meteor.startup(function(){
		// initializes all typeahead instances
		Meteor.typeahead.inject();
});

