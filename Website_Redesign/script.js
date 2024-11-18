document.addEventListener('DOMContentLoaded', () => {
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
});
