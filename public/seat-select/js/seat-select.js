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
      //console.log(seat.id, seat.isAvailable, seatNumber);
      //console.log(seatNumber, seatData);

      //finally append the seat to the designated row
      row.appendChild(seat);
    }
  }

  //this function will add an onclick event to each seat-element
  //that will take as a value the inner value, which will likely be the seat
  //i.e 1A, 3E, 4D, etc...
  let seatMap = document.forms['seats'].elements['seat'];
  seatMap.forEach((seat) => {
    seat.onclick = () => {
      selection = seat.value;

      //The form will have an additional field from which we will pass
      //the value of the chosen seat, we want to submit the form with a valid
      //seat.
      seatSelected.value = selection;

      //same idea here, but to un-click a seat, and to make sure
      //that only 1 seat can be selected at a time, remove/add the 'selected'
      //class as necessary
      //additonally disable the button if it is not available
      seatMap.forEach((x) => {
        if (x.value !== seat.value) {
          document.getElementById(x.value).classList.remove('selected');
        }
      });
      document.getElementById(seat.value).classList.add('selected');
      document.getElementById('seat-number').innerText = `(${selection})`;
      confirmButton.disabled = false;
    };
  });
};


//####################### TOGGLE FORM CONTENT ############################

//initially, the form will be hidden until a flight is selected from the dropdown
const toggleFormContent = (event) => {

  //this will display on the form which flight has been selected, since it
  //looks the same for either choice of flight, thought this would make it
  //easier.
  const flightNumber = flightInput.value;
  flightName.innerHTML = `Select your Seat for flight ${flightNumber} and Provide your information`;
  //console.log('toggleFormContent: ', flightNumber);

  //in order to render our seating, we need to have the latest seating information

  // TODO: contact the server to get the seating availability
  //      - only contact the server if the flight number is this format 'SA###'.
  //      - Do I need to create an error message if the number is not valid?

  //COMMENT: I already pass into the page the only available flights
  //so by default the choice of flights is always valid, added the check anyways.


  if(flightNumber.startsWith("SA")) {
    //console.log("Yes, this flight starts with SA");
    // TODO: Pass the response data to renderSeats to create the appropriate seat-type.
    fetch(`/flights/${flightNumber}`)
      .then((res) => res.json())
      .then((data) => {



        //destroy previous rendering of seats before passing new data to render seats
        document.getElementById("seats-section").innerHTML = '';

        //render the seats
        renderSeats(data);
      }).catch(err => console.log(err));
    }
  };

//add the event listener for when a flight is selected from the dropdown,
//the form will be displayed (by default its )
flightInput.addEventListener('blur', toggleFormContent);



//##################### ASYNC AWAIT FUNCTIONS ########################

//These async await functions are mostly just to fetch and post data related to 
//the reservations at the '/users' endpoint on the server
const getData = async () => {
  return await fetch('/users', {method: 'GET'})
}

//we omit the ID, as it will be added in the back-end, for now we just pass as much
//info related to the book as possible, based on the value of the forms
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
  })
}

//#################### FORM VALIDATION ################################

//This is our own version of form validation, all the form fields are required,
//including the new seat input field, that is disabled, but will take on the
//value of any seat if clicked on.

const handleConfirmSeat = (event) => {

  //prevent the default form submission query as we want to eventually
  //redirect the user to the confirmation page
  event.preventDefault();

  //if a seat was not selected, display a message
  //NOTE: the additional input field in the form is disabled but can be passed
  //an inner value, by default if a field is disabled/readOnly on a form
  //it cannot be required for form submission.
  if(selection == undefined) {
    document.getElementById('warning').style.display = 'block';
    // window.alert("You forgot to pick a Seat");
  } else {

    //Sends the reservation to the BE to be added
    postData();

    //returns the latest list of reservations
    getData()
    .then(res=> res.json())
    .then(data => {
      //filter the reservations for the most recent one, based on name to get back
      //the generated ID from the BE, which will be use to redirect the user to their
      //unique confirmation page
      //NOTE: I was not sure if this could be done in another way, but since there
      //is not a strict form validation, i went with this
      let response = data.find(item => item.givenName ==document.getElementById('givenName').value)

      //console.log(redirectName.id);
      //redirects user to be rendered via endpoint
      window.location = `/seat-select/confirmed/${response.id}`;
    })
    .catch(err => {alert(err)});

  }
};

