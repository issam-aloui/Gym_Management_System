import {
  addOrUpdateEvent,
  deleteEventFromIndexedDB,
  loadEventsByGymId,
  loadAllEventsFromIndexedDB,
  clearAllEventsInIndexedDB
} from "./attendanceDB.js";

let calendar;

const eventTypeColorMap = {
  class: "#10b981",
  personal: "#3b82f6",
  group: "#f59e0b",
  competition: "#ef4444",
  special: "#8b5cf6",
  other: "#6b7280",
};

document.addEventListener("DOMContentLoaded", () => {
  const gymSelect = document.querySelector("#gymSelect");
  const form = document.querySelector("#eventForm");
  const modal = document.querySelector("#eventModal");
  const deleteButton = document.querySelector("#deleteEventBtn");
  const cancelButton = document.querySelector("#cancelBtn");
  const addButton = document.querySelector("#addEventBtn");
  const clearButton = document.querySelector("#clearEventsBtn");
  const exportButton = document.querySelector("#exportBtn");
  const importButton = document.querySelector("#importBtn");
  const importFile = document.querySelector("#importFile");

  calendar = new FullCalendar.Calendar(document.querySelector("#calendar"), {
    initialView: "dayGridMonth",
    selectable: true,
    editable: true,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: ""
    },
    eventClick: onEventClick,
    dateClick: onDateClick,
    eventDrop: onEventChange,
    eventResize: onEventChange,
    eventDidMount: function(info) {
      const selectedGymId = gymSelect.value;
      const eventGymId = info.event.extendedProps?.gymId;
      info.el.style.display = selectedGymId && eventGymId !== selectedGymId ? "none" : "";
    },
  });

  calendar.render();

  gymSelect.addEventListener("change", refreshEvents);
  addButton.addEventListener("click", () => openModal());
  cancelButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  deleteButton.addEventListener("click", async () => {
    const id = form.dataset.eventId;
    if (id && confirm("Delete this event?")) {
      await deleteEventFromIndexedDB(id);
      await refreshEvents();
      closeModal();
    }
  });
  clearButton.addEventListener("click", async () => {
    if (confirm("Clear all events? This action cannot be undone.")) {
      await clearAllEventsInIndexedDB();
      await refreshEvents();
    }
  });

  exportButton.addEventListener("click", async () => {
    const allEvents = await loadAllEventsFromIndexedDB();
    const eventsToExport = allEvents.map(e => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      backgroundColor: e.backgroundColor,
      extendedProps: e.extendedProps,
    }));

    const blob = new Blob([JSON.stringify(eventsToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gymfit-pro-calendar-events.json";
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    alert("Events exported successfully!");
  });

  importButton.addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", async (event) => {
      try {
        const importedEvents = JSON.parse(event.target.result);

        if (!Array.isArray(importedEvents)) {
          alert("Invalid JSON file: Expected an array of events.");
          return;
        }

        if (confirm("Do you want to REPLACE all existing events with imported events? (Cancel to MERGE)")) {
          await clearAllEventsInIndexedDB();
        }

        for (const eventData of importedEvents) {
          const id = eventData.id || `imported-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          await addOrUpdateEvent({
            id: id,
            title: eventData.title,
            start: eventData.start,
            end: eventData.end || null,
            backgroundColor: eventData.backgroundColor || eventTypeColorMap[eventData.extendedProps?.type] || "#6b7280",
            extendedProps: eventData.extendedProps || {},
          });
        }
        alert(`Successfully imported ${importedEvents.length} events!`);
        await refreshEvents();
      } catch (error) {
        console.error("Error importing calendar:", error);
        alert("Failed to import calendar. Please ensure the file is a valid JSON event export.");
      } finally {
        e.target.value = "";
      }
    });
    reader.readAsText(file);
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const gymId = gymSelect.value;
    if (!gymId) {
      alert("Please select a gym in the filter dropdown first to assign this event to it!");
      return;
    }

    const id = form.dataset.eventId || `fc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const selectedColor = document.querySelector(".color-option.selected")?.dataset.color || eventTypeColorMap[form.eventType.value] || "#6b7280";

    const data = {
      id,
      title: form.eventTitle.value,
      start: form.eventStart.value,
      end: form.eventEnd.value,
      backgroundColor: selectedColor,
      extendedProps: {
        type: form.eventType.value,
        description: form.eventDescription.value,
        instructor: form.eventInstructor.value,
        capacity: Number.parseInt(form.eventCapacity.value) || null,
        price: Number.parseFloat(form.eventPrice.value) || null,
        gymId
      }
    };

    await addOrUpdateEvent(data);
    await refreshEvents();
    closeModal();
  });

  for (const opt of document.querySelectorAll(".color-option")) {
    opt.addEventListener("click", () => {
      for (const o of document.querySelectorAll(".color-option")) o.classList.remove("selected");
      opt.classList.add("selected");
    });
  }

  refreshEvents();
});

