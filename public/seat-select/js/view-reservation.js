const input = document.querySelectorAll('input');
const form = document.querySelector('form');

const getReservation = (event) => {
  let userInput = [];
  input.forEach(input => userInput.push(input.value));
  let inputId = userInput;

  fetch('/users', {method: 'GET'})
  .then(res => res.json())
  .then(data => {
       //find the matching ID in the reservations database
    let res = data.find(rsv => rsv.id == inputId);

    if(res) {
      window.location = `/seat-select/confirmed/${res.id}`;
    } else {
      const error = document.getElementById('error')
      error.innerHTML = "ID not found"
    }
  })
  .catch(err => console.log(err));
}