import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe("arkisto");

Template.KirjausLayout.helpers({
    //Returns all items in staging collection
    kirjaukset: function(){
        return Kirjaukset.find();
    },
    hasItems: function(){
       return stagingCount() > 0;  
    }
});

Template.ArkistoLayout.helpers({
    //Returns all items in staging collection
    arkistot: function(){
        return Arkisto.find();
    }
});

Template.typeform.helpers({
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

//Enable typeahead when form is rendered
Template.typeform.onRendered(function(){
  Meteor.typeahead.inject();
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
Template.DatePicker.rendered = function() {
  $("#dt").dateDropper(dateDropperOptions);
}
  
//KirjausLayout Events
Template.KirjausLayout.events({
  //Actions when form is submitted
	'submit .new-kirjaus': function(event){
		var title = event.target.prodName.value;
		var price = event.target.prodPrice.value;
		var date = event.target.purchaseDate.value;

    //Call database insert method on server side
		Kirjaukset.insert({
      name : title,
      price : price,
      date: date, 
      markDate : new Date(),
      Owner : Meteor.user()
    });

    if(stagingCount() > 1){
      document.getElementById('sum').innerHTML = kerroSumma().toFixed(2) + " €";  
    }

    //Reset UI after adding product
		event.target.prodName.focus();
    $('.typeahead').typeahead('close');
    $('.typeahead').typeahead('val', "");
    event.target.prodPrice.value = "";

		return false;
	},
  //Actions when submit products button is pressed
  'click #ins': function(event){
    Kirjaukset.find().forEach(function(d){Meteor.call("lisaaArkistoon",d)});
    Kirjaukset.remove({});
    document.getElementById('sum').innerHTML = kerroSumma().toFixed(2) + " €";
    $("#nm").focus();
  }
});

//Delete button events
Template.kirjaus.events({
	'click .delete': function(){
    //Call database delete method on server side
		Kirjaukset.remove(this._id);

    //Update sum of prices 
    if(stagingCount() > 1){
      document.getElementById('sum').innerHTML = kerroSumma().toFixed(2) + " €";  
    }

    //Focus on form after delete button is pressed
    $("#nm").focus();
	}
});

Template.KirjausSumma.onRendered(function(){
    //Update sum of products 
    document.getElementById('sum').innerHTML = kerroSumma().toFixed(2) + " €";
    $("#nm").focus();
});


//Helper function: returns sum of all prices in staging area
function kerroSumma() {
    var total = 0;

    Kirjaukset.find().map(function(doc) {
      total += Number(doc.price);
    });
      
    return total; 
}
//Helper function to determine number of items in staging area
function stagingCount(){
  return Kirjaukset.find().count();
}

//Configure AccountsUI
Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

//Client startup 
Meteor.startup(function(){

});