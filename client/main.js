import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import './main.html';
import '../imports/startup/accounts-config.js';
import {Reservations} from "../imports/api/reservations.js";

// Some helper functions created to make life easier later on.
// Checks if an object is empty.  Returns true if the object is empty, false otherwise.

var currentRoom = 101
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// Left-Zero pads a number to a given width.  Returns a string
function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}

// Returns an array containing the numbers of days in a given month.
function getDaysForMonth(month) {
  var days = [];
  
  if (month == "January" || month == "March" || month == "May" || month == "July" || month == "August" || month == "October" || month == "December") {
    days = [];
    for (i=1; i<=31; i++) {
      days.push(i);
    }
  }
  else if (month == "February") {
    days = [];
    for (i=1; i<=28; i++) {
      days.push(i);
    }
  }
  else if (month == "April" || month == "June" || month == "September" || month == "November") {
    days = [];
    for (i=1; i<=30; i++) {
      days.push(i);
    }
  }
  else {
    days = [];
  }
  
  return days;
}

// Used for populating the both month selection fields.
Template.startEndSelectors.helpers({
  months: function(){
      return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  },
  times: function(){
    var times = []
    for (hour=0; hour<=23; hour++) {
      for (minute=0; minute<60; minute+=15) {
        times.push(zeroFill(hour, 2) + zeroFill(minute, 2));
      }
    }
    return times
  }
});

// Detects when the month has changed and populates the correct number of days for that month into the dayDropdown select box.
Template.startEndSelectors.events({
    // When they select a month, populate the correct number of days in in the dayDropdown select.
    "change #startMonthDropdown": function (event, template) {
      var days = getDaysForMonth($(event.currentTarget).val())

      // clear the dayDropdown select options
      $('#startDayDropdown')
        .find('option')
        .remove()
        .end()
        .append('<option>Select Day</option>');
        
      // repopulate with correct number of days
      if (!isEmpty(days)) {
        $.each(days, function(key, value) {
          $('#startDayDropdown').append($("<option/>", {
            value: key+1,
            text: value
          }));
        });
      }
    },
    "change #endMonthDropdown": function (event, template) {
      var days = getDaysForMonth($(event.currentTarget).val())

      // clear the dayDropdown select options
      $('#endDayDropdown')
        .find('option')
        .remove()
        .end()
        .append('<option>Select Day</option>');
        
      // repopulate with correct number of days
      if (!isEmpty(days)) {
        $.each(days, function(key, value) {
          $('#endDayDropdown').append($("<option/>", {
            value: key+1,
            text: value
          }));
        });
      }
    }
});

// Sets the feedback message initially to be "all fields must be completed." ////////////////////////////////////////////// Feedback Message Variable ////////////////
Template.makeReservationBox.onCreated(function(){
	this.eventFeedbackMsg = new ReactiveVar("All fields must be complete");
});

// updates the event feedback message if need be.
Template.makeReservationBox.helpers({
  eventFeedbackMsg: function() {
	return Template.instance().eventFeedbackMsg.get();  },	

  });

  function checkIfInUse() { /////////////////////////////////////////////////////////////////////////////////////////////// CHECK IF IN USE FUNCTION /////////////////
	     var startMonth = $('#startMonthDropdown').val();
       var startDay = parseInt($('#startDayDropdown').val());
       var startTime = $('#startTimeDropdown').val();
       
       var endMonth = $('#endMonthDropdown').val();
       var endDay = parseInt($('#endDayDropdown').val());
       var endTime = $('#endTimeDropdown').val();

       var startTimeString = startMonth.toString() + " " + startDay.toString() + ", 2018 " + startTime.toString().substring(0,2) + ":" + startTime.toString().substring(2,4) + ":00";
       var reservationStart = new Date(startTimeString);

       var endTimeString = endMonth.toString() + " " + endDay.toString() + ", 2018 " + endTime.toString().substring(0,2) + ":" + endTime.toString().substring(2,4) + ":00";
       var reservationEnd = new Date(endTimeString);

       var res = Reservations.find({room: currentRoom}).fetch();
       var ans = false;

       for (i=0; i< res.length; i++) {
        if (reservationStart < res[i].reservationEnd && reservationEnd > res[i].reservationStart) {
          ans = true;
        }
        }
        return ans;
  }


