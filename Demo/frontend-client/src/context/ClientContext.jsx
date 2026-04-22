import { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { mockCitizens, mockWorkerAccounts } from '../data/mockData';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const ClientContext = createContext();

export function ClientProvider({ children }) {
  const [user, setUser] = useState(null); // { type: 'citizen'|'worker', ...data }
  const [complaints, setComplaints] = useState([]);
  const [workerTasks, setWorkerTasks] = useState({});

  // Listen to Firestore complaints collection
  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('reportedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setComplaints(data);
      
      // Parse tasks per worker
      const tasksMap = {};
      data.forEach(c => {
        if (c.assignedTo) {
          if (!tasksMap[c.assignedTo]) tasksMap[c.assignedTo] = [];
          tasksMap[c.assignedTo].push(c);
        }
      });
      setWorkerTasks(tasksMap);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password, role) => {
    // We are keeping mock authentication for simplicity in the prototype as users were hardcoded
    if (role === 'citizen') {
      const found = mockCitizens.find(c => c.email === email && c.password === password);
      if (found) { setUser({ type: 'citizen', ...found }); return { success: true }; }
    } else {
      const found = mockWorkerAccounts.find(w => w.email === email && w.password === password);
      if (found) { setUser({ type: 'worker', ...found }); return { success: true }; }
    }
    return { success: false, error: 'Invalid credentials. Try: email/1234' };
  };

  const logout = () => setUser(null);

  const submitComplaint = async (data) => {
    const isSilentZone = data.ward === 'Ward 9' || data.ward === 'Ward 11';
    const computedPriority = data.severity >= 8 || isSilentZone ? 'Critical' : 'Medium';
    
    const newDoc = {
      ...data,
      status: 'Submitted',
      priority: computedPriority,
      isSilentZoneBoosted: isSilentZone,
      reportedBy: user?.id || 'C-00',
      reporterName: user?.name || 'Anonymous',
      reportedAt: new Date().toISOString(),
      assignedTo: null,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      upvotes: 0,
      comments: [],
      timeline: [{ status: 'Submitted', time: new Date().toISOString(), note: 'Issue reported by citizen' }],
      image: data.image || null,
      completionPhoto: null,
      resolvedAt: null,
    };
    
    try {
      const docRef = await addDoc(collection(db, 'complaints'), newDoc);
      return docRef.id;
    } catch (error) {
      console.error("Error submitting complaint:", error);
      throw error;
    }
  };

  const addComment = async (complaintId, text) => {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      const target = complaints.find(c => c.id === complaintId);
      if(!target) return;
      const updatedComments = [...(target.comments || []), { 
        id: Date.now(), 
        user: user?.name || 'Anonymous', 
        text, 
        time: new Date().toISOString() 
      }];
      await updateDoc(complaintRef, { comments: updatedComments });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const upvoteComplaint = async (complaintId) => {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      const target = complaints.find(c => c.id === complaintId);
      if(!target) return;
      await updateDoc(complaintRef, { upvotes: (target.upvotes || 0) + 1 });
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus, proof, completionPhotoBase64) => {
    if (!user) return;
    try {
      let finalPhotoUrl = null;
      if (completionPhotoBase64) {
        // Upload base64 to Storage
        const fileRef = ref(storage, `completion_photos/${taskId}_${Date.now()}.jpg`);
        await uploadString(fileRef, completionPhotoBase64, 'data_url');
        finalPhotoUrl = await getDownloadURL(fileRef);
      }

      const complaintRef = doc(db, 'complaints', taskId);
      const target = complaints.find(c => c.id === taskId);
      const resolvedAt = newStatus === 'Resolved' ? new Date().toISOString() : null;
      
      const updatedTimeline = [...(target.timeline || []), {
        status: newStatus,
        time: new Date().toISOString(),
        note: `Status updated to ${newStatus} by ${user.name}`
      }];

      const updatePayload = {
        status: newStatus,
        timeline: updatedTimeline
      };
      if (resolvedAt) updatePayload.resolvedAt = resolvedAt;
      if (finalPhotoUrl) updatePayload.completionPhoto = finalPhotoUrl;

      await updateDoc(complaintRef, updatePayload);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const myComplaints = user?.type === 'citizen'
    ? complaints.filter(c => c.reportedBy === user.id)
    : [];

  const myTasks = user?.type === 'worker'
    ? (workerTasks[user.id] || [])
    : [];

  return (
    <ClientContext.Provider value={{
      user, login, logout,
      complaints, myComplaints, myTasks,
      submitComplaint, addComment, upvoteComplaint, updateTaskStatus,
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => useContext(ClientContext);
