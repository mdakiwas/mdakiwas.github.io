document.addEventListener("DOMContentLoaded", function () {
    // Check if we are on the form page
    const dobForm = document.getElementById('dobForm');
    if (dobForm) {
        // Form page logic
        dobForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const dobInput = document.getElementById('dob');
            const dob = dobInput.value;

            if (!dob) {
                alert('Please enter your date of birth.');
                return;
            }

            // Calculate time left for carbon emissions to reach 1.5 degrees Celsius
            const timeLeft = calculateTimeLeft();
            const age = calculateAge(dob);

            // Extract the number of years from `timeLeft` (e.g., "10 years" -> 10)
            const yearsLeft = parseInt(timeLeft.split(" ")[0], 10);

            // Add age to the years left
            const combinedYears = age + yearsLeft;

            // Redirect to the result page with query parameters
            const resultPageUrl = `/Pages/clock.html?timeLeft=${encodeURIComponent(timeLeft)}&age=${age}&combinedYears=${combinedYears}`;
            window.location.href = resultPageUrl;
        });
    }

    // Check if we are on the results page
    const urlParams = new URLSearchParams(window.location.search);
    const timeLeft = urlParams.get('timeLeft');
    const age = urlParams.get('age');
    const combinedYears = urlParams.get('combinedYears');

    if (timeLeft && age) {
        const timeLeftElement = document.getElementById('timeLeft');
        const ageElement = document.getElementById('age');
        const combinedMessageElement = document.getElementById('combinedMessage');

        if (timeLeftElement) {
            timeLeftElement.textContent = `Time left for carbon emission to reach 1.5 degrees Celsius: ${timeLeft}`;
        }
        if (ageElement) {
            ageElement.textContent = `Your age: ${age}`;
        }
        if (combinedMessageElement) {
            combinedMessageElement.textContent = `You'll be ${combinedYears} years old.`;
        }
    }
});

function calculateTimeLeft() {
    // Get the latest estimates for remaining carbon budget and annual emissions
    const remainingCarbonBudget = 202; // Gigatonnes (Gt)
    const annualEmissions = 42.2; // Gt

    // Calculate the time left in years
    const timeLeftYears = remainingCarbonBudget / annualEmissions;

    // Convert years to a more readable format (e.g., years, months, days)
    const years = Math.floor(timeLeftYears);
    const months = Math.floor((timeLeftYears - years) * 12);
    const days = Math.round((timeLeftYears - years - months / 12) * 365);

    return `${years} years, ${months} months, and ${days} days`;
}

function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}