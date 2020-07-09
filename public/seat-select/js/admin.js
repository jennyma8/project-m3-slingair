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
  let reservations = [];
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
    seats.forEach(seat => {
      //this will create the initial row element required
      let tableRow = document.createElement('tr');

      if(reservations.length > 0) {
          reservations.forEach(res => {
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

flightInput.addEventListener('blur', displayTable);