import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import GarbageMonitoring from './pages/GarbageMonitoring';
import Workers from './pages/Workers';
import Wards from './pages/Wards';
import Feed from './pages/Feed';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
// At the bottom of index.js
module.exports = app;
function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="issues" element={<Issues />} />
            <Route path="garbage" element={<GarbageMonitoring />} />
            <Route path="workers" element={<Workers />} />
            <Route path="wards" element={<Wards />} />
            <Route path="feed" element={<Feed />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
