import { initGlobe, disposeGlobe } from './globe/globe.js';
// import { updateMarkerInfo } from './globe/globe.js';

document.querySelectorAll('.nav-head').forEach(item => {
    const targetSectionSelector = item.getAttribute('href');
    const section = document.querySelector(targetSectionSelector);

    if (section) {
        item.addEventListener('mouseover', () => {
            section.classList.add('active');
        });

        item.addEventListener('mouseout', () => {
            section.classList.remove('active');
        });
    }
});

function showSection(sectionId) {
    const sections = document.querySelectorAll('.flights-sec');

    sections.forEach(section => {
        if (section.id === sectionId) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}
document.querySelectorAll('#flights-nav a').forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault();


        document.querySelectorAll('#flights-nav a').forEach(a => {
            a.classList.remove('active');
        });


        link.classList.add('active');


        const sectionId = link.getAttribute('data-section');

        showSection(sectionId);
    });
});


showSection('book');
document.querySelector('#flights-nav a[data-section="book"]').classList.add('active');

// Popup div for the destination input
document.querySelectorAll('.dest-click').forEach(container => {
    container.addEventListener('click', function (event) {
        const popupDiv = document.querySelector('.popup-content'); // Select the popup content
        const popupHeading = popupDiv.querySelector('h2'); // Get the <h2> tag inside the popup
        const inputField = document.querySelector('.loc-search'); // Get the search input field

        // Check which div was clicked and update the popup content and placeholder accordingly
        if (container.id === "from-destination") {
            popupHeading.textContent = 'Departure Airport';
            inputField.placeholder = 'From where?';
        } else {
            popupHeading.textContent = 'Destination Airport';
            inputField.placeholder = 'To where?';
        }

        popupDiv.style.display = "block";

        event.stopPropagation();
    });
});

// Number of airports to display per page
const airportsPerPage = 15;
let currentPage = 1; // Start at page 1

fetch('airports.json')
    .then(response => response.json())
    .then(data => {
        const airportsData = data;

        // Function to render airports for a specific page
        function renderPage(page) {
            const startIdx = (page - 1) * airportsPerPage; // Starting index of the page
            const endIdx = startIdx + airportsPerPage; // Ending index of the page
            const airportsOnPage = airportsData.slice(startIdx, endIdx);

            renderAirportList(airportsOnPage); // Render the airports for the current page
        }

        // Initial page render
        renderPage(currentPage);

        const searchInput = document.querySelector('.loc-search');
        const resultsList = document.querySelector('#search-results');

        searchInput.addEventListener('input', function () {
            const query = searchInput.value.toLowerCase();
            resultsList.innerHTML = ''; // Clear previous results

            // Filter the airport data based on the input
            const filteredAirports = airportsData.filter(airport => {
                return (
                    (airport.code && airport.code.toLowerCase().includes(query)) ||
                    (airport.city && airport.city.toLowerCase().includes(query)) ||
                    (airport.country && airport.country.toLowerCase().includes(query))
                );
            });

            // Render the filtered airport list (just the current page of filtered airports)
            renderAirportList(filteredAirports.slice(0, airportsPerPage)); // Render only the first page of filtered results

            // If no results are found, show a "No results" message
            if (filteredAirports.length === 0) {
                const noResultsMessage = document.createElement('li');
                noResultsMessage.textContent = 'No airports found.';
                resultsList.appendChild(noResultsMessage);
            }
        });

        // Next and Previous Button Event Listeners
        const prevButton = document.querySelector('#prev');
        const nextButton = document.querySelector('#next');

        // Next button functionality
        nextButton.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent event from bubbling up
            console.log('nextButton clicked');
            if ((currentPage * airportsPerPage) < airportsData.length) { // If there are more pages
                currentPage++;
                renderPage(currentPage);
            }

            if ((currentPage * airportsPerPage) >= airportsData.length) {
                nextButton.disabled = true; // Disable the button if there are no more pages
            }

            if (currentPage > 1) {
                prevButton.disabled = false;
            }

            event.preventDefault();
        });
        // Previous button functionality
        prevButton.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent event from bubbling up
            console.log('prevButton clicked');
            // Only go back if we're not on the first page
            if (currentPage > 1) {
                currentPage--; // Decrement the current page number
                renderPage(currentPage); // Render the updated page
            }

            if (currentPage === 1) {
                prevButton.disabled = true;
            } else {
                prevButton.disabled = false;
            }

            if ((currentPage * airportsPerPage) < airportsData.length) {
                nextButton.disabled = false; // Enable the Next button if more pages exist
            }

            event.preventDefault();
        });

    })
    .catch(error => {
        console.error('Error fetching airports data:', error);
    });