// Logic for the form.  Ensures all fields have been filled out.  Ensures the start date is before the end date.
Template.makeReservationBox.events({
   "click #submitReservationButton" : function(event, template) {       
       var eventDescription = $("#eventDescription").val()

       var startMonth = $('#startMonthDropdown').val();
       var startDay = parseInt($('#startDayDropdown').val());
       var startTime = $('#startTimeDropdown').val();
       
       var endMonth = $('#endMonthDropdown').val();
       var endDay = parseInt($('#endDayDropdown').val());
       var endTime = $('#endTimeDropdown').val();

       
      // Validate they have filled out all the boxes
      if (eventDescription == "") {
		 template.eventFeedbackMsg.set("You must enter an: Event Description");
		 template.find('.eventFeedback').style.color="#ff4444";
         return
      }
       
      else if(startMonth==null || startDay==null || startTime == null || isNaN(startDay) ) {
		 template.eventFeedbackMsg.set("You must enter a complete Event Start date");
		 template.find('.eventFeedback').style.color="#ff4444";
         return
      }
      else if(endMonth==null || endDay==null || endTime == null || isNaN(endDay)) {
		 template.eventFeedbackMsg.set("You must enter a complete Event End date");
		 template.find('.eventFeedback').style.color="#ff4444";
         return
      }
      //They have, so validate startTime is before endTime
      else {
         var startTimeString = startMonth.toString() + " " + startDay.toString() + ", 2018 " + startTime.toString().substring(0,2) + ":" + startTime.toString().substring(2,4) + ":00";
         var reservationStart = new Date(startTimeString);
         
         var endTimeString = endMonth.toString() + " " + endDay.toString() + ", 2018 " + endTime.toString().substring(0,2) + ":" + endTime.toString().substring(2,4) + ":00";
         var reservationEnd = new Date(endTimeString);
         
         if (reservationStart >= reservationEnd) {
		   template.eventFeedbackMsg.set("End date must be after start date");
		 template.find('.eventFeedback').style.color="#ff4444";
         }
         else if (checkIfInUse()){
		   template.eventFeedbackMsg.set("Room is in use at this time");
		 template.find('.eventFeedback').style.color="#ff4444";
         }
         else {
           // TODO: Confirm new event is not overlapping with any existing events.
           // TODO: Confirm existing events do not overlap with new events.
           // TODO: support 8 total rooms, instead of hard coding room 101 into the database. 
           Meteor.call("insertEvent", eventDescription, reservationStart, reservationEnd, currentRoom);
		   template.eventFeedbackMsg.set("Event entered successfully");
		 template.find('.eventFeedback').style.color="#00aa00";

         }
      }
   }
});


// Locates and returns the next five events which are occurring.
Template.upcomingReservations.helpers({
    reservations : function() {
        // TODO: Show events only for the selected room, not events for all rooms.
        var res = Reservations.find({room: currentRoom}, { sort: { reservationStart: 1 }}).fetch();

        for (i=0; i < res.length; i++) {
          res[i].reservationStart = moment(res[i].reservationStart).format('LLL');
          res[i].reservationEnd = moment(res[i].reservationEnd).format('LLL');
        }

        if (res.length > 5) {
            return res.slice(0,5);
        }
        else {
            return res;
        }
    }//something
});

Template.upcomingReservations2.helpers({
    reservations : function() {
        // TODO: Show events only for the selected room, not events for all rooms.
        var res = Reservations.find({room: currentRoom}, { sort: { reservationStart: 1 }}).fetch();

                for (i=0; i < res.length; i++) {
          res[i].reservationStart = moment(res[i].reservationStart).format('LLL');
          res[i].reservationEnd = moment(res[i].reservationEnd).format('LLL');
        }

        if (res.length > 5) {
            return res.slice(0,5);
        }
        else {
            return res;
        }
    }
});

Template.upcomingReservations3.helpers({
    reservations : function() {
        // TODO: Show events only for the selected room, not events for all rooms.
        var res = Reservations.find({room: currentRoom}, { sort: { reservationStart: 1 }}).fetch();

                for (i=0; i < res.length; i++) {
          res[i].reservationStart = moment(res[i].reservationStart).format('LLL');
          res[i].reservationEnd = moment(res[i].reservationEnd).format('LLL');
        }

        if (res.length > 5) {
            return res.slice(0,5);
        }
        else {
            return res;
        }
    }
});

Template.upcomingReservations4.helpers({
    reservations : function() {
        // TODO: Show events only for the selected room, not events for all rooms.
        var res = Reservations.find({room: currentRoom}, { sort: { reservationStart: 1 }}).fetch();

                for (i=0; i < res.length; i++) {
          res[i].reservationStart = moment(res[i].reservationStart).format('LLL');
          res[i].reservationEnd = moment(res[i].reservationEnd).format('LLL');
        }

        if (res.length > 5) {
            return res.slice(0,5);
        }
        else {
            return res;
        }
    }
});

