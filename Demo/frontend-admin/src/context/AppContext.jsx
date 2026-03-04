import { createContext, useContext, useState } from 'react';
import { mockIssues, mockWorkers, mockGarbageBins } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [issues, setIssues] = useState(mockIssues);
  const [workers, setWorkers] = useState(mockWorkers);
  const [bins, setBins] = useState(mockGarbageBins);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'BIN-07 overflow at Deccan Gymkhana', type: 'alert', read: false },
    { id: 2, text: 'CP-1007 high priority unassigned', type: 'warning', read: false },
    { id: 3, text: 'CP-1005 resolved by Vijay More', type: 'success', read: true },
  ]);

  const updateIssueStatus = (issueId, newStatus, workerId) => {
    setIssues(prev => prev.map(issue =>
      issue.id === issueId
        ? { ...issue, status: newStatus, assignedTo: workerId || issue.assignedTo }
        : issue
    ));
  };

  const updateBinLevel = (binId, fillLevel) => {
    setBins(prev => prev.map(bin => {
      if (bin.id !== binId) return bin;
      const status = fillLevel >= 85 ? 'Overflow' : fillLevel >= 70 ? 'Near Capacity' : 'Normal';
      return { ...bin, fillLevel, status };
    }));
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Workers CRUD
  const addWorker = (data) => {
    const id = `W-${String(workers.length + 1).padStart(2, '0')}`;
    const newWorker = {
      id,
      ...data,
      status: 'Active',
      openTasks: 0,
      completedTasks: 0,
      avgResolutionHours: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setWorkers(prev => [...prev, newWorker]);
    return newWorker;
  };

  const editWorker = (id, updates) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWorker = (id) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      issues, workers, bins, notifications, unreadCount,
      updateIssueStatus, updateBinLevel, markNotificationRead,
      addWorker, editWorker, deleteWorker,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