// Function to render the list of airports
function renderAirportList(airports) {
    const resultsList = document.querySelector('#search-results');
    resultsList.innerHTML = ''; // Clear the previous list

    airports.forEach(airport => {
        const listItem = document.createElement('li');
        listItem.textContent = `${airport.city}, ${airport.country}, ${airport.code}`;

        // Add click event to each list item
        listItem.addEventListener('click', () => {
            const selectedDiv = document.querySelector('.dest-click.active');
            const airportField = `${airport.city}, ${airport.country} (${airport.code})`;

            if (selectedDiv) {
                const input = selectedDiv.querySelector('input');
                input.value = airportField;  // Set the selected airport value in the input
            }

            closePopup(); // Close the popup after selecting an airport
        });

        resultsList.appendChild(listItem); // Append the list item
    });
}

// Mark the clicked destination div as active
document.querySelectorAll('.dest-click').forEach(container => {
    container.addEventListener('click', function () {
        // Remove active class from all containers
        document.querySelectorAll('.dest-click').forEach(c => c.classList.remove('active'));

        // Mark the clicked div as active
        container.classList.add('active');
    });
});

// Function to close the popup
export function closePopup() {
    const popupDiv = document.querySelector('.popup-content');
    popupDiv.style.display = 'none'; // Hide the popup

    // Remove active class from all destination containers
    document.querySelectorAll('.dest-click').forEach(container => {
        container.classList.remove('active');
    });
}

// Close button functionality
document.querySelector('.popup-content #close-popup').addEventListener('click', function () {
    closePopup();
});

document.addEventListener('DOMContentLoaded', function () {
    const flightfindSelect = document.getElementById('flightfind-type');
    const dynamicInput = document.getElementById('dynamic-input');

    // Function to display the appropriate input field based on the selection
    function updateInputField() {
        const selectedValue = flightfindSelect.value;

        // Clear the dynamic input div before adding new content
        dynamicInput.innerHTML = '';

        if (selectedValue === 'confirmation') {
            // Create an input for Confirmation Number
            const label = document.createElement('label');
            label.setAttribute('for', 'confirmation-number');
            label.textContent = 'Enter your Confirmation Number:';

            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'confirmation-number';
            input.name = 'confirmation-number';
            input.placeholder = 'Confirmation Number';

            dynamicInput.appendChild(label);
            dynamicInput.appendChild(input);
        } else if (selectedValue === 'credit') {
            // Create an input for Credit Card Number
            const label = document.createElement('label');
            label.setAttribute('for', 'credit-card-number');
            label.textContent = 'Enter your Credit Card Number:';

            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'credit-card-number';
            input.name = 'credit-card-number';
            input.placeholder = 'Credit Card Number';

            dynamicInput.appendChild(label);
            dynamicInput.appendChild(input);
        } else if (selectedValue === 'ticket') {
            // Create an input for Ticket Number
            const label = document.createElement('label');
            label.setAttribute('for', 'ticket-number');
            label.textContent = 'Enter your Ticket Number:';

            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'ticket-number';
            input.name = 'ticket-number';
            input.placeholder = 'Ticket Number';

            dynamicInput.appendChild(label);
            dynamicInput.appendChild(input);
        }
    }

    // Event listener for when the selection changes
    flightfindSelect.addEventListener('change', updateInputField);

    // Initial call to display the input field based on the default selection
    updateInputField();
});

