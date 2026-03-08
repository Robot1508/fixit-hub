import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, StatusBadge, PriorityBadge, Button } from '../components/ui/index.jsx';
import { Search, RefreshCw, X, ChevronDown, Image, RotateCcw } from 'lucide-react';
import { mockWorkers } from '../data/mockData';

const categories = ['All', 'Road', 'Water', 'Electricity', 'Garbage', 'Traffic', 'Public Facilities'];
const statuses = ['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const priorities = ['All', 'High', 'Medium', 'Low'];
const wards = ['All', ...Array.from(new Set(mockWorkers.map(w => w.ward))).sort()];

export default function Issues() {
  const { issues, updateIssueStatus } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priFilter, setPriFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);

  const filtered = issues
  .filter(i => {
    const q = search.toLowerCase();

    return (
      (catFilter === 'All' || i.category === catFilter) &&
      (statusFilter === 'All' || i.status === statusFilter) &&
      (priFilter === 'All' || i.priority === priFilter) &&
      (wardFilter === 'All' || i.ward === wardFilter) &&
      (!q ||
        i.title.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.ward.toLowerCase().includes(q)
      )
    );
  })
  .sort((a, b) => (b.severity || 0) - (a.severity || 0));
  const handleAssign = (issueId, workerId) => {
    updateIssueStatus(issueId, 'Assigned', workerId);
    setSelected(prev => prev ? { ...prev, assignedTo: workerId, status: 'Assigned' } : prev);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">All Issues</h2>
        <p className="text-gray-500 text-sm mt-1">{filtered.length} of {issues.length} issues</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, title, ward..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
            />
          </div>

          {[
            { label: 'Category', value: catFilter, setter: setCatFilter, options: categories },
            { label: 'Status', value: statusFilter, setter: setStatusFilter, options: statuses },
            { label: 'Priority', value: priFilter, setter: setPriFilter, options: priorities },
            { label: 'Ward', value: wardFilter, setter: setWardFilter, options: wards },
          ].map(({ label, value, setter, options }) => (
            <div key={label} className="relative">
              <select
                value={value}
                onChange={e => setter(e.target.value)}
                className="appearance-none bg-gray-100 border-0 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 outline-none cursor-pointer"
              >
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={() => { setSearch(''); setCatFilter('All'); setStatusFilter('All'); setPriFilter('All'); setWardFilter('All'); }}>
            <RefreshCw size={14} /> Reset
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID', 'Issue', 'Category', 'Ward', 'Status', 'Priority', 'Score', 'Assigned To', 'Reported'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(issue => (
                <tr
                  key={issue.id}
                  className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                  onClick={() => setSelected(issue)}
                >
                  <td className="px-4 py-3 text-blue-600 font-medium whitespace-nowrap">{issue.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 max-w-[220px] truncate">{issue.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{issue.category}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{issue.ward}</td>
                  <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={issue.priority} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${issue.priorityScore >= 80 ? 'bg-red-500' : issue.priorityScore >= 60 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${issue.priorityScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{issue.priorityScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{issue.assignedTo || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(issue.reportedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">No issues found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Issue Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => { setSelected(null); setShowReopenInput(false); setReopenReason(''); }}>
          <div
            className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">{selected.id}</p>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{selected.title}</h3>
              </div>
              <button onClick={() => { setSelected(null); setShowReopenInput(false); setReopenReason(''); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selected.status} />
                <PriorityBadge priority={selected.priority} />
                <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">{selected.category}</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">DESCRIPTION</p>
                <p className="text-sm text-gray-700">{selected.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">WARD</p>
                  <p className="text-sm text-gray-800">{selected.ward}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">DEPARTMENT</p>
                  <p className="text-sm text-gray-800">{selected.department}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">REPORTED BY</p>
                  <p className="text-sm text-gray-800">{selected.reportedBy}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">REPORTED AT</p>
                  <p className="text-sm text-gray-800">{new Date(selected.reportedAt).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Issue Photos */}
              {(selected.image || selected.completionPhoto) && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">PHOTOS</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.image ? (
                      <div>
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <Image size={11} /> Reported Photo
                        </p>
                        <img
                          src={selected.image}
                          alt="Reported issue"
                          className="w-full h-36 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-36 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Image size={20} className="text-gray-300 mb-1" />
                        <p className="text-xs text-gray-400">No photo</p>
                      </div>
                    )}

                    {selected.completionPhoto ? (
                      <div>
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <Image size={11} /> After Fix
                        </p>
                        <img
                          src={selected.completionPhoto}
                          alt="After fix"
                          className="w-full h-36 object-cover rounded-lg border border-green-200"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-36 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Image size={20} className="text-gray-300 mb-1" />
                        <p className="text-xs text-gray-400">No fix photo yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Priority Score */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">PRIORITY SCORE</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${selected.priorityScore >= 80 ? 'bg-red-500' : selected.priorityScore >= 60 ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${selected.priorityScore}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-gray-800">{selected.priorityScore}/100</span>
                </div>
              </div>

              {/* Assign worker */}
              {selected.status !== 'Resolved' && selected.status !== 'Closed' && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">ASSIGN WORKER</p>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
                    value={selected.assignedTo || ''}
                    onChange={e => handleAssign(selected.id, e.target.value)}
                  >
                    <option value="">— Select Worker —</option>
                    {mockWorkers
                      .filter(w => w.category === selected.department || w.status === 'Active')
                      .map(w => (
                        <option key={w.id} value={w.name}>{w.name} ({w.ward}) — {w.openTasks} open tasks</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Update Status */}
              <div className="space-y-3">
                {selected.status !== 'Closed' && (
                  <div className="flex gap-2 flex-wrap">
                    {selected.status !== 'Resolved' && (
                      <Button size="sm" variant="success" onClick={() => {
                        updateIssueStatus(selected.id, 'Resolved');
                        setSelected(prev => ({ ...prev, status: 'Resolved' }));
                      }}>
                        Mark Resolved
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => {
                      updateIssueStatus(selected.id, 'Closed');
                      setSelected(prev => ({ ...prev, status: 'Closed' }));
                      setShowReopenInput(false);
                    }}>
                      Close Issue
                    </Button>
                  </div>
                )}

                {/* Reopen with reason */}
                {(selected.status === 'Closed' || selected.status === 'Resolved') && (
                  <div>
                    {!showReopenInput ? (
                      <Button size="sm" variant="outline" onClick={() => setShowReopenInput(true)}>
                        <RotateCcw size={13} /> Reopen Issue
                      </Button>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-orange-700">REOPEN REASON</p>
                        <textarea
                          value={reopenReason}
                          onChange={e => setReopenReason(e.target.value)}
                          placeholder="Explain why this issue is being reopened..."
                          rows={3}
                          className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-400 bg-white resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!reopenReason.trim()}
                            onClick={() => {
                              updateIssueStatus(selected.id, 'Submitted');
                              setSelected(prev => ({ ...prev, status: 'Submitted' }));
                              setShowReopenInput(false);
                              setReopenReason('');
                            }}
                          >
                            <RotateCcw size={13} /> Confirm Reopen
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setShowReopenInput(false); setReopenReason(''); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
