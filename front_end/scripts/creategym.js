// Create Gym - JavaScript for form with animations
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements & UI Variables
  const form = document.getElementById("gymForm");
  const submitButton = document.querySelector(".submit-btn");
  const messageBox = document.getElementById("messagebox");

  // UI Setup & Event Listeners
  initFormUI();

  function initFormUI() {
    // Add form submit handler
    form.addEventListener("submit", handleFormSubmit);

    // Add input animations
    const inputs = document.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("focus", () =>
        input.parentElement.classList.add("focused")
      );
      input.addEventListener("blur", () =>
        input.parentElement.classList.remove("focused")
      );
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("click", createRipple);
    });
  }

  // UI Animations & Visual Effects
  function createRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    // Create a new ripple element
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    // Set size and position
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    // Remove existing ripple to prevent stacking and button growth
    const ripple = button.querySelector(".ripple");
    if (ripple) {
      ripple.remove();
    }

    // Add new ripple and remove it after animation completes
    button.appendChild(circle);
    setTimeout(() => {
      if (circle && circle.parentNode === button) {
        circle.remove();
      }
    }, 600);
  }

  // Show message box
  function showMessage(type, text) {
    messageBox.className = "message-container " + type;
    messageBox.textContent = text;
    messageBox.style.display = "block";
    messageBox.scrollIntoView({ behavior: "smooth" });
  }

  // Add shake animation for validation errors
  document.styleSheets[0].insertRule(
    `@keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }`,
    document.styleSheets[0].cssRules.length
  );

  // Form Validation
  function validateForm() {
    let isValid = true;
    const formElement = document.getElementById("gymRegistrationForm");

    // Get all required inputs
    const requiredInputs = formElement.querySelectorAll("input[required]");

    requiredInputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
        showInputError(input);
      } else {
        hideInputError(input);

        // Field-specific validations
        if (input.id === "email" && !isValidEmail(input.value)) {
          isValid = false;
          showInputError(input, "Please enter a valid email address");
        }

        if (input.id === "phone" && !isValidPhone(input.value)) {
          isValid = false;
          showInputError(input, "Please enter a valid phone number");
        }

        if (
          input.id === "pricePerMonth" &&
          (input.value <= 0 || isNaN(input.value))
        ) {
          isValid = false;
          showInputError(input, "Please enter a valid price");
        }
      }
    });

    if (!isValid) {
      // Shake the form gently to indicate validation error
      formElement.classList.add("shake");
      setTimeout(() => formElement.classList.remove("shake"), 500);
    }

    return isValid;
  }

  // Show input error
  function showInputError(input, message = "This field is required") {
    // Remove existing error message if any
    hideInputError(input);

    // Create and add error message
    const errorMessage = document.createElement("div");
    errorMessage.className = "input-error";
    errorMessage.textContent = message;
    errorMessage.style.color = "var(--error)";
    errorMessage.style.fontSize = "12px";
    errorMessage.style.marginTop = "5px";
    errorMessage.style.animation = "fadeIn 0.3s forwards";

    // Add error class to input
    input.classList.add("error");
    input.style.borderColor = "var(--error)";
    input.parentElement.style.animation = "shake 0.3s forwards";

    // Append error message after input's parent
    input.parentElement.parentNode.appendChild(errorMessage);
  }

  // Hide input error
  function hideInputError(input) {
    // Reset input style
    input.classList.remove("error");
    input.style.borderColor = "";

    // Remove error message if exists
    const errorMessage =
      input.parentElement.parentNode.querySelector(".input-error");
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  // Validation helper functions
  function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  function isValidPhone(phone) {
    // Basic phone validation - can be customized for specific formats
    const pattern = /^[0-9()+\-\s]{8,20}$/;
    return pattern.test(phone);
  }

  // Data Handling & API Interaction
  function handleFormSubmit(event) {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Show loading state
    toggleSubmitButtonLoading(true);

    // Collect form data
    const formData = collectFormData();

    // Send data to server
    registerGym(formData);
  }

  // Toggle loading state for submit button
  function toggleSubmitButtonLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.innerHTML = isLoading
      ? '<i class="fas fa-spinner fa-spin"></i> Registering...'
      : 'Register Gym <i class="fas fa-check"></i>';
  }

  // Collect form data
  function collectFormData() {
    const formData = new FormData(form);
    const gymData = {};

    formData.forEach((value, key) => {
      gymData[key] = value;
    });

    return gymData;
  }

  // Register gym with API
  function registerGym(gymData) {
    fetch("http://localhost:5000/gym/creategym", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gymData),
      credentials: "include",
    })
      .then(handleApiResponse)
      .then(handleSuccessfulRegistration)
      .catch(handleRegistrationError);
  }

  // Handle API response
  function handleApiResponse(response) {

    if (!response.ok) {
      throw new Error("Network response was not ok");

    }
    return response.json();
  }

  // Handle successful registration
  function handleSuccessfulRegistration(data) {
    showMessage(
      "success",
      "Your gym has been registered successfully! Redirecting to dashboard..."
    );

    // Redirect to dashboard after a delay
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  }

  // Handle registration error
  function handleRegistrationError(error) {
    console.error("Error:", error);
    showMessage(
      "error",
      "There was an error registering your gym. Please try again."
    );

    // Reset button state
    toggleSubmitButtonLoading(false);
  }
});
