'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { flights } = require('./test-data/flightSeating');
const { reservations } = require('./test-data/reservations')
const { toggleFormContent } = require('./public/seat-select/js/seat-select');



const PORT = process.env.PORT || 8000;



const handleFlight = (req, res) => {
  const { flightNumber } = req.params;
  // get all flight numbers
  const allFlights = Object.keys(flights);
  // is flightNumber in the array?
  console.log('REAL FLIGHT: ', allFlights.includes(flightNumber));
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

  // endpoints
  //.post('/confirmed')

  .get('/flights/:flightNumber', handleFlight)
  //returns info on a specific flight
  .get('/slingair/flights/:flight', (req, res) => {
    let flight = req.params.flight;

    res.status(200).send(toggleFormContent);

   });
  //returns an array of flight numbers
  .get('/slingair/flights', (req, res) => {
    //convert object to array
    let data = Object.keys(flights);
    res.status(200).send(data);
   })


//returns an array of all users. Accepts query params of `limit` and `start` for pagination.
//If values are not provided, it will return the first 10 users_
  // .get('/slingair/users', handleConfirmSeat);
  // //creates a new user/reservation
  // .post('/slingair/users', handleConfirmSeat);
 
 .get('/slingair/view-reservation', (req, res) => {
   let data = reservations;
   res.status(200).send(data);
 })
 


  .use((req, res) => res.send('Not Found'))
  .listen(PORT, () => console.log(`Listening on port ${PORT}`));
