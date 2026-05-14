"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Send,
  Paperclip,
  CheckCircle2,
  Trash2,
  StickyNote,
  FileText,
  X,
  Plus,
  UserPlus,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
} from "lucide-react";

type CallMode = "audio" | "video";

function CallModal({
  open,
  mode,
  contactName,
  onClose,
}: {
  open: boolean;
  mode: CallMode | null;
  contactName: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopAll = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    if (!open || !mode) {
      stopAll();
      setMuted(false);
      setCamOff(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setError(null);

    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video:
            mode === "video"
              ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
              : false,
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
        setStream(s);
      } catch {
        setError("Mikrofon veya kamera izni gerekli. Tarayıcı ayarlarından izin verin.");
      }
    })();

    return () => {
      cancelled = true;
      const ms = streamRef.current;
      ms?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, mode]);

  useEffect(() => {
    if (!open || mode !== "video" || !stream) {
      const videoEl = videoRef.current;
      if (videoEl) videoEl.srcObject = null;
      return;
    }
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.srcObject = stream;
    void videoEl.play().catch(() => {});
    return () => {
      videoEl.srcObject = null;
    };
  }, [open, mode, stream]);

  useEffect(() => {
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }, [stream, muted]);

  useEffect(() => {
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !camOff;
    });
  }, [stream, camOff]);

  if (!open || !mode) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Uygulama içi arama</p>
            <p className="text-white font-bold text-lg">{contactName}</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {mode === "video" ? "Görüntülü" : "Sesli"} önizleme — iki tarafın bağlanması için ayrıca sunucu gerekir
            </p>
          </div>
        </div>

        <div className="relative aspect-video bg-slate-900 flex items-center justify-center min-h-[220px]">
          {error && (
            <p className="text-red-400 text-sm text-center px-6">{error}</p>
          )}
          {!error && mode === "video" && (
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${camOff ? "opacity-30" : ""}`}
            />
          )}
          {!error && mode === "audio" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="w-28 h-28 rounded-full bg-primary-600 flex items-center justify-center text-4xl text-white font-bold ring-4 ring-primary-400/50 animate-pulse">
                {contactName.charAt(0)}
              </div>
              <p className="text-slate-300 text-sm">Sesli görüşme hazır</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 py-5 px-4 bg-slate-800/95">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className={`p-4 rounded-full transition-colors ${muted ? "bg-red-600 text-white" : "bg-slate-700 text-white hover:bg-slate-600"}`}
            aria-label={muted ? "Sesi aç" : "Sessize al"}
          >
            {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          {mode === "video" && (
            <button
              type="button"
              onClick={() => setCamOff((c) => !c)}
              className={`p-4 rounded-full transition-colors ${camOff ? "bg-amber-600 text-white" : "bg-slate-700 text-white hover:bg-slate-600"}`}
              aria-label={camOff ? "Kamerayı aç" : "Kamerayı kapat"}
            >
              {camOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              stopAll();
              onClose();
            }}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700"
            aria-label="Görüşmeyi bitir"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}


const MAX_FILE_BYTES = 10 * 1024 * 1024;

type ChatMessageBase = { id: number; sender: "me" | "them"; time: string };

type TextMessage = ChatMessageBase & { kind?: "text"; text: string };

type FileMessage = ChatMessageBase & {
  kind: "file";
  fileName: string;
  mime: string;
  dataUrl: string;
  fileSize?: number;
};

type ChatMessage = TextMessage | FileMessage;

type Contact = {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
};

const STORAGE_KEY_THREADS = "messages_threads_v1";
const STORAGE_KEY_CONTACTS = "messages_contacts_v1";
const STORAGE_KEY_NOTES = "messages_notes_v1";

const defaultContacts: Contact[] = [];
const emptyThreads: Record<number, ChatMessage[]> = {};

function normalizeMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "number" ? o.id : Number(o.id);
  if (!Number.isFinite(id)) return null;
  const sender = o.sender === "me" || o.sender === "them" ? o.sender : null;
  if (!sender) return null;
  const time = typeof o.time === "string" ? o.time : "";
  if (o.kind === "file") {
    const dataUrl = typeof o.dataUrl === "string" ? o.dataUrl : "";
    const fileName = typeof o.fileName === "string" ? o.fileName : "dosya";
    const mime = typeof o.mime === "string" ? o.mime : "application/octet-stream";
    if (!dataUrl.startsWith("data:")) return null;
    const fileSize = typeof o.fileSize === "number" ? o.fileSize : undefined;
    return { id, sender, time, kind: "file", fileName, mime, dataUrl, fileSize };
  }
  const text = typeof o.text === "string" ? o.text : "";
  return { id, sender, time, text, kind: "text" };
}

function mergeThreadsFromStorage(parsed: unknown): Record<number, ChatMessage[]> {
  const out: Record<number, ChatMessage[]> = {};
  if (parsed && typeof parsed === "object") {
    for (const [k, v] of Object.entries(parsed as Record<string, unknown[]>)) {
      const id = Number(k);
      if (!Number.isFinite(id) || !Array.isArray(v)) continue;
      const normalized = v.map(normalizeMessage).filter((m): m is ChatMessage => m !== null);
      if (normalized.length) out[id] = normalized;
    }
  }
  return out;
}

function isFileMessage(m: ChatMessage): m is FileMessage {
  return m.kind === "file";
}

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>(defaultContacts);
  const [threads, setThreads] = useState<Record<number, ChatMessage[]>>(emptyThreads);
  const [activeId, setActiveId] = useState(defaultContacts[0]?.id ?? -1);
  const [message, setMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [notesByContact, setNotesByContact] = useState<Record<number, string>>({});
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [callMode, setCallMode] = useState<"audio" | "video" | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatRole, setNewChatRole] = useState("Öğrenci");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const activeContact = useMemo(() => contacts.find((c) => c.id === activeId) ?? null, [contacts, activeId]);

  const chatHistory = useMemo(() => (activeId >= 0 ? threads[activeId] ?? [] : []), [threads, activeId]);

  useEffect(() => {
    try {
      const tRaw = localStorage.getItem(STORAGE_KEY_THREADS);
      const cRaw = localStorage.getItem(STORAGE_KEY_CONTACTS);
      const nRaw = localStorage.getItem(STORAGE_KEY_NOTES);
      if (tRaw) setThreads(mergeThreadsFromStorage(JSON.parse(tRaw)));
      if (cRaw) {
        const p = JSON.parse(cRaw);
        if (Array.isArray(p) && p.length) setContacts(p);
      }
      if (nRaw) {
        const p = JSON.parse(nRaw);
        if (p && typeof p === "object") setNotesByContact(p as Record<number, string>);
      }
    } catch (e) {
      console.error("messages storage", e);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
      setStorageError(null);
    } catch {
      setStorageError("Tarayıcı depolama dolu. Büyük dosyalar kaydedilemedi; sayfayı yenilerseniz kaybolabilir.");
    }
  }, [threads, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
      setStorageError(null);
    } catch {
      setStorageError("Tarayıcı depolama dolu. Değişiklikler kaydedilemedi; sayfayı yenilerseniz kaybolabilir.");
    }
  }, [contacts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notesByContact));
      setStorageError(null);
    } catch {
      setStorageError("Tarayıcı depolama dolu. Notlar kaydedilemedi; sayfayı yenilerseniz kaybolabilir.");
    }
  }, [notesByContact, hydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeId]);

  useEffect(() => {
    if (!headerMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) setHeaderMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [headerMenuOpen]);

  useEffect(() => {
    if (!notesOpen || !activeContact) return;
    setNoteDraft(notesByContact[activeContact.id] ?? "");
  }, [notesOpen, activeContact, notesByContact]);

  useEffect(() => {
    if (!activeContact && callMode) setCallMode(null);
  }, [activeContact, callMode]);

  const saveNotes = useCallback(() => {
    if (!activeContact) return;
    setNotesByContact((prev) => ({ ...prev, [activeContact.id]: noteDraft }));
    setNotesOpen(false);
  }, [activeContact, noteDraft]);

  const deleteConversation = useCallback(
    (id: number) => {
      if (!window.confirm("Bu sohbeti ve kayıtlarını silmek istediğinize emin misiniz?")) return;
      setContacts((prev) => {
        const next = prev.filter((c) => c.id !== id);
        setActiveId((cur) => {
          if (cur !== id) return cur;
          return next[0]?.id ?? -1;
        });
        return next;
      });
      setThreads((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      setNotesByContact((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      setHeaderMenuOpen(false);
    },
    []
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !activeContact) return;

    const timeStr = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const newMsg: TextMessage = {
      id: Date.now(),
      text: trimmed,
      sender: "me",
      time: timeStr,
      kind: "text",
    };
    const aid = activeContact.id;

    setThreads((prev) => ({
      ...prev,
      [aid]: [...(prev[aid] ?? []), newMsg],
    }));

    setContacts((prev) =>
      prev.map((c) => (c.id === aid ? { ...c, lastMessage: trimmed, time: timeStr, unread: 0 } : c))
    );

    setMessage("");
  };

  const addFileMessage = (file: File) => {
    if (!activeContact) return;
    setFileError(null);
    if (file.size > MAX_FILE_BYTES) {
      setFileError(`Dosya çok büyük (en fazla ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") return;
      const timeStr = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      const newMsg: FileMessage = {
        id: Date.now(),
        sender: "me",
        time: timeStr,
        kind: "file",
        fileName: file.name,
        mime: file.type || "application/octet-stream",
        dataUrl,
        fileSize: file.size,
      };
      const aid = activeContact.id;
      const label = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") ? `PDF: ${file.name}` : `Dosya: ${file.name}`;

      setThreads((prev) => ({
        ...prev,
        [aid]: [...(prev[aid] ?? []), newMsg],
      }));

      setContacts((prev) =>
        prev.map((c) => (c.id === aid ? { ...c, lastMessage: label, time: timeStr, unread: 0 } : c))
      );
    };
    reader.onerror = () => setFileError("Dosya okunamadı.");
    reader.readAsDataURL(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) addFileMessage(f);
  };

  const selectContact = (contact: Contact) => {
    setActiveId(contact.id);
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c)));
  };

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr");
    if (!q) return contacts;
    return contacts.filter((c) =>
      `${c.name} ${c.role} ${c.lastMessage}`.toLocaleLowerCase("tr").includes(q)
    );
  }, [contacts, search]);

  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newChatName.trim();
    if (!name) return;
    const id = Date.now();
    const newContact: Contact = {
      id,
      name,
      role: newChatRole,
      lastMessage: "Yeni sohbet başlatıldı",
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      unread: 0,
      isOnline: false,
    };
    setContacts([newContact, ...contacts]);
    setThreads((prev) => ({ ...prev, [id]: [] }));
    setActiveId(id);
    setNewChatName("");
    setNewChatRole("Öğrenci");
    setNewChatOpen(false);
  };

  const activeName = activeContact?.name ?? "";

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex relative">
      <CallModal
        open={callMode !== null}
        mode={callMode}
        contactName={activeName}
        onClose={() => setCallMode(null)}
      />

      <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf,image/*,.pdf" onChange={onFileInput} />

      {/* Sidebar - Contacts */}
      <div className="w-72 sm:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Mesajlar</h2>
            <button
              type="button"
              onClick={() => setNewChatOpen(true)}
              className="p-2 -mr-2 rounded-lg text-primary-600 hover:bg-primary-50"
              aria-label="Yeni sohbet başlat"
              title="Yeni sohbet"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sohbet ara..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 text-center">
              {search ? "Sonuç bulunamadı." : "Henüz sohbet yok."}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                role="button"
                tabIndex={0}
                onClick={() => selectContact(contact)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") selectContact(contact);
                }}
                className={`p-4 border-b border-slate-100 cursor-pointer transition-colors group ${activeId === contact.id ? "bg-primary-50 border-primary-100" : "hover:bg-white"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${activeId === contact.id ? "bg-primary-600" : "bg-slate-300"}`}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    {contact.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <h4
                        className={`font-bold text-sm truncate ${activeId === contact.id ? "text-primary-900" : "text-slate-800"}`}
                      >
                        {contact.name}
                      </h4>
                      <span
                        className={`text-xs shrink-0 ${activeId === contact.id ? "text-primary-600 font-medium" : "text-slate-400"}`}
                      >
                        {contact.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`text-xs truncate ${contact.unread > 0 ? "text-slate-800 font-bold" : "text-slate-500"}`}>
                        {contact.lastMessage}
                      </p>
                      <div className="flex items-center shrink-0 gap-1">
                        {contact.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {contact.unread}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            deleteConversation(contact.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                          aria-label="Sohbeti sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/30 min-w-0">
        {!activeContact ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm p-8">Sohbet seçin veya yeni bir sohbet başlatın.</div>
        ) : (
          <>
            <div className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold shrink-0">
                  {activeContact.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{activeContact.name}</h3>
                  <p className="text-xs text-slate-500 truncate">
                    {activeContact.role} {activeContact.isOnline ? "• Çevrimiçi" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-slate-400 shrink-0">
                <button
                  type="button"
                  onClick={() => setNotesOpen(true)}
                  className="p-2 hover:bg-slate-100 hover:text-primary-600 rounded-full transition-colors"
                  title="Notlar"
                  aria-label="Notlar"
                >
                  <StickyNote className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCallMode("audio")}
                  className="p-2 hover:bg-slate-100 hover:text-primary-600 rounded-full transition-colors"
                  aria-label="Sesli arama"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCallMode("video")}
                  className="p-2 hover:bg-slate-100 hover:text-primary-600 rounded-full transition-colors"
                  aria-label="Görüntülü arama"
                >
                  <Video className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
                <div className="relative" ref={headerMenuRef}>
                  <button
                    type="button"
                    onClick={() => setHeaderMenuOpen((v) => !v)}
                    className="p-2 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
                    aria-label="Diğer"
                    aria-expanded={headerMenuOpen}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {headerMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 text-sm">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                        onClick={() => {
                          setNotesOpen(true);
                          setHeaderMenuOpen(false);
                        }}
                      >
                        <StickyNote className="w-4 h-4" /> Sohbet notları
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
                        onClick={() => deleteConversation(activeContact.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Sohbeti sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center mb-6">
                <span className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-1 rounded-full font-medium">Bugün</span>
              </div>

              {chatHistory.map((msg) => (
                <div key={`${activeId}-${msg.id}`} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                      msg.sender === "me" ? "bg-primary-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {isFileMessage(msg) ? (
                      <div className="text-sm space-y-2">
                        {msg.mime.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={msg.dataUrl} alt={msg.fileName} className="max-w-full rounded-lg max-h-48 object-contain bg-black/10" />
                        ) : (
                          <a
                            href={msg.dataUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 font-medium ${msg.sender === "me" ? "text-white underline" : "text-primary-600 underline"}`}
                          >
                            <FileText className="w-5 h-5 shrink-0" />
                            <span className="break-all">{msg.fileName}</span>
                          </a>
                        )}
                        <p className={`text-xs ${msg.sender === "me" ? "text-primary-200" : "text-slate-500"}`}>
                          {msg.mime.includes("pdf") || msg.fileName.toLowerCase().endsWith(".pdf") ? "PDF — yeni sekmede aç" : msg.mime}
                          {msg.fileSize !== undefined && ` · ${(msg.fileSize / 1024).toFixed(0)} KB`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    )}
                    <div
                      className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.sender === "me" ? "text-primary-200" : "text-slate-400"}`}
                    >
                      {msg.time}
                      {msg.sender === "me" && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              {storageError && <p className="text-amber-700 text-xs mb-2">{storageError}</p>}
              {fileError && <p className="text-red-600 text-xs mb-2">{fileError}</p>}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2 pr-3 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400 transition-all"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors shrink-0"
                  aria-label="Dosya veya PDF ekle"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`${activeContact.name} kişisine yazın...`}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-700 min-w-0"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-sm shrink-0"
                  aria-label="Gönder"
                >
                  <Send className="w-4 h-4 ml-1" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* New chat modal */}
      {newChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary-600" /> Yeni Sohbet
              </h3>
              <button
                type="button"
                onClick={() => setNewChatOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStartNewChat} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Kişi adı</label>
                <input
                  required
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="Örn: Mehmet Demir"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rol</label>
                <select
                  value={newChatRole}
                  onChange={(e) => setNewChatRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                >
                  <option>Öğrenci</option>
                  <option>Veli</option>
                  <option>Öğretmen</option>
                  <option>Grup</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-primary-700"
              >
                Sohbeti Başlat
              </button>
              <p className="text-xs text-slate-500 text-center">
                Bu sohbet yalnızca tarayıcınızda saklanır. Gerçek mesajlaşma altyapısı sonraki sürümde
                aktif olacak.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Notes panel */}
      {notesOpen && activeContact && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="notes-title">
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Kapat" onClick={() => setNotesOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col border-l border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 id="notes-title" className="font-bold text-slate-800 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-primary-600" />
                Sohbet notları — {activeContact.name}
              </h2>
              <button
                type="button"
                onClick={() => setNotesOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Bu sohbetle ilgili kendi notlarınızı buraya yazın..."
              className="flex-1 m-4 min-h-[200px] p-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setNotesOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm">
                Vazgeç
              </button>
              <button type="button" onClick={saveNotes} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
