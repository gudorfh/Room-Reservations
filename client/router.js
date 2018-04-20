Meteor.startup(function() {
  document.title = "CS403 Room Reservations!";
});

Router.route('/', function () {
  this.render('roomSelectPage');
});

Router.route("/reservationPage", function() {
  this.render("reservationPage");
});

Router.route("/reservationPage2", function() {
  this.render("reservationPage2");
});
Router.route("/reservationPage3", function() {
  this.render("reservationPage3");
});
Router.route("/reservationPage4", function() {
  this.render("reservationPage4");
});
Router.route("/reservationPage5", function() {
  this.render("reservationPage5");
});
Router.route("/reservationPage6", function() {
  this.render("reservationPage6");
});
Router.route("/reservationPage7", function() {
  this.render("reservationPage7");
});
Router.route("/reservationPage8", function() {
  this.render("reservationPage8");
});
