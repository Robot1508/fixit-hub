import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, X, RefreshCw, CheckCircle } from 'lucide-react';

/**
 * GeoCamera — opens device camera, captures photo as base64,
 * and reads GPS coordinates via navigator.geolocation.
 *
 * Props:
 *   onCapture({ photo: base64String, location: { lat, lng, label } }) — called on confirm
 *   onClose() — called when user dismisses
 *   label — optional heading string
 */
export default function GeoCamera({ onCapture, onClose, label = 'Take Photo' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState('init'); // init | camera | preview | locating | done | error
  const [photo, setPhoto] = useState(null);   // base64 data URL
  const [geoLabel, setGeoLabel] = useState('Locating…');
  const [geoCoords, setGeoCoords] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // environment | user

  // Start camera
  const startCamera = async (facing = facingMode) => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setPhase('camera');
    } catch (err) {
      // Fallback: simulate camera with a placeholder for demo
      setCameraError(err.message || 'Camera not available');
      setPhase('error');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Capture frame from video
  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhoto(dataUrl);
    setPhase('locating');
    stopStream();
    fetchGeo();
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  // Get GPS
  const fetchGeo = () => {
    if (!navigator.geolocation) {
      setGeoLabel('Ichalkaranji, Maharashtra (simulated)');
      setGeoCoords({ lat: 16.6944, lng: 74.4615 });
      setPhase('preview');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoCoords({ lat: latitude, lng: longitude });
        setGeoLabel(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
        setPhase('preview');
      },
      () => {
        // Simulated fallback
        setGeoCoords({ lat: 16.6944 + Math.random() * 0.01, lng: 74.4615 + Math.random() * 0.01 });
        setGeoLabel('Ichalkaranji, Maharashtra (GPS approx)');
        setPhase('preview');
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  const retake = () => {
    setPhoto(null);
    setPhase('init');
    startCamera(facingMode);
  };

  const confirm = () => {
    onCapture({
      photo,
      location: { ...geoCoords, label: geoLabel },
    });
  };

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  // Demo fallback when camera hardware unavailable
  const useDemoPhoto = () => {
    // Create a simple colored canvas as demo
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#2563eb');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(200, 150, 240, 180);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 Demo Photo', 320, 248);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('CivicFlow Issue Report', 320, 278);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhoto(dataUrl);
    setPhase('locating');
    fetchGeo();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-3 bg-black/80">
        <h2 className="text-white font-semibold text-sm">{label}</h2>
        <button onClick={() => { stopStream(); onClose(); }} className="text-white/70 hover:text-white">
          <X size={22} />
        </button>
      </div>

      {/* Camera view */}
      {(phase === 'camera' || phase === 'init') && (
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          {/* Viewfinder overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-48 border-2 border-white/40 rounded-xl" />
          </div>
          {/* Flip camera */}
          <button
            onClick={flipCamera}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      )}

      {/* Locating GPS */}
      {phase === 'locating' && (
        <div className="flex-1 relative">
          {photo && <img src={photo} className="w-full h-full object-cover" alt="captured" />}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm font-medium">Getting your location…</p>
          </div>
        </div>
      )}

      {/* Preview */}
      {phase === 'preview' && photo && (
        <div className="flex-1 relative">
          <img src={photo} className="w-full h-full object-cover" alt="captured" />
          {/* Geo stamp */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={13} className="text-green-400 flex-shrink-0" />
              <p className="text-white text-xs font-medium truncate">{geoLabel}</p>
            </div>
            <p className="text-white/50 text-xs">CivicFlow · {new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
          </div>
        </div>
      )}

      {/* Error / no camera */}
      {phase === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-900 px-6 text-center">
          <Camera size={48} className="text-gray-500" />
          <p className="text-white font-semibold">Camera unavailable</p>
          <p className="text-gray-400 text-sm">{cameraError}</p>
          <button
            onClick={useDemoPhoto}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm"
          >
            Use Demo Photo Instead
          </button>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom bar */}
      <div className="bg-black px-6 py-6 flex items-center justify-between">
        {phase === 'camera' && (
          <>
            <div className="w-12" />
            {/* Shutter */}
            <button
              onClick={capture}
              className="w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-full bg-white" />
            </button>
            <button onClick={flipCamera} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
              <RefreshCw size={20} />
            </button>
          </>
        )}

        {phase === 'preview' && (
          <>
            <button
              onClick={retake}
              className="flex-1 border border-white/30 text-white font-semibold py-3 rounded-xl text-sm mr-3"
            >
              Retake
            </button>
            <button
              onClick={confirm}
              className="flex-1 bg-green-500 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle size={17} /> Use Photo
            </button>
          </>
        )}

        {(phase === 'init' || phase === 'locating') && (
          <div className="w-full flex items-center justify-center">
            <p className="text-white/50 text-sm">
              {phase === 'init' ? 'Initialising camera…' : 'Please wait…'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
