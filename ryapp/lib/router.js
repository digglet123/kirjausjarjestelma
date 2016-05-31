FlowRouter.route('/',{
  name: 'kirjausnakyma',
  action() {
    BlazeLayout.render('main', {main: 'KirjausLayout'});
  }
});

FlowRouter.route('/kirjaus',{
  name: 'kirjausnakyma',
  action() {
    BlazeLayout.render('main', {main: 'KirjausLayout'});
  }
});

FlowRouter.route('/arkisto',{
  name: 'arkistonakyma',
  action() {
    BlazeLayout.render('main', {main: 'ArkistoLayout'});
  }
});