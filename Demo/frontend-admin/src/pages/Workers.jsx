import { useState } from 'react';
import { Card, StatusBadge } from '../components/ui/index.jsx';
import { useApp } from '../context/AppContext';
import { Users, CheckCircle, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['Infrastructure', 'Sanitation', 'Water Supply', 'Electrical', 'Maintenance', 'Traffic Control'];
const WARDS = ['Ward 2','Ward 3','Ward 4','Ward 5','Ward 6','Ward 7','Ward 9','Ward 11','Ward 12','Ward 14'];
const STATUSES = ['Active', 'On Leave', 'Inactive'];

const EMPTY_FORM = { name: '', phone: '', ward: 'Ward 5', category: 'Infrastructure', status: 'Active' };

function WorkerModal({ initial, onSave, onClose, isEdit }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isValid = form.name.trim() && form.phone.trim() && form.ward && form.category;

  const handleSave = () => {
    if (!isValid) { setError('Please fill all required fields.'); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Worker' : 'Add New Worker'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
            <input
              type="text" value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Worker full name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone *</label>
            <input
              type="text" value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="10-digit mobile number"
              maxLength={10}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Specialization *</label>
            <select
              value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Ward */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assigned Ward *</label>
            <select
              value={form.ward} onChange={e => set('ward', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {WARDS.map(w => <option key={w}>{w}</option>)}
            </select>
          </div>

          {/* Status — only for edit */}
          {isEdit && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select
                value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold py-2.5 rounded-xl text-sm"
          >
            {isEdit ? 'Save Changes' : 'Add Worker'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ worker, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Worker?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to remove <strong>{worker.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Workers() {
  const { workers, issues, addWorker, editWorker, deleteWorker } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAdd = (form) => {
    addWorker(form);
    setShowAdd(false);
    showToast('Worker added successfully');
  };

  const handleEdit = (form) => {
    editWorker(editTarget.id, form);
    setEditTarget(null);
    showToast('Worker updated successfully');
  };

  const handleDelete = () => {
    deleteWorker(deleteTarget.id);
    setDeleteTarget(null);
    showToast('Worker removed');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workers</h2>
          <p className="text-gray-500 text-sm mt-1">Manage field workers and track performance</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Add Worker
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Workers', value: workers.length, icon: Users, color: 'bg-blue-100 text-blue-700' },
          { label: 'Active', value: workers.filter(w => w.status === 'Active').length, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
          { label: 'On Leave', value: workers.filter(w => w.status === 'On Leave').length, icon: Users, color: 'bg-orange-100 text-orange-700' },
          {
            label: 'Avg Tasks/Worker',
            value: workers.length ? Math.round(workers.reduce((s, w) => s + (w.completedTasks || 0), 0) / workers.length) : 0,
            icon: CheckCircle,
            color: 'bg-purple-100 text-purple-700'
          },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${k.color}`}>
              <k.icon size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-500">{k.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Worker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {workers.map(worker => {
          const assigned = issues.filter(i => i.assignedTo === worker.name);
          return (
            <Card key={worker.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white font-bold text-base">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{worker.name}</p>
                    <p className="text-xs text-gray-500">{worker.id} · {worker.ward}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <StatusBadge status={worker.status} />
                  <button
                    onClick={() => setEditTarget(worker)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 ml-1"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(worker)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{worker.openTasks}</p>
                  <p className="text-xs text-gray-500">Open Tasks</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-600">{worker.completedTasks}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Specialization</span>
                  <span className="font-medium text-gray-800">{worker.category}</span>
                </div>
                {worker.avgResolutionHours > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Resolution</span>
                    <span className="font-medium text-gray-800">{worker.avgResolutionHours}h</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-800">{worker.phone}</span>
                </div>
              </div>

              {/* Workload bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Workload</span>
                  <span>{worker.openTasks}/5 tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${worker.openTasks >= 4 ? 'bg-red-500' : worker.openTasks >= 2 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (worker.openTasks / 5) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Current assignments */}
              {assigned.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2">CURRENT ASSIGNMENTS</p>
                  {assigned.slice(0, 2).map(issue => (
                    <div key={issue.id} className="flex items-center justify-between py-1">
                      <p className="text-xs text-gray-700 truncate max-w-[160px]">{issue.title}</p>
                      <StatusBadge status={issue.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      {showAdd && <WorkerModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      {editTarget && (
        <WorkerModal
          initial={editTarget}
          isEdit
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          worker={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
