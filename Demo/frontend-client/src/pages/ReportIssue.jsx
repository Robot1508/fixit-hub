import { useState } from 'react';
import { useClient } from '../context/ClientContext';
import { ArrowLeft, MapPin, Camera, ChevronDown, Eye, Lock, CheckCircle } from 'lucide-react';
import GeoCamera from '../components/shared/GeoCamera';
import { generateFairnessMetadata } from '../lib/integrity-engine';
import { storage, functions } from '../lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

const categories = ['Road', 'Water', 'Electricity', 'Garbage', 'Traffic', 'Public Facilities'];
const categoryIcons = { Road: '🛣️', Water: '💧', Electricity: '⚡', Garbage: '🗑️', Traffic: '🚦', 'Public Facilities': '🏛️' };
const WARDS = ['Ward 2','Ward 3','Ward 4','Ward 5','Ward 6','Ward 7','Ward 9','Ward 11','Ward 12','Ward 14'];
const steps = ['Photo', 'Details', 'Submit'];

export default function ReportIssue({ onBack, onSuccess }) {
  const { submitComplaint, user } = useClient();
  const [step, setStep] = useState(1); 
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedLocation, setCapturedLocation] = useState(null);
  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    location: user?.ward ? user.ward + ', Ichalkaranji' : 'Ward 5, Ichalkaranji',
    ward: user?.ward || 'Ward 5',
    isPublic: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCameraCapture = ({ photo, location }) => {
    setCapturedPhoto(photo);
    setCapturedLocation(location);
    setShowCamera(false);
    if (location?.label) {
      setForm(p => ({ ...p, location: location.label }));
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); 
    setSubmitting(true);

    try {
      // 🚀 UPLOAD TO FIREBASE STORAGE
      let imageUrl = null;
      if (capturedPhoto) {
        const fileRef = ref(storage, `complaint_photos/${Date.now()}.jpg`);
        await uploadString(fileRef, capturedPhoto, 'data_url');
        imageUrl = await getDownloadURL(fileRef);
      }

      // 🚀 GCP NATIVE INTEGRATION: Call Gemini 1.5 Flash via Firebase Function
      const analyzeIssue = httpsCallable(functions, 'analyzeIssue');
      let aiData = { category: null, severity_score: 5 };
      try {
        const response = await analyzeIssue({
          description: form.description,
          category: form.category,
          ward: form.ward,
          imageBase64: capturedPhoto
        });
        aiData = response.data;
      } catch (fnError) {
        console.error("Firebase Function Error, using defaults:", fnError);
      }

      // Agentic Integrity Layer: Generate Fairness Metadata
      const fairnessMeta = generateFairnessMetadata(capturedPhoto, form.ward, aiData);

      // Save to Firestore Context
      const id = submitComplaint({
        ...form,
        image: imageUrl || capturedPhoto, // Fallback to base64 if storage fails (rare)
        gpsLocation: capturedLocation,
        aiCategory: aiData.category || form.category,   
        severity: aiData.severity_score || 5,
        fairnessMetadata: fairnessMeta
      });

      setSubmitting(false);
      if (onSuccess) onSuccess(id);

    } catch (error) {
      console.error("Submission Error:", error);
      // Fallback
      const id = submitComplaint({ ...form, image: capturedPhoto, severity: 5 });
      setSubmitting(false);
      if (onSuccess) onSuccess(id);
    }
  };

  const isStep2Valid = form.category && form.title.trim() && form.description.trim();

  if (showCamera) return <GeoCamera onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />;

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="bg-[#2563eb] pt-10 pb-6 px-5">
        <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)} className="flex items-center gap-2 text-blue-100 mb-4 text-sm">
          <ArrowLeft size={16} /> Previous
        </button>
        <h1 className="text-white text-xl font-bold">Report Issue</h1>
        
        <div className="flex items-center gap-2 mt-4">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= i + 1 ? 'bg-white text-blue-600' : 'bg-blue-400 text-blue-100'}`}>
                {step > i + 1 ? <CheckCircle size={12} /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className="h-[1px] w-4 bg-blue-400" />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
                <Camera size={48} className="text-blue-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm text-gray-500">Capture photo for AI analysis</p>
            </div>
            {capturedPhoto ? (
              <img src={capturedPhoto} className="w-full h-56 object-cover rounded-2xl border shadow-sm" />
            ) : (
              <button onClick={() => setShowCamera(true)} className="w-full aspect-video border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100">
                <Camera size={32} className="text-blue-400 mb-2" />
                <span className="text-sm font-semibold text-blue-600">Open Geo-Camera</span>
              </button>
            )}
            {capturedPhoto && <button onClick={() => setStep(2)} className="w-full bg-[#2563eb] text-white font-bold py-4 rounded-xl">Next</button>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setForm(p => ({ ...p, category: cat }))} className={`py-3 rounded-xl border-2 flex flex-col items-center ${form.category === cat ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                  <span>{categoryIcons[cat]}</span>
                  <span className="text-[10px] font-bold">{cat}</span>
                </button>
              ))}
            </div>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" className="w-full bg-gray-50 rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={4} className="w-full bg-gray-50 rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => setStep(3)} disabled={!isStep2Valid} className="w-full bg-[#2563eb] text-white font-bold py-4 rounded-xl disabled:opacity-30">Review</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
               <p className="text-xs font-bold text-gray-400 mb-1">LOCATION</p>
               <p className="text-sm font-medium">{form.location}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 font-bold py-4 rounded-xl">Edit</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-[2] bg-[#2563eb] text-white font-bold py-4 rounded-xl shadow-lg">
                {submitting ? 'SYNCING GCP...' : 'SUBMIT ISSUE'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}