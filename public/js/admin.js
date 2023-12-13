const showIcecreamsBtn = document.getElementById('showIcecreamsBtn');
const icecreamsSection = document.getElementById('icecreamsSection');
const toppingsSection = document.getElementById('toppingsSection'); // Selection for toppings section

let currentForm = null;

showIcecreamsBtn.addEventListener('click', () => {
    // Check if icecreams section is already displayed or not
    const isIcecreamsDisplayed = icecreamsSection.style.display === 'block';

    // Check if toppings section is already displayed or not
    const isToppingsDisplayed = toppingsSection.style.display === 'block';

    // Hide all sections before displaying one
    icecreamsSection.style.display = 'none';
    toppingsSection.style.display = 'none';

    // Display or hide section based on its current state
    if (!isIcecreamsDisplayed && !isToppingsDisplayed) {
        icecreamsSection.style.display = 'block';
        toppingsSection.style.display = 'block';
    }
});

function toggleForm(formId) {
    const form = document.getElementById(formId);
    const icecreamSection = document.getElementById('icecreamsSection');
    const toppingsSection = document.getElementById('toppingsSection');

    if (currentForm && currentForm !== form) {
        currentForm.style.display = 'none';
    }

    if (form.style.display === 'none') {
        form.style.display = 'block';
        currentForm = form;
    } else {
        form.style.display = 'none';
        currentForm = null;
    }

    // Hide the Edit/Remove section when opening a form
    icecreamSection.style.display = 'none';
    toppingsSection.style.display = 'none';

}




async function deleteIcecream(icecreamId) {
    try {
        const response = await fetch('/deleteIcecream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ icecreamId })
        });

        const result = await response.text();
        alert(result); // Show a message indicating success or failure of deletion
        location.reload(); // Reload the page to show changes
    } catch (error) {
        console.error(error);
        alert('Error deleting icecream');
    }
}

async function deleteTopping(toppingId) {
    try {
        const response = await fetch('/deleteTopping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ toppingId })
        });

        const result = await response.text();
        alert(result); // Show a message indicating success or failure of deletion
        location.reload(); // Reload the page to show changes
    } catch (error) {
        console.error(error);
        alert('Error deleting topping');
    }
}

function showModifyIcecreamModal() {
    const modifyIcecreamModal = document.getElementById('modifyIcecreamModal');
    modifyIcecreamModal.style.display = 'flex'; // Affiche la superposition modale
}

function hideModifyIcecreamModal() {
    const modifyIcecreamModal = document.getElementById('modifyIcecreamModal');
    modifyIcecreamModal.style.display = 'none'; // Masque la superposition modale
}

async function modifyIcecream(icecreamId) {
    hideModifyForms();
    showModifyIcecreamModal();

    const modifyIcecreamForm = document.getElementById('modifyIcecreamForm');
    modifyIcecreamForm.style.display = 'block';
    modifyIcecreamForm.action = `/modifyIcecream/${icecreamId}`;

    try {
        const response = await fetch(`/fetchIcecreamDetails/${icecreamId}`);
        const icecreamDetails = await response.json();
        console.log(icecreamDetails);
        test = document.getElementById('Mdyicecream_brand')
        console.log(icecreamDetails.icecream_name);
        try {
            test.value = icecreamDetails.icecream_brand;
        } catch (error) {
            console.log(error);
        }
        // Pré-remplir les champs du formulaire avec les détails récupérés
        document.getElementById('mdy_icecream_brand').value = icecreamDetails.icecream_brand;
        document.getElementById('mdy_icecream_name').value = icecreamDetails.icecream_name;
        document.getElementById('mdy_icecream_baseprice').value = icecreamDetails.icecream_baseprice;
        document.getElementById('mdy_icecream_calory').value = icecreamDetails.icecream_calory;
        document.getElementById('mdy_icecream_stock').value = icecreamDetails.icecream_stock;
        document.getElementById('mdy_icecream_description').value = icecreamDetails.icecream_description;
        document.getElementById('mdy_icecream_image').value = icecreamDetails.icecream_image;

    } catch (error) {
        console.error(error);
        alert('Error fetching icecream details');
    }
}





function showModifyToppingModal() {
    const modifyToppingModal = document.getElementById('modifyToppingModal');
    modifyToppingModal.style.display = 'flex'; // Affiche la superposition modale
}

function hideModifyToppingModal() {
    const modifyToppingModal = document.getElementById('modifyToppingModal');
    modifyToppingModal.style.display = 'none'; // Masque la superposition modale
}

async function modifyTopping(toppingId) {
    hideModifyForms();
    showModifyToppingModal();

    const modifyToppingForm = document.getElementById('modifyToppingForm');
    modifyToppingForm.style.display = 'block';
    modifyToppingForm.action = `/modifyTopping/${toppingId}`;

    try {
        const response = await fetch(`/fetchToppingDetails/${toppingId}`);
        const toppingDetails = await response.json();
        
        // Pré-remplir les champs du formulaire avec les détails récupérés
        document.getElementById('mdy_topping_name').value = toppingDetails.topping_name;
        document.getElementById('mdy_topping_price').value = toppingDetails.topping_price;
        document.getElementById('mdy_topping_calory').value = toppingDetails.topping_calory;
        document.getElementById('mdy_topping_stock').value = toppingDetails.topping_stock;
        document.getElementById('mdy_topping_description').value = toppingDetails.topping_description;
        document.getElementById('mdy_topping_image').value = toppingDetails.topping_image;

    } catch (error) {
        console.error(error);
        alert('Error fetching topping details');
    }
}

function hideModifyForms() {
    const modifyIcecreamForm = document.getElementById('modifyIcecreamForm');
    const modifyToppingForm = document.getElementById('modifyToppingForm');

    modifyIcecreamForm.style.display = 'none';
    modifyToppingForm.style.display = 'none';
}

function hideOtherForms() {
    const addIcecreamForm = document.getElementById('icecreamForm');
    const addToppingForm = document.getElementById('toppingForm');

    addIcecreamForm.style.display = 'none';
    addToppingForm.style.display = 'none';
}