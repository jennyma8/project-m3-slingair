'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { flights } = require('./test-data/flightSeating');
const { reservations } = require('./test-data/reservations')
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 8000;

const handleFlight = (req, res) => {
  const { flightNumber } = req.params;
  // get all flight numbers
  const allFlights = Object.keys(flights);
  // is flightNumber in the array?
  console.log('REAL FLIGHT: ', allFlights.includes(flightNumber));
  const selectedFlightSeating = flights[flightNumber];
  res.status(200).send(selectedFlightSeating);
};

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
  .get('/flights/:flightNumber', handleFlight)
    //returns an array of flight numbers
  .get('/slingair/flights', (req, res) => {
      //convert object to array
      let data = Object.keys(flights);
      res.status(200).send(data);
  })
  //returns an array of all users
  .get('/slingair/users', (req, res) => {
    let data = reservations;
    res.status(200).send(data);
  })

//Accepts query params of `limit` and `start` for pagination. _If values are not provided, it will return the first 10 users_
  //creates a new user/reservation
  .post('/slingair/users', (req,res) => {
    const newUser = req.body;
    reservations.push(newUser);
    res.json(newUser);
  })

//renders seat-selection
  .get("/seat-select", (req, res) => {

    //have to convert object data into an array of names of the flights
    const flightNames = Object.keys(flights);
    console.log(flightNames)
  
    //render the page
    res.status(200).render("./pages/seat-select", {
      flights: flightNames,
      pageTitle: 'Seat Selection'
    });
  })

//sends user to confirmation page
  .get("/seat-select/confirmed/:id", (req,res) => {
  let userId = req.params.id;

  //find the reservation info based on the id associated to the res
  let userInfo = reservations.find(user => user.id === userId);

  //console.log(userInfo);

  //render the confirmation page, passing the approriate info
  res.status(200).render("./pages/confirmed", {
    pageTitle: "Confirm Reservation",
    user: userInfo,
  })
})

//search for a reservation
  .get("/view-reservation", (req,res) => {
    res.status(200).render('./pages/view-reservation', {
      pageTitle: 'View reservations',
    })
  })

//receives form data and adds it to reservations
  .post("/users", (req,res) => {

  //takes incoming request info
  let info = req.body;

  //generate a unique ID for this request
  let newId = {id: uuidv4()};

  //combine the new property into a single object
  let newData = {...newId, ...info}

  //finally, push this into the reservations data
  reservations.push(newData);
  //console.log(reservations); //should now be added

  //time to udpate the flight availabilities information
  //from the appropriate flight -> find the matching seating -> update isAvailable
  flights[info.flight].find(seat => seat.id === info.seat)
    .isAvailable = false;

  //let body = {status: 200, flightId: newId}
  //res.status(200).send(body);
})

  //admin view of all reservations
  .get("/admin", (req,res) => {
    res.status(200).render('./pages/admin', {
      pageTitle: 'Admin',
      flightNames: Object.keys(flights),
      flights: flights,
    })
  })

  .use((req, res) => res.send('Not Found'))
  .listen(PORT, () => console.log(`Listening on port ${PORT}`));
