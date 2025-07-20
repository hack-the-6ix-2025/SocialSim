'use client';

import { useState, useRef, useEffect } from 'react';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaStop, FaRedo, FaUserCircle } from 'react-icons/fa';

export default function SimulationPage() {

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [micActive, setMicActive] = useState(false);

  useEffect(() => {
    let stopped = false;
    // Request both video and audio, but enable/disable tracks based on state
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        if (stopped) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        mediaStreamRef.current = mediaStream;
        // Set video stream
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = mediaStream;
        }
        // Enable/disable tracks based on state
        mediaStream.getVideoTracks().forEach((track) => {
          track.enabled = cameraOn;
        });
        mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = micOn;
        });
        // --- Microphone activity detection ---
        let audioContext: AudioContext | null = null;
        let analyser: AnalyserNode | null = null;
        let dataArray: Uint8Array | null = null;
        let source: MediaStreamAudioSourceNode | null = null;
        let animationId: number;
        if (micOn && mediaStream.getAudioTracks().length > 0) {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          source = audioContext.createMediaStreamSource(mediaStream);
          source.connect(analyser);
          analyser.fftSize = 256;
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkMic = () => {
            if (!analyser || !dataArray) return;
            analyser.getByteTimeDomainData(dataArray);
            // Calculate volume (RMS)
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const val = dataArray[i] - 128;
              sum += val * val;
            }
            const rms = Math.sqrt(sum / dataArray.length);
            setMicActive(rms > 10); // Threshold for activity
            animationId = requestAnimationFrame(checkMic);
          };
          checkMic();
        }
        // Cleanup
        return () => {
          if (audioContext) {
            audioContext.close();
          }
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
        };
      })
      .catch((err) => {
        // Optionally handle error
      });
    return () => {
      stopped = true;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  // Toggle camera/mic tracks when state changes
  useEffect(() => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = cameraOn;
      });
      stream.getAudioTracks().forEach((track) => {
        track.enabled = micOn;
      });
    }
  }, [cameraOn, micOn]);

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
            <div className={`w-56 h-36 rounded-lg flex items-center justify-center shadow-lg border overflow-hidden transition-all duration-200 ${micActive ? 'ring-4 ring-blue-400 border-blue-400 bg-blue-100' : 'bg-gray-200'}`}>
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