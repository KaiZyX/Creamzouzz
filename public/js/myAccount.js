
function toggleForm(formId) {
    var form = document.getElementById(formId);
    if (form.style.display === "none") {
        form.style.display = "block";
    } else {
        form.style.display = "none";
    }
}
document.querySelector('.home-button').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default behavior of anchor tag
    window.location.href = '/'; // Redirect to the homepage
});