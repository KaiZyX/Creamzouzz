
const registerButton = document.querySelector('button');


registerButton.addEventListener('click', function(event) {
    event.preventDefault(); // Cette ligne peut être conservée si nécessaire
    window.location.href = '/checkout'; //
});

