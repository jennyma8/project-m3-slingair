const flightInput = document.getElementById('flight');
const flightName = document.getElementById('flight-name');
const seatsDiv = document.getElementById('seats-section');
const confirmButton = document.getElementById('confirm-button');
const seatSelected = document.getElementById("chosenSeat");

let selection = undefined;

//this function will render the seat, based on current seating data
const renderSeats = (data) => {

  //makes the form and seat sections visible
  document.querySelector('.form-container').style.display = 'block';

  const alpha = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (let r = 1; r < 11; r++) {
    const row = document.createElement('ol');
    row.classList.add('row');
    row.classList.add('fuselage');
    seatsDiv.appendChild(row);
    for (let s = 1; s < 7; s++) {
      const seatNumber = `${r}${alpha[s - 1]}`;
      const seat = document.createElement('li');
      // Two types of seats to render
      const seatOccupied = `<li><label class="seat"><span id="${seatNumber}" class="occupied">${seatNumber}</span></label></li>`;
      const seatAvailable = `<li><label class="seat"><input type="radio" name="seat" value="${seatNumber}" /><span id="${seatNumber}" class="avail">${seatNumber}</span></label></li>`;

     
      //sort the seating data with the matching seatNumber i.e. 1A, 1C, .. etc
      //and check if it is available or not to assign its HTML code
      let seatData = data.find(item => item.id == seatNumber);
      if(seatData.isAvailable) {
        seat.innerHTML = seatAvailable;
      } else {
        seat.innerHTML = seatOccupied;
      }

      //finally append the seat to the designated row
      row.appendChild(seat);
    }
  }

  //onclick event to each seat
  let seatMap = document.forms['seats'].elements['seat'];
  seatMap.forEach((seat) => {
    seat.onclick = () => {
      selection = seat.value;
            seatMap.forEach((x) => {
        if (x.value !== seat.value) {
          document.getElementById(x.value).classList.remove('selected');
        }
      });
      document.getElementById(seat.value).classList.add('selected');
      document.getElementById('seat-number').innerText = `(${selection})`;
      //disable the button if it is not available
      confirmButton.disabled = false;
    };
  });
};


//form is hidden until a flight is selected
const toggleFormContent = (event) => {
  const flightNumber = flightInput.value;
 
  // TODO: contact the server to get the seating availability
  //      - only contact the server if the flight number is this format 'SA###'.
  //      - Do I need to create an error message if the number is not valid?

   if(flightNumber.startsWith("SA")) {
        // TODO: Pass the response data to renderSeats to create the appropriate seat-type.
    fetch(`/flights/${flightNumber}`)
      .then((res) => res.json())
      .then((data) => {
        //destroy previous rendering of seats before passing new data to render seats
        document.getElementById("seats-section").innerHTML = '';
        //render the seats
        renderSeats(data);
        //created error msg
      }).catch(err => console.log(err));
    }
  };

//add the event listener for when a flight is selected from the dropdown,
//the form will be displayed (by default its )
flightInput.addEventListener('blur', toggleFormContent);



//ASYNC AWAIT FUNCTIONS

const getData = async () => {
  return await fetch('/users', {method: 'GET'})
}

const postData = async () => {
  return await fetch('/users', {
    method: 'POST',
    body: JSON.stringify({
      flight: flightInput.value,
      seat: selection,
      givenName: document.getElementById('givenName').value,
      surname: document.getElementById('surname').value,
      email: document.getElementById('email').value,
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  }

const handleConfirmSeat = (event) => {

  //prevent the default form submission query as we want to eventually
  //redirect the user to the confirmation page
  event.preventDefault();
    //Sends the reservation to the BE to be added
    postData();

    //returns the latest list of reservations
    getData()
    .then(res=> res.json())
    .then(data => {
      //filter the reservations based on the client's email to get back
      //the generated ID from the BE, which will be used to redirect the user to their
      //unique confirmation page
      
      let response = data.find(item => item.email ==document.getElementById('email').value)
      //redirects user to be rendered via endpoint
      window.location = `/seat-select/confirmed/${response.id}`;
    })
    .catch(err => {alert(err)});

  };

