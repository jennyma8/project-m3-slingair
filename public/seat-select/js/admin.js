const table = document.getElementById('table-content');
const flightInput = document.getElementById('flight');


//this promise returns seat availabilities based on the selected Flight
const getSeats = async (flightNum) => {
  return await fetch(`/flights/${flightNum}`, {method: 'GET'});
}

//this promise returns all current reservations
const getReservations = async(flightNum) => {
  return await fetch('/users', {method: 'GET'});
}

const displayTable = (event) => {
    //create a function scope empty array to hold all reservations
  let reservations = [];

  //obtain all current reservations and store them
  getReservations()
  .then(res => res.json())
  .then(data => data.forEach(res => {
    if(res.flight === flightInput.value) {
      reservations.push(res);
    }
    
  }));

  //obtain all seating info based on the selected flight
  getSeats(flightInput.value)
  .then(res => res.json())
  .then(seats => {
        //loop over every single seating object for the current flight
    //to create the appropriate rows
    seats.forEach(seat => {

      //this will create the initial row element required
      let tableRow = document.createElement('tr');

      //this is to check if there are any entered reservations, since seats are
      //occupied even though there arent any reservations under it
      //I want to render the table with the name of the person that reserved if
      //if the seat is occupied but not reserved under any name, leave it blank
      if(reservations.length > 0) {

        //loop over the reservation array at every seat
        reservations.forEach(res => {

          //This injects HTML into the <tr> element that was created for each row
          let seatOccupied = `<tr><td>${seat.id}</td><td>${seat.isAvailable}</td><td><a href="/seat-select/confirmed/${res.id}">${res.givenName + " " + res.surname}</a></td></tr>`
          let seatUnavailable = `<tr><td>${seat.id}</td><td>${seat.isAvailable}</td><td>${seat.isAvailable ? "-" : "Anonymous" }</td></tr>`
        
          if(res.seat === seat.id) {
            tableRow.innerHTML = seatOccupied;
          } else {
            tableRow.innerHTML = seatUnavailable;
          }
        })
        //append the row once the obove is completed
        table.appendChild(tableRow);
      } else {
        return "No Reservation"
      }
    })
  })
}

//this will render the table for the chosen flight
flightInput.addEventListener('blur', displayTable);