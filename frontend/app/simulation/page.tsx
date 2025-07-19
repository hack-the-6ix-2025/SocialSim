'use client';

import { useState, useRef, useEffect } from 'react';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaStop, FaRedo, FaUserCircle } from 'react-icons/fa';

export default function SimulationPage() {

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const userVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          stream = mediaStream;
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => {
          // Optionally handle error
        });
    } else {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = null;
      }
      if (stream) {
        (stream as MediaStream).getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    }
    return () => {
      if (stream) {
        (stream as MediaStream).getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [cameraOn]);

  return (
    <div className="relative min-h-screen bg-white flex flex-col">
     

      {/* Main Content: Patient Video Frame */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="w-[90vw] h-[68vw] max-w-[1400px] max-h-[94vh] aspect-video rounded-2xl bg-gray-900 flex items-center justify-center shadow-2xl border-4 border-gray-300 overflow-hidden relative transition-all duration-300 mb-4 mt-6"
        >
          {/* Placeholder for patient video */}
          <div className="w-full h-full bg-black flex items-center justify-center text-white text-4xl font-semibold">
            Patient Video
          </div>
          {/* Optionally, add a label or overlay */}
          <div className="absolute top-4 left-4 bg-white/80 text-gray-800 px-5 py-2 rounded-full text-lg font-medium shadow">Patient</div>
          {/* User Camera Preview overlayed in bottom right */}
          <div className="absolute bottom-6 right-6">
            <div className="w-56 h-36 rounded-lg bg-gray-200 flex items-center justify-center shadow-lg border overflow-hidden">
              {cameraOn ? (
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover bg-black"
                />
              ) : (
                <FaVideoSlash className="text-4xl text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute left-0 w-full flex justify-center" style={{ bottom: '40px' }}>
        <div className="flex gap-8 bg-white/80 px-8 py-4 rounded-xl shadow-lg border">
          <button
            className={`p-3 rounded-full ${cameraOn ? 'bg-blue-100' : 'bg-gray-200'} hover:bg-blue-200`}
            onClick={() => setCameraOn((on) => !on)}
            aria-label="Toggle Camera"
          >
            {cameraOn ? <FaVideo className="text-xl text-blue-600" /> : <FaVideoSlash className="text-xl text-gray-500" />}
          </button>
          <button
            className={`p-3 rounded-full ${micOn ? 'bg-blue-100' : 'bg-gray-200'} hover:bg-blue-200`}
            onClick={() => setMicOn((on) => !on)}
            aria-label="Toggle Microphone"
          >
            {micOn ? <FaMicrophone className="text-xl text-blue-600" /> : <FaMicrophoneSlash className="text-xl text-gray-500" />}
          </button>
          <button
            className="p-3 rounded-full bg-red-100 hover:bg-red-200"
            aria-label="Stop"
          >
            <FaStop className="text-xl text-red-600" />
          </button>
          <button
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="Restart"
          >
            <FaRedo className="text-xl text-gray-600" />
          </button>
        </div>
      </div>

      {/* User Camera Preview moved inside patient video frame */}
    </div>
  );
}