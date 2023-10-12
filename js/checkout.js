document.addEventListener("DOMContentLoaded", function () {
    const payNowButton = document.getElementById("payButton");
    const popup = document.getElementById("popup");

    payNowButton.addEventListener("click", function () {
       
        popup.style.display = "block";

        
        setTimeout(function () {
            popup.style.display = "none";
        }, 3000); 
    });
});
