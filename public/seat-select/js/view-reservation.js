const inputs = document.querySelectorAll('input');
const form = document.querySelector('form');
//console.log(inputs);

//this function will validate the form and redirect the user to their
//confirmation page based on their reservation id#
const getReservation = (event) => {

  //as this is a custom form validation, prevent default submission from occuring
  event.preventDefault();
  // console.log(event);

  //the form has 4 input fields, that once combined will give us an UUID string
  let userInput = [];

  //push all values of each input box into the userInput array
  inputs.forEach(input => userInput.push(input.value));

  //...and join them all into a string
  let inputId = userInput.join('-');


  // console.log("User Inputted:", inputId);
  // console.log("Fetching data...");

  //now we want to fetch all current reservations to compare with the inputted
  //id
  fetch('/users', {method: 'GET'})
  .then(res => res.json())
  .then(data => {
    //data.forEach(res => console.log(res));

    //match to the first ID in the reservations database
    let res = data.find(rsv => rsv.id == inputId);

    //if there is a match, then redirect, if its undefined then display
    //a message.
    if(res) {
      window.location = `/seat-select/confirmed/${res.id}`;
    } else {
      document.getElementById('warning').style.display = 'block';
      //window.alert("The Reservation ID you entered does not exist!");
    }
  })
  .catch(err => console.log(err));
}