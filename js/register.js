
const registerButton = document.querySelector('button');


registerButton.addEventListener('click', function(event) {
    event.preventDefault();

    window.location.href = 'checkout.html';
});
