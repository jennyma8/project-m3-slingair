const { flights } = require("./test-data/flightSeating");
const { reservations } = require("./test-data/reservations");
const { v4: uuidv4 } = require('uuid');

//this function will return all of the flight's seating data
//if the flight exists
const getFlights = (req, res) => {

  const { flightNumber } = req.params;
  // get all flight numbers
  const allFlights = Object.keys(flights);

  // is flightNumber in the array?
  //console.log("REAL FLIGHT: ", allFlights.includes(flightNumber));

  //Checks if the flight number exists
  if(allFlights.includes(flightNumber)) {

    //send all of the flight's data
    res.status(200).send(flights[flightNumber]);
  } else {
    res.status(400).send({message: "Flight not Found"});
  }
};

//this will render the seat-select page with all possible flights
const handleSeats = (req, res) => {

  //have to convert object data into an array of names of the flights
  const flightNames = Object.keys(flights);
  console.log(flightNames)

  //render the page
  res.status(200).render("./pages/seat-select", {
    flights: flightNames,
    pageTitle: 'Seat Selection'
  });
};

//this handle confirmation pages needs to get the user flight id
const handleConfirmation = (req,res) => {
  let userId = req.params.id;

  //find the reservation info based on the id associated to the res
  let userInfo = reservations.find(user => user.id === userId);

  //console.log(userInfo);

  //render the confirmation page, passing the approriate info
  res.status(200).render("./pages/confirmed", {
    pageTitle: "Confirm Reservation",
    user: userInfo,
  })
}

//This will add a new reservation, when the seat-select form 
//has been completed, validation is done on the FE
const addReservation = (req,res) => {

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
}

//This GET request immediately returns the most up-to-date reservations data
const getReservations = (req,res) => {
  res.status(200).send(reservations);
}

//this will render the reservation search page
const handleReservations = (req,res) => {
  res.status(200).render('./pages/view-reservation', {
    pageTitle: 'View reservations',
  })
}

//this is the admin page what will display a table of all currently 
//seats and their status, as well as who reserved it (if avail)
const adminView = (req,res) => {
  res.status(200).render('./pages/admin', {
    pageTitle: 'Admin',
    flightNames: Object.keys(flights),
    flights: flights,
  })
}

module.exports = {
  getFlights: getFlights,
  handleSeats: handleSeats,
  addReservation: addReservation,
  handleConfirmation: handleConfirmation,
  getReservations: getReservations,
  handleReservations: handleReservations,
  adminView: adminView,
};