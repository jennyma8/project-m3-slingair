'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { flights } = require("./test-data/flightSeating");
const { reservations } = require("./test-data/reservations");
const { v4: uuidv4 } = require('uuid'); //new

const PORT = process.env.PORT || 8000;

//return all seatings info of the flight
const handleFlight = (req, res) => {
  const { flightNumber } = req.params;
  const allFlights = Object.keys(flights);
  if(allFlights.includes(flightNumber)) {
    res.status(200).send(flights[flightNumber]);
  } else {
    res.status(400).send({message: "Flight not Found"});
  }
};

//this will render the seat-select page with all possible flights
const handleSeats = (req, res) => {
  const flightNames = Object.keys(flights);
  res.status(200).render("./pages/seat-select", { flights: flightNames });
};

//this handle confirmation pages needs to get the user flight id
const handleConfirmation = (req,res) => {
  let userId = req.params.id;
  let userInfo = reservations.find(user => user.id === userId);
  res.status(200).render("./pages/confirmed", { user: userInfo })
}

//push new reservation to database
const addReservation = (req,res) => {
  let info = req.body;
  let newId = {id: uuidv4()};
  let newData = {...newId, ...info}
  reservations.push(newData);
    //update isAvailable status from true to false
  flights[info.flight].find(seat => seat.id === info.seat)
    .isAvailable = false;
}

//get all reservations
const getReservations = (req,res) => {
  res.status(200).send(reservations);
}

const handleReservations = (req,res) => {
  res.status(200).render('./pages/view-reservation')
}

//admin page
const adminView = (req,res) => {
  res.status(200).render('./pages/admin', {
    flightNames: Object.keys(flights),
    flights: flights,
  })
}

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
  .set("view engine", "ejs") //new

  // endpoints
  .get("/seat-select", handleSeats)
  .get("/seat-select/confirmed/:id", handleConfirmation)
  .get("/flights/:flightNumber", handleFlight)
  .get("/view-reservation", handleReservations)
  .post("/users", addReservation)
  .get("/users", getReservations)
  .get("/admin", adminView)

  .use("*", (req, res) => res.send('Not Found'))
  .listen(PORT, () => console.log(`Listening on port ${PORT}`));
