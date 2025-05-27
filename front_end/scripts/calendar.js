import {
  addEventToIndexedDB,
  updateEventInIndexedDB,
  deleteEventFromIndexedDB,
  loadAllEventsFromIndexedDB,
  clearAllEventsInIndexedDB
} from "../scripts/attendanceDB.js";

document.addEventListener("DOMContentLoaded", async () => {
  const calendarEl = document.getElementById("calendar");
  const gymSelect = document.getElementById("gymSelect");
  const importFile = document.getElementById("importFile");

  const eventModal = document.getElementById('eventModal');
  const addEventBtn = document.getElementById('addEventBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const deleteEventBtn = document.getElementById('deleteEventBtn');
  const eventForm = document.getElementById('eventForm');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const clearEventsBtn = document.getElementById('clearEventsBtn');

  // Form input elements
  const eventTitleInput = document.getElementById("eventTitle");
  const eventStartInput = document.getElementById("eventStart");
  const eventEndInput = document.getElementById("eventEnd");
  const eventTypeSelect = document.getElementById("eventType");
  const eventDescriptionInput = document.getElementById("eventDescription");
  const eventInstructorInput = document.getElementById("eventInstructor");
  const eventCapacityInput = document.getElementById("eventCapacity");
  const eventPriceInput = document.getElementById("eventPrice");


  let calendar;
  let selectedEvent = null; // Stores the FullCalendar event object when editing

  // Map for default colors based on event type (optional, can be overridden by color picker)
  const eventTypeColorMap = {
    class: "#10b981", // Green
    personal: "#3b82f6", // Blue
    group: "#f59e0b", // Orange
    competition: "#ef4444", // Red
    special: "#8b5cf6", // Purple
    other: "#6b7280", // Gray (default if no type match)
  };

  // --- Modal Control Functions ---

  /**
   * Displays the event modal.
   * @param {boolean} isEdit - True if editing an existing event, false for new.
   */
  const showEventModal = (isEdit = false) => {
    document.getElementById("modalTitle").textContent = isEdit ? "Edit Event" : "Add New Event";
    deleteEventBtn.style.display = isEdit ? "inline-block" : "none";
    eventModal.style.display = "block";
  };

  /**
   * Hides the event modal and clears form data.
   */
  const hideEventModal = () => {
    eventModal.style.display = "none";
    selectedEvent = null; // Clear selected event
    clearModalForm();
  };

  /**
   * Clears all inputs in the event modal form and resets color selection.
   */
  const clearModalForm = () => {
    eventForm.reset();
    document.querySelectorAll(".color-option").forEach(o => o.classList.remove("selected"));
    // Optionally pre-select a default color or no color
    document.querySelector('.color-option[data-color="#3b82f6"]').classList.add('selected'); // Example: select blue by default
  };

  /**
   * Populates the event modal with data from a FullCalendar event object.
   * @param {object} event - The FullCalendar event object.
   */
  const populateModal = (event) => {
    eventTitleInput.value = event.title || "";
    eventStartInput.value = event.start ? event.start.toISOString().slice(0, 16) : "";
    eventEndInput.value = event.end ? event.end.toISOString().slice(0, 16) : "";
    eventTypeSelect.value = event.extendedProps?.type || "";
    eventDescriptionInput.value = event.extendedProps?.description || "";
    eventInstructorInput.value = event.extendedProps?.instructor || "";
    eventCapacityInput.value = event.extendedProps?.capacity || "";
    eventPriceInput.value = event.extendedProps?.price || "";

    const color = event.backgroundColor || eventTypeColorMap[event.extendedProps?.type] || "#6b7280";
    document.querySelectorAll(".color-option").forEach(o => {
      o.classList.remove("selected");
      if (o.dataset.color === color) o.classList.add("selected");
    });
  };

 

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    selectable: true, // Allows selection of dates/times
    editable: true, // Allows events to be dragged and resized

    // Event when an event is clicked
    eventClick: function (info) {
      selectedEvent = info.event;
      populateModal(info.event);
      showEventModal(true); // Show modal in edit mode
    },

    // Event when a date is clicked (for adding new events)
    dateClick: function (info) {
      selectedEvent = null; // Ensure no event is selected for editing
      clearModalForm(); // Clear form
      eventStartInput.value = info.dateStr + "T09:00"; // Set default start time
      eventEndInput.value = info.dateStr + "T10:00"; // Set default end time
      showEventModal(); // Show modal in add mode
    },

    // Event when an event is dragged or resized
    eventDrop: async function (info) {
      // Update the event in IndexedDB after drag/resize
      const updatedEvent = {
        id: info.event.id, // FullCalendar's ID
        title: info.event.title,
        start: info.event.start.toISOString(),
        end: info.event.end ? info.event.end.toISOString() : null,
        backgroundColor: info.event.backgroundColor,
        extendedProps: info.event.extendedProps,
      };
      await updateEventInIndexedDB(updatedEvent);
      updateStats();
    },
    eventResize: async function (info) {
      // Update the event in IndexedDB after resize
      const updatedEvent = {
        id: info.event.id, // FullCalendar's ID
        title: info.event.title,
        start: info.event.start.toISOString(),
        end: info.event.end ? info.event.end.toISOString() : null,
        backgroundColor: info.event.backgroundColor,
        extendedProps: info.event.extendedProps,
      };
      await updateEventInIndexedDB(updatedEvent);
      updateStats();
    }
  });

  calendar.render(); // Render the calendar on the page

  // --- Load Events on Initialization ---
  const initialEvents = await loadAllEventsFromIndexedDB();
  initialEvents.forEach(e => {
    // Ensure 'id' is passed to FullCalendar for proper editing/deleting
    // FullCalendar will generate one if not present, but it's best to use the DB ID
    calendar.addEvent({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      backgroundColor: e.backgroundColor,
      extendedProps: e.extendedProps,
    });
  });
  updateStats();

  // --- Event Listeners ---

  // Close modal when clicking 'x' or 'Cancel'
  closeModalBtn.addEventListener('click', hideEventModal);
  cancelBtn.addEventListener('click', hideEventModal);

  // Close modal when clicking outside content
  window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
      hideEventModal();
    }
  });

  // Add Event button
  addEventBtn.addEventListener('click', () => {
    selectedEvent = null;
    clearModalForm();
    showEventModal();
  });

  // Form Submission (Add/Edit Event)
  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const gymId = gymSelect.value;
    if (!gymId) {
      alert("Please select a gym first!");
      return;
    }

    const selectedColor = document.querySelector(".color-option.selected")?.dataset.color || eventTypeColorMap[eventTypeSelect.value] || "#6b7280";

    const eventData = {
      title: eventTitleInput.value,
      start: eventStartInput.value,
      end: eventEndInput.value,
      backgroundColor: selectedColor,
      extendedProps: {
        type: eventTypeSelect.value,
        description: eventDescriptionInput.value,
        instructor: eventInstructorInput.value,
        capacity: parseInt(eventCapacityInput.value) || null, // Convert to number
        price: parseFloat(eventPriceInput.value) || null, // Convert to number
        gymId: gymId // Store the selected gym ID
      }
    };

    if (selectedEvent) {
      // Edit existing event
      selectedEvent.setProp("title", eventData.title);
      selectedEvent.setStart(eventData.start);
      selectedEvent.setEnd(eventData.end);
      selectedEvent.setProp("backgroundColor", eventData.backgroundColor);

      // Update all extendedProps individually
      for (const key in eventData.extendedProps) {
        selectedEvent.setExtendedProp(key, eventData.extendedProps[key]);
      }

      // Save updated event to IndexedDB
      await updateEventInIndexedDB({
        id: selectedEvent.id, // Use FullCalendar's ID for update
        title: selectedEvent.title,
        start: selectedEvent.start.toISOString(),
        end: selectedEvent.end ? selectedEvent.end.toISOString() : null,
        backgroundColor: selectedEvent.backgroundColor,
        extendedProps: selectedEvent.extendedProps,
      });

    } else {
      // Add new event
      // FullCalendar will assign an ID, we'll use that when saving to DB
      const newEvent = calendar.addEvent(eventData);

      // Save new event to IndexedDB with the ID assigned by FullCalendar
      await addEventToIndexedDB({
        id: newEvent.id, // Use the ID generated by FullCalendar
        title: newEvent.title,
        start: newEvent.start.toISOString(),
        end: newEvent.end ? newEvent.end.toISOString() : null, // handle null end date
        backgroundColor: newEvent.backgroundColor,
        extendedProps: newEvent.extendedProps,
      });
    }

    hideEventModal();
    updateStats();
  });

  // Delete Event button
  deleteEventBtn.addEventListener('click', async () => {
    if (selectedEvent && confirm(`Are you sure you want to delete "${selectedEvent.title}"?`)) {
      await deleteEventFromIndexedDB(selectedEvent.id); // Delete from DB using FullCalendar's ID
      selectedEvent.remove(); // Remove from calendar
      selectedEvent = null;
      hideEventModal();
      updateStats();
    }
  });

  // Color selection handler
  document.querySelectorAll(".color-option").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".color-option").forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
    });
  });

  // Clear All Events button
  clearEventsBtn.addEventListener('click', async () => {
    if (confirm("Are you sure you want to clear ALL events? This action cannot be undone.")) {
      calendar.getEvents().forEach(e => e.remove()); // Remove all from calendar
      await clearAllEventsInIndexedDB(); // Clear from IndexedDB
      updateStats();
    }
  });

  // Export Button
  exportBtn.addEventListener('click', () => {
    const events = calendar.getEvents().map(e => ({
      id: e.id, // Include ID for potential re-import matching
      title: e.title,
      start: e.start.toISOString(),
      end: e.end ? e.end.toISOString() : null,
      backgroundColor: e.backgroundColor,
      extendedProps: e.extendedProps,
    }));

    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gymfit-pro-calendar-events.json";
    document.body.appendChild(a); // Append for Firefox compatibility
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url); // Release the object URL
  });

  // Import Button
  importBtn.addEventListener('click', () => {
    importFile.click(); // Trigger the hidden file input click
  });

  // Handle file selection for import
  importFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedEvents = JSON.parse(e.target.result);

        if (!Array.isArray(importedEvents)) {
          alert("Invalid JSON file: Expected an array of events.");
          return;
        }

        // Clear existing events before importing new ones, or merge them
        if (confirm("Do you want to REPLACE all existing events with imported events? (Cancel to MERGE)")) {
          calendar.getEvents().forEach(event => event.remove());
          await clearAllEventsInIndexedDB();
        }

        for (const eventData of importedEvents) {
          // Add to calendar, FullCalendar will assign a new ID if 'id' is missing
          const addedEvent = calendar.addEvent({
            id: eventData.id || FullCalendar.globalLocales.length + Math.random(), // Use existing ID or generate a new one
            title: eventData.title,
            start: eventData.start,
            end: eventData.end,
            backgroundColor: eventData.backgroundColor,
            extendedProps: eventData.extendedProps,
          });

          // Save to IndexedDB with the ID used by FullCalendar
          await addEventToIndexedDB({
            id: addedEvent.id,
            title: addedEvent.title,
            start: addedEvent.start.toISOString(),
            end: addedEvent.end ? addedEvent.end.toISOString() : null,
            backgroundColor: addedEvent.backgroundColor,
            extendedProps: addedEvent.extendedProps,
          });
        }
        alert(`Successfully imported ${importedEvents.length} events!`);
        updateStats();
      } catch (error) {
        console.error("Error importing calendar:", error);
        alert("Failed to import calendar. Please ensure the file is a valid JSON event export.");
      } finally {
        // Reset file input to allow selecting the same file again if needed
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  });


  // --- Statistics Update Function ---

  /**
   * Updates the event statistics displayed on the page.
   */
  function updateStats() {
    const events = calendar.getEvents();
    document.getElementById("totalEvents").textContent = events.length;

    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    const thisWeekEvents = events.filter(e => {
      const eventStart = new Date(e.start);
      return eventStart >= now && eventStart <= oneWeekFromNow;
    });
    document.getElementById("thisWeekEvents").textContent = thisWeekEvents.length;

    const gymIds = new Set(events.map(e => e.extendedProps?.gymId).filter(id => id)); // Filter out undefined/null gymIds
    document.getElementById("totalGyms").textContent = gymIds.size;
  }
});