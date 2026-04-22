import admin from "firebase-admin";
import fs from "fs";

// Initialize Firebase Admin (connects to Emulator if FIRESTORE_EMULATOR_HOST is set)
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
admin.initializeApp({ projectId: "fixithub-2026-prod" });
const db = admin.firestore();

// We will read the mockData.js out of the frontend repo using basic regex or importing it directly.
// Since mockData.js uses ES6 export syntax and we are in an ES module, we can try to import it if paths resolve.
// Given node's strictness with extensions, we might just parse the data if needed. 
// However, since we are in `type: module`, we can try importing directly.
import { mockComplaints, mockCitizens, mockWorkerAccounts } from "../frontend-client/src/data/mockData.js";

async function seed() {
  console.log("Seeding Firestore Emulators...");

  // Seed Users (Citizens & Workers)
  const usersCollection = db.collection('users');
  for (const c of mockCitizens) {
    await usersCollection.doc(c.id).set({ ...c, role: 'citizen' });
  }
  for (const w of mockWorkerAccounts) {
    await usersCollection.doc(w.id).set({ ...w, role: 'worker' });
  }
  console.log("Seeded Users");

  // Seed Complaints
  const complaintsCollection = db.collection('complaints');
  for (const cp of mockComplaints) {
    // Make sure we have the id correctly extracted
    const cpData = { ...cp };
    delete cpData.id; 
    await complaintsCollection.doc(cp.id).set(cpData);
  }
  console.log("Seeded Complaints");

  console.log("Seeding complete. You can view the data in the Firebase Emulator UI.");
}

seed().catch(console.error);
