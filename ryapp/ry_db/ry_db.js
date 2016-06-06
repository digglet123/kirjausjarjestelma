Kirjaukset = new Mongo.Collection(null);
Arkisto	= new Mongo.Collection('arkisto');
Tuotteet = new Mongo.Collection('tuotteet');

Arkisto.allow({
	insert: function(userId, doc){
		return !!userId;
	},
	remove: function(userId, doc){
		return doc.Owner._id === userId;
	}
});