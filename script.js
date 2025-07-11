// Menu hamburguer (mobile)
const toggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    toggle.classList.toggle("opened");
});


document.addEventListener("click", (event) => {
    if (
        !nav.contains(event.target) &&
        !toggle.contains(event.target) &&
        nav.classList.contains("active")
    ) {
        nav.classList.remove("active");
        toggle.classList.remove("opened");
    }
});


//Banners
// let currentIndex = 0;
// const slides = document.querySelectorAll(".carousel-slide");
// const dots = document.querySelectorAll(".dot");

// function showSlide(index) {
//     const inner = document.querySelector(".carousel-inner");
//     inner.style.transform = `translateX(-${index * 100}vw)`;

//     dots.forEach(dot => dot.classList.remove("active"));
//     dots[index].classList.add("active");
// }

// function nextSlide() {
//     currentIndex = (currentIndex + 1) % slides.length;
//     showSlide(currentIndex);
// }

// dots.forEach((dot, i) =>
//     dot.addEventListener("click", () => {
//         currentIndex = i;
//         showSlide(currentIndex);
//     })
// );

// setInterval(nextSlide, 5000);


//Header aparecendo a depender da posicao do scroll
const header = document.querySelector("header");
window.addEventListener('scroll', () => {
    // A navbar aparece depois de rolar metade da altura da viewport
    if (window.scrollY > window.innerHeight * 1.4) {
        header.classList.add('visible');
    } else {
        header.classList.remove('visible');
    }
});


//Alternando video pra mobile ou desktop
const videoElement = document.getElementById("intro-video");
const sourceElement = videoElement.querySelector("source");
function setVideoSource() {
    const isMobile = window.innerWidth <= 768;
    const src = isMobile
        ? "assets/video/mobile/institucionalmobile.mp4"
        : "assets/video/desktop/institucional.mp4";

    if (sourceElement.src !== location.origin + "/" + src) {
        sourceElement.src = src;
        videoElement.load();
    }
}
setVideoSource();
window.addEventListener("resize", setVideoSource);


//Logo desaparecendo nos scrolls iniciais antes de carregar o site
const welcomeTextOverlay = document.getElementById("welcomeTextOverlay");
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const viewportHeight = window.innerHeight;

    const startFadeScroll = viewportHeight * 0.1;
    const endFadeScroll = viewportHeight * 1;

    let opacity = 1;

    if (scrollPosition < startFadeScroll) {
        opacity = 1;
    } else if (scrollPosition > endFadeScroll) {
        opacity = 0;
    } else {
        opacity = 1 - ((scrollPosition - startFadeScroll) / (endFadeScroll - startFadeScroll));
    }

    welcomeTextOverlay.style.opacity = Math.max(0, opacity);

    if (opacity <= 0) {
        welcomeTextOverlay.classList.add('hidden');
    } else {
        welcomeTextOverlay.classList.remove('hidden');
    }
});


//Banners
let currentIndex = 0;
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");
const carouselInner = document.querySelector(".carousel-inner");

let autoSlideInterval;
const defaultSlideDuration = 5000;
const userInteractionSlideDuration = 10000;

let touchStartX = 0;
let touchEndX = 0;



function showSlide(index) {
    if (index < 0) {
        currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
        currentIndex = 0;
    } else {
        currentIndex = index;
    }

    carouselInner.style.transform = `translateX(-${currentIndex * 100}vw)`;

    dots.forEach(dot => dot.classList.remove("active"));
    dots[currentIndex].classList.add("active");
}

function nextSlide() {
    showSlide(currentIndex + 1);
    resetAutoSlide(defaultSlideDuration);
}

function prevSlide() {
    showSlide(currentIndex - 1);
    resetAutoSlide(defaultSlideDuration);
}




function startAutoSlide(duration) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, duration);
}

function resetAutoSlide(duration) {
    startAutoSlide(duration);
}



dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
        showSlide(i);
        resetAutoSlide(userInteractionSlideDuration);
    })
);

carouselInner.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
});

carouselInner.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50; // min swipe distance

    if (touchEndX < touchStartX - swipeThreshold) {
        nextSlide();
        resetAutoSlide(userInteractionSlideDuration);
    } else if (touchEndX > touchStartX + swipeThreshold) {
        prevSlide();
        resetAutoSlide(userInteractionSlideDuration);
    }
}

showSlide(currentIndex);
startAutoSlide(defaultSlideDuration);