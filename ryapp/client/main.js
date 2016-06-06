import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe("arkisto");
Meteor.subscribe("tuotteet");

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
      return Tuotteet.find().fetch().map(function(it){ return it.name; });
    },
    auto: function(event, suggestion){
      $("#pr").val(Tuotteet.find({name: suggestion.value}).fetch()[0].unitPrice);
    },
    select: function(event, suggestion){
      $("#pr").val(Tuotteet.find({name: suggestion.value}).fetch()[0].unitPrice);
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
		var price = Number(event.target.prodPrice.value).toFixed(2);
		var date = event.target.purchaseDate.value;

    //Add new product to clien side collection
		Kirjaukset.insert({
      name : title,
      unitPrice : Number(price),
      price : Number(price),
      amount : 1,
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
    alert("Tuotteet kirjattu arkistoon!");
    Kirjaukset.remove({});
    document.getElementById('sum').innerHTML = kerroSumma().toFixed(2) + " €";
    $("#nm").focus();
  }
});

Template.arkisto.events({
'click .delete': function(){
  if(this.Owner._id === Meteor.userId()){
     Meteor.call("poistaKirjaus", this._id);
  }
  else{
    alert("Ei oikeuksia!");
  }
}
});

Template.arkisto.helpers({
  isOwner: function(){
    return this.Owner._id === Meteor.userId();
  }
});

//Amount spinner events
Template.kirjaus.events({
	'click .stepper': function(){
    //Delete item from staging area if amount is set to 0
    if(event.target.value == 0){
      Kirjaukset.remove(this._id);
    }
    else{
      Kirjaukset.update(this._id, {
        $set: { amount: event.target.value },
      });
      Kirjaukset.update(this._id, {
        $set: { price: (this.unitPrice * event.target.value).toFixed(2) },
      });
    }
    //Update sum of prices 
    if(stagingCount() > 0){
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