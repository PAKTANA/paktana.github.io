window.HeroSlider = {
    currentSlide: 0,
    slideInterval: null,
    init() {
        this.resetSlideInterval();
    },
    showSlide(n) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        if (slides.length === 0) return;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        this.currentSlide = (n + slides.length) % slides.length;
        if (slides[this.currentSlide]) slides[this.currentSlide].classList.add('active');
        if (dots[this.currentSlide]) dots[this.currentSlide].classList.add('active');
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
