Template.ArkistoLayout.onCreated(function(){
  this.subscribe("arkisto");
});


Template.ArkistoLayout.helpers({
    //Returns all items in staging collection
    arkistot: function(){
      var togg = Session.get("sort_by");
      var sel = Session.get("filter_by");
      if (togg == "markDate"){
        if (sel == "kaikki") {
          return Arkisto.find({}, {sort: {'markDate': -1}});
        }
        else{
          return Arkisto.find({username: sel}, {sort: {'markDate': -1}});
        }
      } 
      else {
        if (sel == "kaikki") {
          return Arkisto.find({}, {sort: {'date': -1}});
        }
        else{
          return Arkisto.find({username: sel}, {sort: {'date': -1}});
        }
      }     
    },
    kirjaajat: function(){
      var myArray = Arkisto.find().fetch();
      var distinctArray = _.uniq(myArray, false, function(d) {return d.Owner.username});
      return _.pluck(distinctArray, 'Owner');
    },
    kirjaajaSumma: function(user){
      return kerroHenkiloSumma(user).toFixed(2);
    },
    kokonaisSumma: function(){
      return kerroSumma(Arkisto).toFixed(2);
    },
    viimeinenKirjaus: function(user){
        if(hasItems(user)){
          return dateConvertEuro(Arkisto.find({Owner: user}, {sort: {'markDate': -1}}).fetch()[0].markDate.toISOString().substring(0,10));
        }
    },
    viimeisinKirjaus: function(){
      if(archiveCount() > 0){
        return dateConvertEuro(Arkisto.find({}, {sort: {'markDate': -1}}).fetch()[0].markDate.toISOString().substring(0,10));
      }
    }
});

Template.ArkistoLayout.events({
  'change #sort': function(){
    Session.set("sort_by", event.target.value);
  },
  'change #filter': function(){
    Session.set("filter_by", event.target.value);
  }
});

Template.ArkistoLayout.onRendered( 
  function(){
    Session.set("sort_by", "markDate");
    Session.set("filter_by", "kaikki");
  }
);

Template.arkisto.events({
'click #delete': function(){
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
  },
  prettyDate: function(isoDate){
    return dateConvertEuro(isoDate);
  } 
});

Template.lataus.events({
'click #download': function (e) {
  var togg = Session.get("sort_by");
  var sel = Session.get("filter_by");
  if (togg == "markDate"){
    if (sel == "kaikki") {
      csv = json2csv(Arkisto.find({}, {fields: {'name':1, 'price':1,'unitPrice':1, 'amount':1, 'date':1, 'username':1}}).fetch(), true, false);
    }
    else{
       csv = json2csv(Arkisto.find({username: sel}, {fields: {'name':1, 'price':1,'unitPrice':1, 'amount':1, 'date':1, 'username':1}}, {sort: {'markDate': -1}}).fetch(), true, false);
    }
  } 
  else {
    if (sel == "kaikki") {
       csv = json2csv(Arkisto.find({}, {fields: {'name':1, 'price':1,'unitPrice':1, 'amount':1, 'date':1, 'username':1}}, {sort: {'date': -1}}).fetch(), true, false);
    }
    else{
       csv = json2csv(Arkisto.find({username: sel}, {fields: {'name':1, 'price':1,'unitPrice':1, 'amount':1, 'date':1, 'username':1}}, {sort: {'date': -1}}).fetch(), true, false);
    }               
  }
  e.target.href = "data:text/csv;charset=unicode," + escape(csv);
  e.target.download = "Arkisto_" + dateConvertEuro(new Date().toISOString().substring(0,10)) + ".csv"; 
}
});

//Helper for converting date strings from iso to euro
function dateConvertEuro(dateString){
  return dateString.replace( /(\d{4})-(\d{2})-(\d{2})/, "$3-$2-$1");
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