Template.upcomingReservations5.helpers({
    reservations : function() {
        // TODO: Show events only for the selected room, not events for all rooms.
        var res = Reservations.find({room: currentRoom}, { sort: { reservationStart: 1 }}).fetch();

                for (i=0; i < res.length; i++) {
          res[i].reservationStart = moment(res[i].reservationStart).format('LLL');
          res[i].reservationEnd = moment(res[i].reservationEnd).format('LLL');
        }

        if (res.length > 5) {
            return res.slice(0,5);
        }
        else {
            return res;
        }
    }
});

Template.upcomingReservations6.helpers({
    reservations : function() {
        // TODO: Show events only for the selected room, not events for all rooms.
        var res = Reservations.find({room: currentRoom}, { sort: { reservationStart: 1 }}).fetch();

                for (i=0; i < res.length; i++) {
          res[i].reservationStart = moment(res[i].reservationStart).format('LLL');
          res[i].reservationEnd = moment(res[i].reservationEnd).format('LLL');
        }

        if (res.length > 5) {
            return res.slice(0,5);
        }
        else {
            return res;
        }
    }
});

Template.upcomingReservations7.helpers({
    reservations : function() {
        // TODO: Show events only for the selected room, not events for all rooms.
        var res = Reservations.find({room: currentRoom}, { sort: { reservationStart: 1 }}).fetch();

                for (i=0; i < res.length; i++) {
          res[i].reservationStart = moment(res[i].reservationStart).format('LLL');
          res[i].reservationEnd = moment(res[i].reservationEnd).format('LLL');
        }

        if (res.length > 5) {
            return res.slice(0,5);
        }
        else {
            return res;
        }
    }
});

Template.upcomingReservations8.helpers({
    reservations : function() {
        // TODO: Show events only for the selected room, not events for all rooms.
        var res = Reservations.find({room: currentRoom}, { sort: { reservationStart: 1 }}).fetch();

                for (i=0; i < res.length; i++) {
          res[i].reservationStart = moment(res[i].reservationStart).format('LLL');
          res[i].reservationEnd = moment(res[i].reservationEnd).format('LLL');
        }

        if (res.length > 5) {
            return res.slice(0,5);
        }
        else {
            return res;
        }
    }
});

Template.reservationPage.events({
   "click #backButton" : function() {
       console.log("back button clicked");
       Router.go("/")
    }       
});

Template.reservationPage2.events({
   "click #backButton2" : function() {
       console.log("back button clicked");
       Router.go("/")
    }       
});

Template.reservationPage3.events({
   "click #backButton3" : function() {
       console.log("back button clicked");
       Router.go("/")
    }       
});

Template.reservationPage4.events({
   "click #backButton4" : function() {
       console.log("back button clicked");
       Router.go("/")
    }       
});

Template.reservationPage5.events({
   "click #backButton5" : function() {
       console.log("back button clicked");
       Router.go("/")
    }       
});

Template.reservationPage6.events({
   "click #backButton6" : function() {
       console.log("back button clicked");
       Router.go("/")
    }       
});

Template.reservationPage7.events({
   "click #backButton7" : function() {
       console.log("back button clicked");
       Router.go("/")
    }       
});

Template.reservationPage8.events({
   "click #backButton8" : function() {
       console.log("back button clicked");
       Router.go("/")
    }       
});
Template.roomSelectPage.events({
  'click #room101': function() {
    currentRoom = 101
    console.log("101 clicked!");
    Router.go("/reservationPage")
  }
});

Template.roomSelectPage.events({
  'click #room102': function() {
    currentRoom = 102
    console.log("102 clicked!");
    Router.go("/reservationPage2")
  }
});

Template.roomSelectPage.events({
  'click #room103': function() {
    currentRoom = 103
    console.log("103 clicked!");
    Router.go("/reservationPage3")
  }
});

Template.roomSelectPage.events({
  'click #room104': function() {
    currentRoom = 104
    console.log("104 clicked!");
    Router.go("/reservationPage4")
  }
})

;Template.roomSelectPage.events({
  'click #room105': function() {
    currentRoom = 105
    console.log("105 clicked!");
    Router.go("/reservationPage5")
  }
});

Template.roomSelectPage.events({
  'click #room106': function() {
    currentRoom = 106
    console.log("106 clicked!");
    Router.go("/reservationPage6")
  }
});

Template.roomSelectPage.events({
  'click #room107': function() {
    currentRoom = 107
    console.log("107 clicked!");
    Router.go("/reservationPage7")
  }
});

Template.roomSelectPage.events({
  'click #room108': function() {
    currentRoom = 108
    console.log("108 clicked!");
    Router.go("/reservationPage8")
  }
});

