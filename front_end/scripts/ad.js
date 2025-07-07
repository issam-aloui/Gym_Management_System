// Add scroll effect to header

window.addEventListener("scroll", function () {
  const header = document.querySelector("#main-header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Mobile menu toggle
const mobileMenuButton = document.querySelector("#mobile-menu-toggle");
const mainMenu = document.querySelector("#main-menu");
const headerButtons = document.querySelector("#header-buttons");

mobileMenuButton.addEventListener("click", function () {
  mainMenu.classList.toggle("active");
  headerButtons.classList.toggle("active");

  // Change icon based on menu state
  const icon = mobileMenuButton.querySelector("i");
  if (mainMenu.classList.contains("active")) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times");
  } else {
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
});

// Reveal animations on scroll
function revealOnScroll() {
  const aboutSection = document.querySelector("#about-section");
  const aboutSection2 = document.querySelector("#about-section2");
  const position = aboutSection.getBoundingClientRect().top;
  const position2 = aboutSection2.getBoundingClientRect().top;
  const screenPosition = window.innerHeight / 1.3;

  if (position < screenPosition) {
    aboutSection.classList.add("visible");
  }

  if (position2 < screenPosition) {
    aboutSection2.classList.add("visible");
  }
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);
document.addEventListener("DOMContentLoaded", function () {
  // Get slider elements
  const track = document.querySelector(".testimonial-track");
  const slides = document.querySelectorAll(".testimonial-slide");
  const dots = document.querySelectorAll(".testimonial-dot");
  const previousButton = document.querySelector(".testimonial-arrow.prev");
  const nextButton = document.querySelector(".testimonial-arrow.next");

  // Set initial slide index
  let currentIndex = 0;
  const slideCount = slides.length;

  // Auto slide interval (in milliseconds)
  const autoSlideInterval = 5000;
  let autoSlideTimer;

  // Function to update slide position
  function updateSlidePosition() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update active dot
    for (const dot of dots) dot.classList.remove("active");
    dots[currentIndex].classList.add("active");
  }

  // Function to go to next slide
  function nextSlide() {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlidePosition();
  }

  // Function to go to previous slide
  function previousSlide() {
    currentIndex = (currentIndex - 1 + slideCount) % slideCount;
    updateSlidePosition();
  }

  // Function to go to specific slide
  function goToSlide(index) {
    currentIndex = index;
    updateSlidePosition();
    resetAutoSlide();
  }

  // Function to reset auto slide timer
  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(nextSlide, autoSlideInterval);
  }

  // Set up click events for dots
  for (const [index, dot] of dots.entries()) {
    dot.addEventListener("click", () => {
      goToSlide(index);
    });
  }

  // Set up click events for arrows
  previousButton.addEventListener("click", () => {
    previousSlide();
    resetAutoSlide();
  });

  nextButton.addEventListener("click", () => {
    nextSlide();
    resetAutoSlide();
  });

  // Initialize auto slide
  resetAutoSlide();

  // Pause auto slide on hover
  track.addEventListener("mouseenter", () => {
    clearInterval(autoSlideTimer);
  });

  track.addEventListener("mouseleave", () => {
    resetAutoSlide();
  });

  // Update positions on window resize
  window.addEventListener("resize", updateSlidePosition);
});

// Add smooth scrolling to sections
for (const anchor of document.querySelectorAll("a[href^=\"#\"]")) {
  anchor.addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
}
