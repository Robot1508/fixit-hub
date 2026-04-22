import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJBKL3ODddvEfF-F6E6mUAKfOZLq4tp4g",
  authDomain: "fixithub-5fe6e.firebaseapp.com",
  projectId: "fixithub-5fe6e",
  storageBucket: "fixithub-5fe6e.firebasestorage.app",
  messagingSenderId: "195418006444",
  appId: "1:195418006444:web:9963dceedc260bb5625009",
  measurementId: "G-EJJ91HJXYM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple mock data directly in the script to avoid complex ES module resolution between Node and Vite
const mockCitizens = [
  { id: 'C-01', name: 'Rajesh Patil',   email: 'rajesh@example.com',  phone: '9823401100', ward: 'Ward 3',  password: '1234' },
  { id: 'C-02', name: 'Sunita Mane',    email: 'sunita@example.com',  phone: '9823401101', ward: 'Ward 7',  password: '1234' },
  { id: 'C-03', name: 'Amol Kumbhar',   email: 'amol@example.com',    phone: '9823401102', ward: 'Ward 11', password: '1234' },
];

const mockWorkerAccounts = [
  { id: 'W-01', name: 'Dnyaneshwar Jadhav', email: 'dnyanesh@ichalkaranji.gov.in', phone: '9823501201', ward: 'Ward 3',  category: 'Infrastructure',  password: '1234' },
  { id: 'W-02', name: 'Vishwas Kamble',     email: 'vishwas@ichalkaranji.gov.in',  phone: '9823501202', ward: 'Ward 7',  category: 'Sanitation',      password: '1234' },
  { id: 'W-03', name: 'Santosh Chougule',   email: 'santosh@ichalkaranji.gov.in',  phone: '9823501203', ward: 'Ward 11', category: 'Water Supply',    password: '1234' },
];

const mockComplaints = [
  {
    id: 'CP-2001',
    title: 'Large pothole on Nehru Chowk Road',
    description: 'Deep pothole near Nehru Chowk causing accidents to two-wheelers and pedestrians.',
    category: 'Road',
    status: 'In Progress',
    priority: 'High',
    ward: 'Ward 3',
    reportedBy: 'C-01',
    reporterName: 'Rajesh Patil',
    reportedAt: '2026-02-18T08:30:00',
    assignedTo: 'W-01',
    assignedToName: 'Dnyaneshwar Jadhav',
    location: 'Nehru Chowk, Main Road, Ichalkaranji',
    isPublic: true,
    upvotes: 27,
    comments: [],
    timeline: [
      { status: 'Submitted',   time: '2026-02-18T08:30:00', note: 'Issue reported by Rajesh Patil' },
    ],
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&q=80',
    completionPhoto: null,
    resolvedAt: null,
  }
];

async function seed() {
  console.log("Seeding Live Firestore...");

  // Seed Users
  for (const c of mockCitizens) {
    await setDoc(doc(db, 'users', c.id), { ...c, role: 'citizen' });
  }
  for (const w of mockWorkerAccounts) {
    await setDoc(doc(db, 'users', w.id), { ...w, role: 'worker' });
  }
  console.log("Seeded Users");

  // Seed Complaints
  for (const cp of mockComplaints) {
    const cpData = { ...cp };
    delete cpData.id; 
    await setDoc(doc(db, 'complaints', cp.id), cpData);
  }
  console.log("Seeded Complaints");

  console.log("Seeding complete. Verification can now begin.");
  process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
