import { createContext, useContext, useState } from 'react';
import { mockComplaints, mockCitizens, mockWorkerAccounts, mockWorkerTasks } from '../data/mockData';

const ClientContext = createContext();

export function ClientProvider({ children }) {
  const [user, setUser] = useState(null); // { type: 'citizen'|'worker', ...data }
  const [complaints, setComplaints] = useState(mockComplaints);
  const [workerTasks, setWorkerTasks] = useState(mockWorkerTasks);

  const login = (email, password, role) => {
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

  const submitComplaint = (data) => {
    const id = `CP-${1011 + complaints.length}`;
    const newComplaint = {
      id,
      ...data,
      status: 'Submitted',
      priority: 'Medium',
      reportedBy: user?.id,
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
    setComplaints(prev => [newComplaint, ...prev]);
    return id;
  };

  const addComment = (complaintId, text) => {
    setComplaints(prev => prev.map(c =>
      c.id === complaintId
        ? { ...c, comments: [...c.comments, { id: Date.now(), user: user?.name || 'Anonymous', text, time: new Date().toISOString() }] }
        : c
    ));
  };

  const upvoteComplaint = (complaintId) => {
    setComplaints(prev => prev.map(c =>
      c.id === complaintId ? { ...c, upvotes: c.upvotes + 1 } : c
    ));
  };

  const updateTaskStatus = (taskId, newStatus, proof, completionPhoto) => {
    if (!user) return;
    const resolvedAt = newStatus === 'Resolved' ? new Date().toISOString() : null;
    setWorkerTasks(prev => ({
      ...prev,
      [user.id]: (prev[user.id] || []).map(t =>
        t.id === taskId ? { ...t, status: newStatus, proof, completionPhoto: completionPhoto || null } : t
      ),
    }));
    setComplaints(prev => prev.map(c =>
      c.id === taskId
        ? { ...c, status: newStatus, completionPhoto: completionPhoto || c.completionPhoto, resolvedAt: resolvedAt || c.resolvedAt }
        : c
    ));
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
