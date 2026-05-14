"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, MonitorUp, PhoneOff, MessageSquare, Users, Settings, PenTool, X, Send } from 'lucide-react';
import Link from 'next/link';

export default function RoomPage({ params }: { params: { id: string } }) {
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants' | 'problems'>('chat');
  const [chatMsg, setChatMsg] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, name: 'Ali Yılmaz', text: 'Hocam sesiniz az geliyor sanırım.', color: 'primary' },
    { id: 2, name: 'Zeynep Kaya', text: 'Ekranda 2. soruyu göremiyorum.', color: 'orange' },
  ]);

  // Real media refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [participants, setParticipants] = useState([
    { id: 1, name: 'Tuğba Öğretmen', role: 'Öğretmen', me: true, mic: true },
    { id: 2, name: 'Ali Yılmaz', role: 'Öğrenci', mic: true },
    { id: 3, name: 'Zeynep Kaya', role: 'Öğrenci', mic: false },
    { id: 4, name: 'Elif Çelik', role: 'Öğrenci', mic: false },
  ]);

  const [mediaError, setMediaError] = useState('');

  const removeParticipant = (id: number) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // --- REAL CAMERA ---
  const toggleCamera = useCallback(async () => {
    if (videoOn) {
      // Turn off camera
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => t.stop());
        if (!micOn) {
          localStreamRef.current = null;
          if (localVideoRef.current) localVideoRef.current.srcObject = null;
        }
      }
      setVideoOn(false);
    } else {
      // Turn on camera
      try {
        setMediaError('');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micOn });
        localStreamRef.current = stream;
        setVideoOn(true);
        if (micOn) {
          // audio track already in stream
        }
      } catch (err: any) {
        setMediaError('Kamera erişim izni reddedildi. Tarayıcı ayarlarından izin verin.');
      }
    }
  }, [videoOn, micOn]);

  // --- REAL MICROPHONE ---
  const toggleMic = useCallback(async () => {
    if (micOn) {
      // Mute mic
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => t.stop());
      }
      setMicOn(false);
    } else {
      try {
        setMediaError('');
        if (localStreamRef.current) {
          // Add audio track to existing stream
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getAudioTracks().forEach(t => localStreamRef.current!.addTrack(t));
        } else {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
        }
        setMicOn(true);
      } catch (err: any) {
        setMediaError('Mikrofon erişim izni reddedildi. Tarayıcı ayarlarından izin verin.');
      }
    }
  }, [micOn]);

  // --- REAL SCREEN SHARING ---
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
        if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        setMediaError('');
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        // Listen for browser "stop sharing" button
        const vt = stream.getVideoTracks()[0];
        if (vt) {
          vt.addEventListener('ended', () => {
            screenStreamRef.current?.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
            setIsScreenSharing(false);
            if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
          });
        }
      } catch (err: any) {
        setMediaError('Ekran paylaşımı iptal edildi veya reddedildi.');
      }
    }
  }, [isScreenSharing]);

  // Paylaşım açılınca `<video>` mount olduktan sonra stream bağlanır (önce ref null kalıyordu).
  useEffect(() => {
    if (!isScreenSharing) return;
    const stream = screenStreamRef.current;
    const el = screenVideoRef.current;
    if (!stream || !el) return;
    el.srcObject = stream;
    void el.play().catch(() => {});
  }, [isScreenSharing]);

  useEffect(() => {
    if (!videoOn || isScreenSharing) return;
    const stream = localStreamRef.current;
    const el = localVideoRef.current;
    if (!stream || !el) return;
    el.srcObject = stream;
    void el.play().catch(() => {});
  }, [videoOn, isScreenSharing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMsg.trim()) {
      setChatMessages([...chatMessages, { id: Date.now(), name: 'Siz', text: chatMsg, color: 'green' }]);
      setChatMsg('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col font-sans">
      {/* Top Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link prefetch={false} href="/dashboard/rooms" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            ← Çıkış
          </Link>
          <div className="w-px h-4 bg-slate-700"></div>
          <h1 className="text-white font-semibold">Oda: {params.id}</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            CANLI
          </span>
          <span className="text-slate-500 text-xs">{participants.length} katılımcı</span>
        </div>
        {mediaError && (
          <div className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-lg border border-red-500/30 max-w-md truncate">
            {mediaError}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-4 relative flex flex-col gap-4">
          <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden relative border border-slate-700 flex items-center justify-center">
            {isScreenSharing ? (
              <video 
                ref={screenVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-contain bg-black"
              />
            ) : videoOn ? (
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover bg-slate-700 mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-4xl text-white font-bold">
                  T
                </div>
                <p className="text-slate-500 text-sm">Kameranız kapalı</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
              Tuğba Öğretmen (Siz)
              {!micOn && <MicOff className="w-4 h-4 text-red-400" />}
            </div>
            {isScreenSharing && (
              <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse">
                <MonitorUp className="w-4 h-4" /> Ekranınızı Paylaşıyorsunuz
              </div>
            )}
          </div>
          
          {/* Other Participants Grid (Small) */}
          <div className="h-40 flex gap-4 overflow-x-auto">
            {participants.filter(p => !p.me).map(p => (
              <div key={p.id} className="w-64 shrink-0 bg-slate-800 rounded-xl overflow-hidden relative border border-slate-700 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-xl text-white font-bold">
                  {p.name.charAt(0)}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-2">
                  {p.name}
                  {!p.mic && <MicOff className="w-3 h-3 text-red-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-800/80 backdrop-blur-lg border border-slate-700 p-2 rounded-2xl shadow-2xl">
            <button 
              onClick={toggleMic}
              className={`p-4 rounded-xl flex items-center justify-center transition-all ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30'}`}
              title={micOn ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
            >
              {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <button 
              onClick={toggleCamera}
              className={`p-4 rounded-xl flex items-center justify-center transition-all ${videoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30'}`}
              title={videoOn ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
            >
              {videoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            <button 
              onClick={toggleScreenShare}
              className={`p-4 rounded-xl transition-all ml-4 flex items-center justify-center ${isScreenSharing ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
              title={isScreenSharing ? 'Paylaşımı Durdur' : 'Ekranı Paylaş'}
            >
              <MonitorUp className="w-6 h-6" />
            </button>
            <Link prefetch={false} href="/dashboard/rooms" className="p-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all ml-8 flex items-center gap-2 font-bold px-6">
              <PhoneOff className="w-5 h-5" /> Ayrıl
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="flex text-sm font-medium text-slate-400 border-b border-slate-700">
            <button onClick={() => setSidebarTab('chat')} className={`flex-1 py-3 border-b-2 transition-colors ${sidebarTab === 'chat' ? 'border-primary-500 text-white' : 'border-transparent hover:text-slate-200'}`}>Sohbet</button>
            <button onClick={() => setSidebarTab('participants')} className={`flex-1 py-3 border-b-2 transition-colors ${sidebarTab === 'participants' ? 'border-primary-500 text-white' : 'border-transparent hover:text-slate-200'}`}>Katılımcılar</button>
            <button onClick={() => setSidebarTab('problems')} className={`flex-1 py-3 border-b-2 transition-colors flex justify-center gap-2 ${sidebarTab === 'problems' ? 'border-primary-500 text-white' : 'border-transparent hover:text-slate-200'}`}>
              Soru Çöz
              <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">2</span>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col text-slate-300 text-sm gap-4">
            {sidebarTab === 'chat' && (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                      <span className={`font-bold text-${msg.color}-400 text-xs`}>{msg.name}</span>
                      <p className="mt-1">{msg.text}</p>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleSendChat} className="pt-4 relative flex gap-2">
                  <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Mesaj yazın..." className="flex-1 bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  <button type="submit" disabled={!chatMsg.trim()} className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}

            {sidebarTab === 'participants' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input type="text" placeholder="Öğrenci ara..." className="flex-1 bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none" />
                  <button onClick={() => setParticipants([...participants, { id: Date.now(), name: 'Yeni Öğrenci', role: 'Öğrenci', me: false, mic: false }])} className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700">Ekle</button>
                </div>
                <div className="space-y-2">
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 hover:bg-slate-700/50 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold text-xs">{p.name.charAt(0)}</div>
                        <div>
                          <p className="text-white text-sm">{p.name} {p.me && '(Siz)'}</p>
                          <p className="text-slate-500 text-xs">{p.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.mic ? <Mic className="w-4 h-4 text-slate-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                        {!p.me && (
                          <button onClick={() => removeParticipant(p.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-500/20 rounded transition-all" title="Odadan Çıkar">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sidebarTab === 'problems' && (
              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">Ali&apos;nin Çözümü</h4>
                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded">Yeni</span>
                  </div>
                  <div className="h-24 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border border-slate-600 mb-3">
                    [Fotoğraf]
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs font-bold transition-colors">Doğru</button>
                    <button className="flex-1 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs font-bold transition-colors">Yanlış</button>
                    <button className="py-1.5 px-3 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors"><PenTool className="w-4 h-4"/></button>
                  </div>
                </div>

                <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">Zeynep&apos;in Çözümü</h4>
                  </div>
                  <div className="h-24 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border border-slate-600 mb-3">
                    [Fotoğraf]
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs font-bold transition-colors">Doğru</button>
                    <button className="flex-1 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs font-bold transition-colors">Yanlış</button>
                    <button className="py-1.5 px-3 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors"><PenTool className="w-4 h-4"/></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
