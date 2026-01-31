window.HeroSlider = {
    currentSlide: 0,
    slideInterval: null,
    touchStartX: 0,
    touchEndX: 0,

    init() {
        this.resetSlideInterval();
        this.setupTouchListeners();
    },

    setupTouchListeners() {
        const slider = document.querySelector('.hero-slider');
        if (!slider) return;

        slider.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        slider.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    },

    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    },

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipeGesture();
    },

    handleSwipeGesture() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        if (this.touchEndX < this.touchStartX - swipeThreshold) {
            this.changeSlide(1); // Swipe Left -> Next Slide
        }
        if (this.touchEndX > this.touchStartX + swipeThreshold) {
            this.changeSlide(-1); // Swipe Right -> Prev Slide
        }
    },

    showSlide(n) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        const track = document.getElementById('sliderTrack');

        if (slides.length === 0 || !track) return;

        // Reset dots active state
        dots.forEach(d => d.classList.remove('active'));

        // Calculate index
        this.currentSlide = (n + slides.length) % slides.length;

        // Update dots active state
        if (dots[this.currentSlide]) dots[this.currentSlide].classList.add('active');

        // Apply Sliding Effect
        track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    },

    changeSlide(direction) {
        this.showSlide(this.currentSlide + direction);
        this.resetSlideInterval();
    },

    goToSlide(n) {
        this.showSlide(n);
        this.resetSlideInterval();
    },

    resetSlideInterval() {
        clearInterval(this.slideInterval);
        this.slideInterval = setInterval(() => this.changeSlide(1), 5000);
    }
};

window.changeSlide = (dir) => window.HeroSlider.changeSlide(dir);
window.goToSlide = (n) => window.HeroSlider.goToSlide(n);
