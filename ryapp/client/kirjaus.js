Template.KirjausLayout.helpers({    
    //Returns all items in staging collection
    kirjaukset: function(){
        return Kirjaukset.find();
    },
    hasItems: function(){
       return stagingCount() > 0;  
    }
});

  
Template.typeform.helpers({
  //creates product name array for typeahead
    etsi: function() {
      return Tuotteet.find().fetch().map(function(it){ return it.name; });
    },
    auto: function(event, suggestion){
      $("#pr").val(Tuotteet.find({name: suggestion.value}).fetch()[0].unitPrice);
    }
});

//Enable typeahead when form is rendered
Template.typeform.onRendered(function(){
  Meteor.typeahead.inject();
});

//Options for datepicker element
var dateDropperOptions = { 
    lang: "en",
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
      date: dateConvertIso(date), 
      markDate : new Date(),
      username: Meteor.user().username,
      Owner : Meteor.user()
    });

    if(productExists(title)){
      Meteor.call("paivitaTuoteHinta", title, price);
    }
    else{
      Meteor.call("lisaaTuote", {name: title, unitPrice: price});
    }

    if(stagingCount() > 1){
      document.getElementById('sum').innerHTML = kerroSumma(Kirjaukset).toFixed(2) + " €";  
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
    document.getElementById('sum').innerHTML = kerroSumma(Kirjaukset).toFixed(2) + " €";
    $("#nm").focus();
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
      document.getElementById('sum').innerHTML = kerroSumma(Kirjaukset).toFixed(2) + " €";  
    }

    //Focus on form after delete button is pressed
    $("#nm").focus();
	}
});

Template.kirjaus.helpers({
  prettyDate: function(isoDate){
    return dateConvertEuro(isoDate);
  }
});

Template.KirjausSumma.onRendered(
  function(){
    //Update sum of products 
    document.getElementById('sum').innerHTML = kerroSumma(Kirjaukset).toFixed(2) + " €";
    $("#nm").focus();
  }
);


//Helper function to determine number of items in staging area
function stagingCount(){
  return Kirjaukset.find().count();
}

//Helper for converting date strings from euro to iso
function dateConvertIso(dateString){
  return dateString.replace( /(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1");
}

//Helper for converting date strings from iso to euro
function dateConvertEuro(dateString){
  return dateString.replace( /(\d{4})-(\d{2})-(\d{2})/, "$3-$2-$1");
}

function productExists(prodName){
  return Tuotteet.find({name: prodName}).count() > 0;
}

function archiveCount(){
  return Arkisto.find().count();
}

//Helper for converting date strings from iso to euro
function dateConvertEuro(dateString){
  return dateString.replace( /(\d{4})-(\d{2})-(\d{2})/, "$3-$2-$1");
}

function hasItems(user){
  return Arkisto.find({Owner: user}).count() > 0;
}

function kerroHenkiloSumma(user){
    var total = 0;

    Arkisto.find({Owner: user}).map(function(doc) {
      total += Number(doc.price);
    });
      
    return total; 
}

//Helper function: returns sum of all prices in staging area
function kerroSumma(taulu) {
    var total = 0;

    taulu.find().map(function(doc) {
      total += Number(doc.price);
    });
      
    return total; 
}