$(function () {
    $('input[name="datefilter"]').daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear',
            format: 'YYYY-MM-DD', // Ensure the locale uses the correct format
        }
    });

    $('input[name="datefilter"]').on('apply.daterangepicker', function (ev, picker) {
        // Update visible input
        $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
        
        // Update hidden inputs
        $('input[name="startDate"]').val(picker.startDate.format('YYYY-MM-DD'));
        $('input[name="endDate"]').val(picker.endDate.format('YYYY-MM-DD'));
    });    
});

// Script for opening/closing the globe modal
// Get references to modal elements
const openButton = document.getElementById('open-globe');
const modal = document.getElementById('globe-modal');
const modalCloseButton = document.getElementById('close-modal');

// Loop through each button and add the event listener
openButton.addEventListener('click', (event) => {
    console.log('Open button clicked');
    event.stopPropagation();  // Prevent any click outside the modal from closing it
    event.preventDefault();
    modal.classList.add('open');  // Open the modal
    // Initialize the globe rendering
    initGlobe();
});

modalCloseButton.addEventListener('click', () => {
    modal.classList.remove('open');  // Remove the class to hide the modal
    disposeGlobe();
});

document.addEventListener('click', function (event) {
    const popupDiv = document.querySelector('.popup-content');

    // Check if the click happened outside the popup content
    if (!popupDiv.contains(event.target)) {
        popupDiv.style.display = "none"; // Hide the popup content
    }

    // Check if the click happened outside the modal
    if (!modal.contains(event.target)) {
        modal.classList.remove('open'); // Close the modal
    }
});

// This function will be called when a marker is clicked on the globe
export function updateMarkerInfo(markerData) {
    const activeContainer = document.querySelector('.dest-click.active');

    if (activeContainer) {
        const inputMarker = activeContainer.querySelector('input.dest-input');

        if (inputMarker) {
            inputMarker.value = markerData;
        } else {
            console.error("Input element not found within .dest-click.active");
        }
    } else {
        console.error(".dest-click.active not found");
    }

    disposeGlobe();
    modal.classList.remove('open');
    closePopup();
}
window.updateMarkerInfo = updateMarkerInfo;








/////////////////////////// GOOGLE FLIGHT API /////////////////////////// 
document.getElementById('flight-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Extract values from the form
    const flightType = document.getElementById('flight-type').value;
    const passengers = document.getElementById('passenger').value;
    const from = document.querySelector('[name="from-input"]').value.trim();
    const to = document.querySelector('[name="to-input"]').value.trim();
    const dateFilter = document.querySelector('[name="datefilter"]').value.trim();

    // Validate inputs
    if (!from || !to || !dateFilter) {
        alert('Please fill in all the required fields.');
        return;
    }

    // Log for debugging
    console.log('Flight Type:', flightType);
    console.log('Passengers:', passengers);
    console.log('From:', from);
    console.log('To:', to);
    console.log('Date Filter:', dateFilter);

    // Placeholder API URL
    const apiKey = '0df5e75a6448fef0246c8fbc10b12173f09fd02ab9f678479e7997b5e2471634';
    const apiUrl = `https://serpapi.com/search.json?engine=google_flights&origin=${from}&destination=${to}&departure_date=${dateFilter}&passengers=${passengers}&flight_type=${flightType}&api_key=${apiKey}`;

    // Fetch flight data
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Error fetching flight data:', error);
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<p>Error fetching flight data. Please try again later.</p>';
        });
});

// Function to display the flight results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    // Check if there are flights in the response
    if (data && data.flights && data.flights.length > 0) {
        data.flights.forEach(flight => {
            const flightElement = document.createElement('div');
            flightElement.classList.add('flight-result');

            // Populate the flight details
            flightElement.innerHTML = `
                <h3>Flight Price: ${flight.price.amount} ${flight.price.currency}</h3>
                <p><strong>From:</strong> ${flight.origin}</p>
                <p><strong>To:</strong> ${flight.destination}</p>
                <p><strong>Departure:</strong> ${flight.departure_time}</p>
                <p><strong>Arrival:</strong> ${flight.arrival_time}</p>
                <p><strong>Airline:</strong> ${flight.airline}</p>
            `;

            // Append the flight result to the results div
            resultsDiv.appendChild(flightElement);
        });
    } else {
        resultsDiv.innerHTML = '<p>No flights found for the selected criteria.</p>';
    }
}