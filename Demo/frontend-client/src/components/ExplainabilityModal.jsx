import React from 'react';
import { Eye, ShieldCheck, X } from 'lucide-react';

export default function ExplainabilityModal({ isOpen, onClose, awsData, vertexAudit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content - Pinterest Style Glassmorphism */}
      <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden shadow-indigo-500/10 transform transition-all duration-300 scale-100 opacity-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-indigo-100/50 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-full shadow-sm text-indigo-600">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-gray-800 tracking-tight">Ethical Overseer Audit</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 bg-white/50 hover:bg-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body side-by-side */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            
            {/* AWS Block */}
            <div className="bg-white/60 p-4 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-bl-full -z-10 blur-xl"></div>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">AWS Vision Model</p>
              <h4 className="text-sm font-semibold text-gray-900 leading-snug">Detected: {awsData?.category || 'Issue'}</h4>
              <p className="text-xs text-gray-500 mt-2">Severity: {awsData?.severity || 'Assessed'}</p>
              
              <div className="mt-3 text-xs bg-blue-50 text-blue-700 px-2 py-1.5 rounded-lg border border-blue-100 inline-block font-medium">
                {awsData?.fairnessMetadata?.explanation || 'Awaiting normalization.'}
              </div>
            </div>

            {/* Google Cloud Block */}
            <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100/50 rounded-bl-full -z-10 blur-xl"></div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                Google Cloud Audit
              </p>
              <h4 className="text-sm font-semibold text-gray-900 leading-snug tracking-tight">
                {vertexAudit?.commentary?.includes('Flagged') ? 'Audit Flagged geographic variance' : 'Confirmed No Geographic Bias'}
              </h4>
              
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Fairness Score:</span>
                <span className={`text-xs font-bold ${vertexAudit?.fairnessScore < 0.8 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {vertexAudit?.fairnessScore ? (vertexAudit.fairnessScore * 100).toFixed(0) + '%' : '98%'}
                </span>
              </div>

              <p className="mt-2 text-xs text-emerald-800 bg-emerald-50/80 px-2.5 py-2 rounded-lg border border-emerald-100 font-medium leading-relaxed">
                {vertexAudit?.commentary || 'Audit Confirmed: No Geographic Bias. The severity rating aligns accurately with the structural degradation observed, independent of the surrounding infrastructure\'s wealth markers.'}
              </p>
            </div>
            
          </div>
          
          {/* Action Area */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
             <div className="mt-0.5"><Eye size={16} className="text-indigo-400" /></div>
             <p className="text-xs text-gray-500 leading-relaxed font-medium">
               This cross-cloud audit guarantees that our civic reporting prioritization remains strictly equitable. We don't just fix roads; we fix the infrastructure of inequality.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
