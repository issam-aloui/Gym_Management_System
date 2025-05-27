const DB_NAME = "GymAttendanceDB";
const DB_VERSION = 2;
const STORE_NAME = "events";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      let store;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      } else {
        store = e.target.transaction.objectStore(STORE_NAME);
      }

      if (!store.indexNames.contains("gymId")) {
        store.createIndex("gymId", "extendedProps.gymId", { unique: false });
      }
    };

    req.onsuccess = (e) => {
      resolve(e.target.result);
    };
    req.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

async function addOrUpdateEvent(eventData) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const request = tx.objectStore(STORE_NAME).put(eventData);
    request.onsuccess = () => {};
    tx.oncomplete = () => res();
    tx.onerror = (e) => rej(e.target.error);
  });
}

async function deleteEventFromIndexedDB(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const request = tx.objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => {};
    tx.oncomplete = () => res();
    tx.onerror = (e) => rej(e.target.error);
  });
}

async function loadEventsByGymId(gymId) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, "readonly");
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
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, "readonly");
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
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
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
