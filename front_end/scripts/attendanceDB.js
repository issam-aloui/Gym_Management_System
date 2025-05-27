const DB_NAME = "GymAttendanceDB";
const DB_VERSION = 1;
const STORE_NAME = "events"; // Renamed from "attendance" to "events" for clarity

// Open or create the IndexedDB database, returns a Promise with the db instance
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // We set keyPath to 'id' assuming FullCalendar events will have an 'id'
        // autoIncrement is removed because we expect an 'id' from FullCalendar
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error("IndexedDB Error:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Adds a new event to IndexedDB.
 * @param {object} 
 */
async function addEventToIndexedDB(eventData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(eventData); // Use add for new records

    request.onsuccess = () => resolve();
    request.onerror = (e) => {
      console.error("Error adding event:", e.target.error);
      reject(e.target.error);
    };
  });
}

/**
 * Updates an existing event in IndexedDB.
 * @param {object} eventData - The event object with updated data. Must include the existing 'id'.
 */
async function updateEventInIndexedDB(eventData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(eventData); // Use put for updating existing records (or adding if ID doesn't exist)

    request.onsuccess = () => resolve();
    request.onerror = (e) => {
      console.error("Error updating event:", e.target.error);
      reject(e.target.error);
    };
  });
}

/**
 * Deletes an event from IndexedDB by its ID.
 * @param {string} eventId - The ID of the event to delete.
 */
async function deleteEventFromIndexedDB(eventId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(eventId);

    request.onsuccess = () => resolve();
    request.onerror = (e) => {
      console.error("Error deleting event:", e.target.error);
      reject(e.target.error);
    };
  });
}

/**
 * Loads all events from IndexedDB.
 * @returns {Promise<Array>} A promise that resolves with an array of event objects.
 */
async function loadAllEventsFromIndexedDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (e) => {
      console.error("Error loading events:", e.target.error);
      reject(e.target.error);
    };
  });
}

/**
 * Clears all events from IndexedDB.
 */
async function clearAllEventsInIndexedDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = (e) => {
      console.error("Error clearing all events:", e.target.error);
      reject(e.target.error);
    };
  });
}

// Export functions as ES modules
export {
  addEventToIndexedDB,
  updateEventInIndexedDB,
  deleteEventFromIndexedDB,
  loadAllEventsFromIndexedDB,
  clearAllEventsInIndexedDB
};