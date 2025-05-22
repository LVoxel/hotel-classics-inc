window.fadeInScaleObserver = window.fadeInScaleObserver || new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-scale--visible');
            window.fadeInScaleObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

window.observeFadeInScale = function () {
    document.querySelectorAll('.fade-in-scale:not(.fade-in-scale--visible)').forEach(el => {
        window.fadeInScaleObserver.observe(el);
    });
};
window.observeFadeInScale();