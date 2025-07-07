const DB_NAME = "GymAttendanceDB";
const DB_VERSION = 2;
const STORE_NAME = "events";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      let store;
      store = database.objectStoreNames.contains(STORE_NAME) ? e.target.transaction.objectStore(STORE_NAME) : database.createObjectStore(STORE_NAME, { keyPath: "id" });

      if (!store.indexNames.contains("gymId")) {
        store.createIndex("gymId", "extendedProps.gymId", { unique: false });
      }
    };

    request.onsuccess = (e) => {
      resolve(e.target.result);
    };
    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

async function addOrUpdateEvent(eventData) {
  const database = await openDB();
  return new Promise((res, rej) => {
    const tx = database.transaction(STORE_NAME, "readwrite");
    const request = tx.objectStore(STORE_NAME).put(eventData);
    request.onsuccess = () => {};
    tx.oncomplete = () => res();
    tx.onerror = (e) => rej(e.target.error);
  });
}

async function deleteEventFromIndexedDB(id) {
  const database = await openDB();
  return new Promise((res, rej) => {
    const tx = database.transaction(STORE_NAME, "readwrite");
    const request = tx.objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => {};
    tx.oncomplete = () => res();
    tx.onerror = (e) => rej(e.target.error);
  });
}

async function loadEventsByGymId(gymId) {
  const database = await openDB();
  return new Promise((res, rej) => {
    const tx = database.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("gymId");
    const events = [];

    const request = index.openCursor(IDBKeyRange.only(gymId));
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        events.push(cursor.value);
        cursor.continue();
      }
    };
    tx.oncomplete = () => res(events);
    tx.onerror = (e) => rej(e.target.error);
  });
}

async function loadAllEventsFromIndexedDB() {
  const database = await openDB();
  return new Promise((res, rej) => {
    const tx = database.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const events = [];

    const request = store.openCursor();
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        events.push(cursor.value);
        cursor.continue();
      }
    };
    tx.oncomplete = () => res(events);
    tx.onerror = (e) => rej(e.target.error);
  });
}

async function clearAllEventsInIndexedDB() {
  const database = await openDB();
  return new Promise((res, rej) => {
    const tx = database.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => {};
    tx.oncomplete = () => res();
    tx.onerror = (e) => rej(e.target.error);
  });
}

export {
  addOrUpdateEvent,
  deleteEventFromIndexedDB,
  loadEventsByGymId,
  loadAllEventsFromIndexedDB,
  clearAllEventsInIndexedDB
};
