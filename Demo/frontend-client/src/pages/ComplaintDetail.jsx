import { useState } from 'react';
import { useClient } from '../context/ClientContext';
import { ArrowLeft, ThumbsUp, MessageCircle, Send, User, CheckCircle2, Image } from 'lucide-react';
import { categoryIcons, statusConfig } from '../data/mockData';

const STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig['Submitted'];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

export default function ComplaintDetail({ complaint, onBack }) {
  const { addComment, upvoteComplaint, complaints } = useClient();
  const [comment, setComment] = useState('');
  const [upvoted, setUpvoted] = useState(false);
  const [showLogic, setShowLogic] = useState(false);

  // Live data
  const live = complaints.find(c => c.id === complaint.id) || complaint;
  const stepIndex = STEPS.indexOf(live.status);
  const isResolved = live.status === 'Resolved' || live.status === 'Closed';

  const handleUpvote = () => {
    if (!upvoted) { upvoteComplaint(live.id); setUpvoted(true); }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment(live.id, comment.trim());
    setComment('');
  };

  return (
    <div className="mobile-container" style={{ background: '#f1f5f9' }}>
      {/* Hero photo / header */}
      {live.image ? (
        <div className="relative h-52 overflow-hidden">
          <img src={live.image} alt={live.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute top-12 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <ArrowLeft size={15} /> Back
          </button>
          {/* Category badge */}
          <div className="absolute top-12 right-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-white text-xs font-semibold">{live.category}</span>
          </div>
          {/* Title at bottom */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white/70 text-xs mb-1">{live.id}</p>
            <h2 className="text-white font-bold text-base leading-snug line-clamp-2">{live.title}</h2>
          </div>
        </div>
      ) : (
        <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
          <div className="pt-12 pb-4 px-5">
            <button onClick={onBack} className="flex items-center gap-1.5 text-gray-500 mb-3 text-sm font-medium">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">
                {categoryIcons[live.category]}
              </div>
              <div>
                <p className="text-xs text-gray-400">{live.id}</p>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{live.title}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If photo header, show back button elsewhere handled above; no-photo header is sticky */}
      {live.image && (
        <div className="h-0" /> // spacer so content starts right after hero
      )}

      <div className="px-4 py-4 space-y-3">
        {/* Status & meta card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={live.status} />
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
              ${live.priority === 'Critical' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                live.priority === 'High' ? 'bg-red-100 text-red-700' :
                live.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
              {live.priority} Priority
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              {live.category}
            </span>
            
            {live.fairnessMetadata && (
              <button 
                onClick={() => setShowLogic(!showLogic)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 active:scale-95"
              >
                <Eye size={12} />
                Logic View
              </button>
            )}
          </div>
          
          {showLogic && live.fairnessMetadata && (
            <div className="mb-4 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 shadow-inner">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Agentic Integrity Scan</span>
              </div>
              <p className="text-sm text-indigo-900 leading-snug">
                <strong>Detected:</strong> {live.category} ({live.fairnessMetadata.confidenceToEnvironmentRatio * 100}%)<br/>
                {live.fairnessMetadata.explanation}
              </p>
              {live.isSilentZoneBoosted && (
                <p className="mt-1.5 text-xs text-purple-600 font-semibold bg-purple-100/50 inline-block px-2 py-0.5 rounded">
                  ↑ Silent Zone Boost Applied
                </p>
              )}
            </div>
          )}

          {live.image && (
            <h2 className="font-bold text-gray-900 text-base mb-1">{live.title}</h2>
          )}
          <p className="text-sm text-gray-500">{live.description}</p>

          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-400">📍 {live.location} · {live.ward}</p>
            <p className="text-xs text-gray-400">🕐 Reported: {new Date(live.reportedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>

          {/* Worker assigned */}
          {live.assignedToName && (
            <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl
              ${isResolved ? 'bg-green-50' : 'bg-blue-50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                ${isResolved ? 'bg-green-500' : 'bg-blue-600'}`}>
                <User size={13} className="text-white" />
              </div>
              <div>
                <p className={`text-xs font-semibold ${isResolved ? 'text-green-700' : 'text-blue-700'}`}>
                  {isResolved ? 'Resolved by' : 'Assigned to'}: {live.assignedToName}
                </p>
                {live.resolvedAt && (
                  <p className="text-xs text-green-500">
                    {new Date(live.resolvedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Before / After photos */}
        {(live.image || live.completionPhoto) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Photo Evidence</p>
            <div className={`grid gap-3 ${live.image && live.completionPhoto ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {live.image && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1.5">Before</p>
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={live.image} alt="Before" className="w-full h-28 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-1 font-medium">
                      Reported
                    </div>
                  </div>
                </div>
              )}
              {live.completionPhoto ? (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1.5">After Fix</p>
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={live.completionPhoto} alt="After" className="w-full h-28 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-xs text-center py-1 font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 size={10} /> Fixed
                    </div>
                  </div>
                </div>
              ) : isResolved ? null : (
                live.image && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1.5">After Fix</p>
                    <div className="w-full h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                      <Image size={20} className="text-gray-300 mb-1" />
                      <p className="text-xs text-gray-300 text-center px-2">Pending<br />resolution</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Progress Timeline</p>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-gray-100" />
            <div className="space-y-4">
              {STEPS.map((step, i) => {
                const done = i <= stepIndex;
                const isCurrent = i === stepIndex;
                const log = live.timeline?.find(t => t.status === step);
                return (
                  <div key={step} className="flex items-start gap-4 relative">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0 transition-all
                      ${done
                        ? isCurrent
                          ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-100'
                          : 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-200'}`}>
                      {done
                        ? <CheckCircle2 size={13} className="text-white" />
                        : <span className="w-2 h-2 bg-gray-200 rounded-full" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-300'}`}>{step}</p>
                      {log && <p className="text-xs text-gray-500 mt-0.5">{log.note}</p>}
                      {log && (
                        <p className="text-xs text-gray-400">
                          {new Date(log.time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      )}
                      {!log && !done && <p className="text-xs text-gray-300">Pending</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upvotes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Support this Issue</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {live.upvotes + (upvoted ? 1 : 0)} {(live.upvotes + (upvoted ? 1 : 0)) === 1 ? 'person has' : 'people have'} supported
              </p>
            </div>
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95
                ${upvoted ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}
            >
              <ThumbsUp size={15} />
              {upvoted ? 'Supported' : 'Upvote'}
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <MessageCircle size={13} />
            Comments ({live.comments?.length || 0})
          </p>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto scrollbar-none">
            {(live.comments || []).map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {c.user.charAt(0)}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold text-gray-700">{c.user}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(c.time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            ))}
            {(!live.comments || live.comments.length === 0) && (
              <p className="text-xs text-gray-400 text-center py-4">No comments yet. Be the first!</p>
            )}
          </div>

          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-gray-50"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-[#2563eb] rounded-xl text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
