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
  const gymSelect = document.getElementById("gymSelect");
  const form = document.getElementById("eventForm");
  const modal = document.getElementById("eventModal");
  const deleteBtn = document.getElementById("deleteEventBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const addBtn = document.getElementById("addEventBtn");
  const clearBtn = document.getElementById("clearEventsBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");

  calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
    initialView: "dayGridMonth",
    selectable: true,
    editable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    eventClick: onEventClick,
    dateClick: onDateClick,
    eventDrop: onEventChange,
    eventResize: onEventChange,
    eventDidMount: function(info) {
      const selectedGymId = gymSelect.value;
      const eventGymId = info.event.extendedProps?.gymId;
      if (selectedGymId && eventGymId !== selectedGymId) {
        info.el.style.display = 'none';
      } else {
        info.el.style.display = '';
      }
    },
  });

  calendar.render();

  gymSelect.addEventListener("change", refreshEvents);
  addBtn.addEventListener("click", () => openModal());
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  deleteBtn.addEventListener("click", async () => {
    const id = form.dataset.eventId;
    if (id && confirm("Delete this event?")) {
      await deleteEventFromIndexedDB(id);
      await refreshEvents();
      closeModal();
    }
  });
  clearBtn.addEventListener("click", async () => {
    if (confirm("Clear all events? This action cannot be undone.")) {
      await clearAllEventsInIndexedDB();
      await refreshEvents();
    }
  });

  exportBtn.addEventListener('click', async () => {
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Events exported successfully!');
  });

  importBtn.addEventListener('click', () => {
    importFile.click();
  });

  importFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
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
          const id = eventData.id || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const gymId = gymSelect.value;
    if (!gymId) {
      alert("Please select a gym in the filter dropdown first to assign this event to it!");
      return;
    }

    const id = form.dataset.eventId || `fc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
        capacity: parseInt(form.eventCapacity.value) || null,
        price: parseFloat(form.eventPrice.value) || null,
        gymId
      }
    };

    await addOrUpdateEvent(data);
    await refreshEvents();
    closeModal();
  });

  document.querySelectorAll(".color-option").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".color-option").forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
    });
  });

  refreshEvents();
});

async function refreshEvents() {
  try {
    calendar.removeAllEvents();

    const gymId = document.getElementById("gymSelect").value;
    let eventsToDisplay = [];

    if (gymId === "") {
      eventsToDisplay = await loadAllEventsFromIndexedDB();
    } else {
      eventsToDisplay = await loadEventsByGymId(gymId);
    }

    eventsToDisplay.forEach(e => {
      calendar.addEvent(e);
    });

    updateStats(eventsToDisplay);
    // ← No more calendar.rerenderEvents()
  } catch (err) {
    console.error("Failed to refresh events:", err);
  }
}


function updateStats(events) {
  document.getElementById("totalEvents").textContent = events.length;

  const now = new Date();
  const oneWeekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate >= now && eventDate <= oneWeekAhead;
  }).length;
  document.getElementById("thisWeekEvents").textContent = thisWeekEvents;

  loadAllEventsFromIndexedDB().then(allEvents => {
    const gymIds = new Set(allEvents.map(e => e.extendedProps?.gymId).filter(id => id));
    document.getElementById("totalGyms").textContent = gymIds.size;
  }).catch(error => {
    document.getElementById("totalGyms").textContent = "Error";
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

function openModal(event = null, dateStr = "") {
  const form = document.getElementById("eventForm");
  form.reset();
  form.dataset.eventId = "";
  document.querySelectorAll(".color-option").forEach(c => c.classList.remove("selected"));

  if (event) {
    form.dataset.eventId = event.id;
    form.eventTitle.value = event.title;
    form.eventStart.value = event.startStr.slice(0, 16);
    form.eventEnd.value = event.endStr ? event.endStr.slice(0, 16) : '';
    form.eventType.value = event.extendedProps.type || '';
    form.eventDescription.value = event.extendedProps.description || "";
    form.eventInstructor.value = event.extendedProps.instructor || "";
    form.eventCapacity.value = event.extendedProps.capacity || "";
    form.eventPrice.value = event.extendedProps.price || "";

    const eventColor = event.backgroundColor || eventTypeColorMap[event.extendedProps.type] || "#6b7280";
    const selectedColorOption = document.querySelector(`.color-option[data-color="${eventColor}"]`);
    if (selectedColorOption) {
      selectedColorOption.classList.add("selected");
    } else {
      document.querySelector('.color-option[data-color="#3b82f6"]').classList.add("selected");
    }

    document.getElementById("modalTitle").textContent = "Edit Event";
    document.getElementById("deleteEventBtn").style.display = "inline-block";
  } else {
    form.eventStart.value = dateStr ? dateStr + "T09:00" : "";
    form.eventEnd.value = dateStr ? dateStr + "T10:00" : "";
    form.eventType.value = "class";
    document.querySelector('.color-option[data-color="#3b82f6"]').classList.add("selected");
    document.getElementById("modalTitle").textContent = "Add New Event";
    document.getElementById("deleteEventBtn").style.display = "none";
  }

  document.getElementById("eventModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("eventModal").style.display = "none";
}