FlowRouter.route('/',{
  name: 'kirjausnakyma',
  action() {
    BlazeLayout.render('main', {main: 'KirjausLayout'});
  }
});