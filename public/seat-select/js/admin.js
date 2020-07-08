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

//This function will render table rows for flights without any reservations
//because in the reservation data, there is only 1 reservation with a valid name
//I was not able to render my admin table properly for occupied seats
const renderRows = (seat) => {
  let tableRow = document.createElement('tr');
  let seatOccupied = `<tr><td>${seat.id}</td><td>${seat.isAvailable}</td><td>No Name Given</td></tr>`
  let seatUnavailable = `<tr><td>${seat.id}</td><td>${seat.isAvailable}</td><td>${seat.isAvailable ? "-" : "No Name Given" }</td></tr>`
  if(seat.isAvailable) {
    tableRow.innerHTML = seatUnavailable;
  } else {
    tableRow.innerHTML = seatOccupied;
  }
  table.appendChild(tableRow);
}

//This function will fire whenever the user selects a flight from the dropdown
//select
const displayTable = (event) => {
  //console.log("This Fires", flightInput.value);

  //create a function scope empty array to hold all reservations
  let reservations = [];

  //obtain all current reservations and store them
  getReservations()
  .then(res => res.json())
  .then(data => data.forEach(res => {
    if(res.flight === flightInput.value) {
      reservations.push(res);
    }
    //console.log(`These seats from flight ${flightInput.value} are taken:`,reservations);
  }));

  //obtain all seating info based on the selected flight
  getSeats(flightInput.value)
  .then(res => res.json())
  .then(seats => {
    //destroy the table body first!!
    table.innerHTML ='';

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
          let seatUnavailable = `<tr><td>${seat.id}</td><td>${seat.isAvailable}</td><td>${seat.isAvailable ? "-" : "No Name Given" }</td></tr>`

          //if the reserved seat matches an occupied seat, then render the
          //appropirate HTML, note that we also want to create a link to the
          //users confirmation page if it exists
          if(res.seat === seat.id) {
            tableRow.innerHTML = seatOccupied;
          } else {
            tableRow.innerHTML = seatUnavailable;
          }
        })
        //finally append the row once the obove is completed
        table.appendChild(tableRow);
      } else {
        //this method was to render FLIGHT SA231, which had no reservations
        //initially, so the above code would not fire since reservations.length = 0;
        renderRows(seat);
      }
    })
  })
}

//this will render the table for the chosen flight
flightInput.addEventListener('blur', displayTable);