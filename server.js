'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const PORT = process.env.PORT || 8000;

//import route handling functions
const { 
  getFlights,
  handleSeats,
  addReservation,
  handleConfirmation,
  getReservations,
  handleReservations,
  adminView 
} = require("./handlers");

//this function will return all of the flight's seating data
//if the flight exists


express()
  .use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  })
  .use(morgan('dev'))
  .use(express.static('public'))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))
  .set("view engine", "ejs")

  // endpoints
 //renders seat-selection
  .get("/seat-select", handleSeats)

 //sends user to confirmation page
  .get("/seat-select/confirmed/:id", handleConfirmation)

 //get the flights #
  .get("/flights/:flightNumber", getFlights)

 //search for a reservation
  .get("/view-reservation", handleReservations)

 //receives form data and adds it to reservations
  .post("/users", addReservation)

 //retrieves all reservations, including updated form data
  .get("/users", getReservations)

 //admin view of all reservations
  .get("/admin", adminView)


  

  .use("*", (req, res) => res.send('Not Found'))
  .listen(PORT, () => console.log(`Listening on port ${PORT}`));