async function refreshEvents() {
  try {
    calendar.removeAllEvents();

    const gymId = document.querySelector("#gymSelect").value;
    let eventsToDisplay = [];

    eventsToDisplay = await (gymId === "" ? loadAllEventsFromIndexedDB() : loadEventsByGymId(gymId));

    for (const e of eventsToDisplay) {
      calendar.addEvent(e);
    }

    updateStats(eventsToDisplay);
    // ← No more calendar.rerenderEvents()
  } catch (error) {
    console.error("Failed to refresh events:", error);
  }
}


function updateStats(events) {
  document.querySelector("#totalEvents").textContent = events.length;

  const now = new Date();
  const oneWeekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate >= now && eventDate <= oneWeekAhead;
  }).length;
  document.querySelector("#thisWeekEvents").textContent = thisWeekEvents;

  loadAllEventsFromIndexedDB().then(allEvents => {
    const gymIds = new Set(allEvents.map(e => e.extendedProps?.gymId).filter(Boolean));
    document.querySelector("#totalGyms").textContent = gymIds.size;
  }).catch(error => {
    document.querySelector("#totalGyms").textContent = "Error";
  });
}

function onEventClick(info) {
  openModal(info.event);
}

function onDateClick(info) {
  openModal(null, info.dateStr);
}

async function onEventChange(info) {
  const e = info.event;
  const updated = {
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    end: e.end ? e.end.toISOString() : null,
    backgroundColor: e.backgroundColor,
    extendedProps: e.extendedProps
  };
  await addOrUpdateEvent(updated);
  await refreshEvents();
}

function openModal(event = null, dateString = "") {
  const form = document.querySelector("#eventForm");
  form.reset();
  form.dataset.eventId = "";
  for (const c of document.querySelectorAll(".color-option")) c.classList.remove("selected");

  if (event) {
    form.dataset.eventId = event.id;
    form.eventTitle.value = event.title;
    form.eventStart.value = event.startStr.slice(0, 16);
    form.eventEnd.value = event.endStr ? event.endStr.slice(0, 16) : "";
    form.eventType.value = event.extendedProps.type || "";
    form.eventDescription.value = event.extendedProps.description || "";
    form.eventInstructor.value = event.extendedProps.instructor || "";
    form.eventCapacity.value = event.extendedProps.capacity || "";
    form.eventPrice.value = event.extendedProps.price || "";

    const eventColor = event.backgroundColor || eventTypeColorMap[event.extendedProps.type] || "#6b7280";
    const selectedColorOption = document.querySelector(`.color-option[data-color="${eventColor}"]`);
    if (selectedColorOption) {
      selectedColorOption.classList.add("selected");
    } else {
      document.querySelector(".color-option[data-color=\"#3b82f6\"]").classList.add("selected");
    }

    document.querySelector("#modalTitle").textContent = "Edit Event";
    document.querySelector("#deleteEventBtn").style.display = "inline-block";
  } else {
    form.eventStart.value = dateString ? dateString + "T09:00" : "";
    form.eventEnd.value = dateString ? dateString + "T10:00" : "";
    form.eventType.value = "class";
    document.querySelector(".color-option[data-color=\"#3b82f6\"]").classList.add("selected");
    document.querySelector("#modalTitle").textContent = "Add New Event";
    document.querySelector("#deleteEventBtn").style.display = "none";
  }

  document.querySelector("#eventModal").style.display = "flex";
}

function closeModal() {
  document.querySelector("#eventModal").style.display = "none";
}