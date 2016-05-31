import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.KirjausLayout.helpers({
    //Returns all items in staging collection
    kirjaukset: function(){
        return Kirjaukset.find();
    },
    //creates product name array for typeahead
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

//Options for datepicker element
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

//Render datepicker
Template.KirjausLayout.rendered = function() {
  $("#dt").dateDropper(dateDropperOptions);
}
  
//Add button events
Template.KirjausLayout.events({
	'submit .new-kirjaus': function(event){
		var title = event.target.prodName.value;
		var price = event.target.prodPrice.value;
		var date = event.target.purchaseDate.value;

    //Call database insert method on server side
		Meteor.call("lisaaKirjaus", title, price, date);

    //Update sum of prices after delay
    Meteor.setTimeout(function() {
    document.getElementById('sum').innerHTML = kerroSumma().toFixed(2) + " €";
    }, 500);

    //Reset UI after adding product
		event.target.prodName.focus();
    $('.typeahead').typeahead('close');
    event.target.prodName.value = "";
    event.target.prodPrice.value = "";

		return false;
	}
});

//Delete button events
Template.kirjaus.events({
	'click .delete': function(){
    //Call database delete method on server side
		Meteor.call("poistaKirjaus", this._id);

    //Update sum of prices after delay
    Meteor.setTimeout(function() {
      document.getElementById('sum').innerHTML = kerroSumma().toFixed(2) + " €";
    }, 500);
	}
});

//Client startup 
Meteor.startup(function(){
		// Initializes all typeahead instances
		Meteor.typeahead.inject();
    //Update sum of products 
    Meteor.setTimeout(function() {
      document.getElementById('sum').innerHTML = kerroSumma().toFixed(2) + " €";
    }, 500);
});

//Helper function: returns sum of all prices in staging area
function kerroSumma() {
    var total = 0;

    Kirjaukset.find().map(function(doc) {
      total += Number(doc.price);
    });
      
    return total; 
}
