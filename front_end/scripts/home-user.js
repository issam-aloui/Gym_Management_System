document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".slider");
  const slides = document.querySelectorAll(".slide");
  const slide_track = document.querySelector(".slide-track");
  const dots = document.querySelectorAll(".dot");
  const numberOfSlides = slides.length;
  let currentSlide = 0;
  let isSliderHovered = false;
  let autoSlideTimeout;

  // Dynamic scaling function
  function updateSliderScale() {
    if (slider) {
      const sliderHeight = slider.offsetHeight;
      const baseHeight = window.innerHeight * 0.4; // 40vh baseline
      const scaleFactor = sliderHeight / baseHeight;

      // Update CSS custom properties for dynamic scaling
      slider.style.setProperty("--actual-height", `${sliderHeight}px`);
      slider.style.setProperty("--scale-factor", scaleFactor);
      slider.style.setProperty(
        "--dynamic-vmin",
        `${Math.min(window.innerWidth, window.innerHeight) * 0.01}px`
      );
    }
  }

  // Initialize scaling
  updateSliderScale();

  // Update scaling on window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSliderScale, 150);
  });

  // Observer for slider height changes
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === slider) {
          updateSliderScale();
        }
      }
    });
    resizeObserver.observe(slider);
  }

  // Set the width of the slider track based on the number of slides
  slide_track.style.width = `${numberOfSlides * 100}vw`;

  // Initialize the dots
  updateDots(currentSlide);

  // Add click event listeners to dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      // Only take action if this isn't already the active slide
      if (currentSlide !== index) {
        moveToSlide(index);
        currentSlide = index;
        resetAutoSlide();
      }
    });
  });

  function updateDots(slideIndex) {
    // First reset all dots to default style
    dots.forEach((dot) => {
      dot.classList.remove("active");
      dot.style.backgroundColor = "rgba(255, 255, 255, 0.5)"; // Reset to default color
    });

    // Then set the active dot
    if (dots[slideIndex]) {
      dots[slideIndex].classList.add("active");
      dots[slideIndex].style.backgroundColor = "#e85d04"; // Active color
    }
  }

  function moveToSlide(slideIndex) {
    // Validate the slideIndex
    if (slideIndex < 0 || slideIndex >= numberOfSlides) {
      console.error("Invalid slide index:", slideIndex);
      return;
    }

    // Perform the slide transition
    slide_track.style.transform = `translateX(-${slideIndex * 100}vw)`;
    currentSlide = slideIndex;

    // Update the dots to match the current slide
    updateDots(currentSlide);
  }

  function nextSlide() {
    let nextSlideIndex = currentSlide + 1;
    if (nextSlideIndex >= numberOfSlides) {
      nextSlideIndex = 0;
    }
    moveToSlide(nextSlideIndex);
  }

  function prevSlide() {
    let prevSlideIndex = currentSlide - 1;
    if (prevSlideIndex < 0) {
      prevSlideIndex = numberOfSlides - 1;
    }
    moveToSlide(prevSlideIndex);
  }

  // Auto-sliding functionality
  function startAutoSlide() {
    // Clear any existing timeout to prevent multiple timers
    clearTimeout(autoSlideTimeout);

    // Only start auto slide if slider is not being hovered
    if (!isSliderHovered) {
      autoSlideTimeout = setTimeout(() => {
        nextSlide();
        startAutoSlide();
      }, 5000); // Change slide every 5 seconds
    }
  }

  function resetAutoSlide() {
    clearTimeout(autoSlideTimeout);
    startAutoSlide();
  }

  function pauseAutoSlide() {
    clearTimeout(autoSlideTimeout);
    isSliderHovered = true;
  }

  function resumeAutoSlide() {
    isSliderHovered = false;
    startAutoSlide();
  }

  // Start auto-sliding
  startAutoSlide();

  // Pause auto-slide on slider hover
  slider.addEventListener("mouseenter", pauseAutoSlide);

  // Resume auto-slide when mouse leaves the slider
  slider.addEventListener("mouseleave", resumeAutoSlide);

  // Add hover effects to slides
  slides.forEach((slide) => {
    slide.addEventListener("mouseenter", () => {
      slide.style.transform = "scale(1.01)";
      slide.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
      slide.style.transition = "all 0.3s ease";
    });

    slide.addEventListener("mouseleave", () => {
      slide.style.transform = "scale(1)";
      slide.style.boxShadow = "none";
    });
  });

  // Add hover effects to dots with proper state handling
  dots.forEach((dot, index) => {
    dot.addEventListener("mouseenter", () => {
      // Only change color if this isn't the active dot
      if (currentSlide !== index) {
        dot.style.backgroundColor = "rgba(232, 93, 4, 0.7)";
      }
    });

    dot.addEventListener("mouseleave", () => {
      // Restore appropriate color based on active state
      if (currentSlide !== index) {
        dot.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      }
    });
  });
});
// Add smooth scrolling to sections
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});
