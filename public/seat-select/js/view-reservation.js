const inputs = document.querySelectorAll('input');
const form = document.querySelector('form');
//console.log(inputs);

//this function will validate the form and redirect the user to their
//confirmation page based on their reservation id#
const getReservation = (event) => {

  //prevent default submission
  event.preventDefault();
 
  //the form has 4 input fields, that once combined will give us an UUID string
  let userInput = [];

  //push all values of each input box into the userInput array
  inputs.forEach(input => userInput.push(input.value));

  //...and join them all into a string
  let inputId = userInput.join('-');

  // fetch all current reservations to compare with the entered ID
  fetch('/users', {method: 'GET'})
  .then(res => res.json())
  .then(data => {
       //find the matching ID in the reservations database
    let res = data.find(rsv => rsv.id == inputId);

    //if there is a match, then redirect, if its undefined then display
    //a message.
    if(res) {
      window.location = `/seat-select/confirmed/${res.id}`;
    } else {
      const error = document.getElementById('error')
      error.innerHTML = "ID not found"
    }
  })
  .catch(err => console.log(err));
}