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
  const validFlight = allFlights.includes(flightNumber);
  if (validFlight) {
    if (req.query.admin) {
      const flight = flights[flightNumber];
      flight.forEach((seat) => {
        if (!seat.isAvailable) {
          const reserved = reservations.find(
            (x) => x.flight === flightNumber && x.seat === seat.id
          );
          if (reserved) {
            const occupant = reserved.givenName + " " + reserved.surname;
            seat.occupant = occupant;
            seat.bookingId = reserved.id;
          }
        }
      });
      res.json(flight);
    } else {
      res.json(flights[flightNumber]);
    }
  } else {
    res.status(404).redirect("/seat-select");
  }
};

const handleSeatSelect = (req, res) => {
  const flightsNumbers = Object.keys(flights);
  res.status(200).render("pages/index", { flightNumbers: flightsNumbers });
};

const handleConfirmed = (req, res) => {
  const reservationId = req.query.id;
  const newReservation = reservations.find((x) => x.id === reservationId);
  if (!newReservation) {
    res.status(400).redirect("/seat-select");
  } else {
    res.status(200).render("pages/confirmed", {
      flightNum: newReservation.flight,
      seat: newReservation.seat,
      name: newReservation.givenName + " " + newReservation.surname,
      email: newReservation.email,
    });
  }
};

const handleViewReservation = (req, res) => {
  const givenName = req.query.givenName;
  const surname = req.query.surname;
  const email = req.query.email;
  const userReservations = reservations.filter(
    (x) =>
      x.givenName === givenName && x.surname === surname && x.email === email
  );
  console.log(userReservations);
  res
    .status(200)
    .render("pages/view-reservation", { reservations: userReservations });
};

const handlePostReservation = (req, res) => {
  let queryString = "?givenName=" + req.body.givenName;
  queryString += "&surname=" + req.body.surname;
  queryString += "&email=" + req.body.email;

  res.redirect("/reservation" + queryString);
};

const handlePostCnfirmation = (req, res) => {
  const newReservation = req.body;
  newReservation.id = uuidv4();

  const flight = flights[newReservation.flight];
  const seat = flight.find((x) => x.id === newReservation.seat);

  const reservationExists = reservations.find(
    (x) =>
      x.flight === newReservation.flight &&
      x.givenName === newReservation.givenName &&
      x.surname === newReservation.surname &&
      x.email === newReservation.email
  );

  if (seat.isAvailable && !reservationExists) {
    seat.isAvailable = false;
    reservations.push(newReservation);
    res.status(200).send({ id: newReservation.id });
  } else {
    res.status(400).send({ err: "Invalid Reservation" });
  }
};

const handleAdmin = (req, res) => {
  const flightsNumbers = Object.keys(flights);
  res.status(200).render("pages/admin", { flightNumbers: flightsNumbers });
};

const handleBookingInfo = (req, res) => {
  const { bookingId } = req.body;
  let info = reservations.find((x) => x.id === bookingId);
  res.status(200).json(info);
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

  .get("/", (req, res) => {
    res.status(200).redirect("/seat-select");
  })
  .get("/seat-select", handleSeatSelect)
  .get("/confirmed", handleConfirmed)
  .get("/reservation", handleViewReservation)
  .get("/flights/:flightNumber", handleFlight)
  //creates a new user/reservation
  .post("/slingair/users", handlePostCnfirmation)
  .post("/view", handlePostReservation)
  .get("/admin", handleAdmin)
  .post("/bookinginfo", handleBookingInfo)

  .use((req, res) => res.send('Not Found'))
  .listen(PORT, () => console.log(`Listening on port ${PORT}`));
