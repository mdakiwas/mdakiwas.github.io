document.onreadystatechange = function () {
    if (document.readyState !== 'complete') {
        document.querySelector(
            'body').style.visibility = 'hidden'; //body hidden while site loads
        document.querySelector(
            '#loading-screen').style.visibility = 'visible'; //loading-screen visible while site loading/not ready
    } else {
        setTimeout(() => {
            document.querySelector('#loading-screen').style.display = 'none'; // Hide the loading screen
            document.querySelector('body').style.visibility = 'visible'; // Show the body
        }, 2000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
  // Initially hide all sections
  document.querySelectorAll('.tabsection').forEach(section => {
      section.classList.remove('active'); // Ensure all sections are hidden initially
  });

  // Add click event listeners to each tab
  document.querySelectorAll('.tab').forEach(item => {
      item.addEventListener('click', function(e) {
          e.preventDefault(); // Prevent default anchor click behavior

          // Get the section ID and info text from the clicked tab
          const sectionId = this.getAttribute('data-section');
          const infoText = this.getAttribute('data-text');
          const targetSection = document.getElementById(sectionId);
          const infoSpan = document.getElementById('searchtitle');

          // Hide all sections
          document.querySelectorAll('.tabsection').forEach(section => {
              section.classList.remove('active'); // Hide all sections
          });
          // Reset all tabs
          document.querySelectorAll('.tab').forEach(tab => {
              tab.classList.remove('active-tab'); // Remove the active class from all tabs
          });

          // Show the clicked section
          if (targetSection) {
              targetSection.classList.add('active'); // Show the targeted section
              this.classList.add('active-tab'); // Set the clicked tab as active
              infoSpan.textContent = infoText || ""; // Update the info span with text
          } else {
              console.error(`No section found with id ${sectionId}`);
          }
      });
  });

  // Trigger a click event on the 'home' tab to select it by default
  const homeTab = document.querySelector('.tab[data-section="home"]');
  if (homeTab) {
      homeTab.click();
  }
});

