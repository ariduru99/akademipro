"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  ExternalLink,
  UserPlus,
  X,
  CheckCircle2,
  Trash2,
  PenTool,
  PauseCircle,
  GraduationCap,
} from "lucide-react";

type Student = {
  id: number;
  name: string;
  parent: string;
  phone: string;
  email?: string;
  grade: string;
  courses: string[];
  status: "active" | "inactive";
};

const STORAGE_KEY = "students_data";

const defaultStudents: Student[] = [
  { id: 1, name: "Ali Yılmaz", parent: "Ahmet Yılmaz", phone: "+905551234567", email: "ali@example.com", grade: "8. Sınıf", courses: ["Matematik", "Fen"], status: "active" },
  { id: 2, name: "Zeynep Kaya", parent: "Ayşe Kaya", phone: "+905559876543", email: "zeynep@example.com", grade: "12. Sınıf", courses: ["Fizik", "Geometri"], status: "active" },
  { id: 3, name: "Can Özkan", parent: "Mehmet Özkan", phone: "+905554567890", email: "can@example.com", grade: "7. Sınıf", courses: ["Matematik"], status: "inactive" },
  { id: 4, name: "Elif Çelik", parent: "Fatma Çelik", phone: "+905552223344", email: "elif@example.com", grade: "8. Sınıf", courses: ["Fen", "İngilizce"], status: "active" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(defaultStudents);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [modalType, setModalType] = useState<"friend" | "newStudent" | "filter" | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    parent: "",
    phone: "",
    email: "",
    grade: "8. Sınıf",
    courses: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved) as Student[];
        if (Array.isArray(arr)) setStudents(arr);
      }
    } catch (e) {
      console.error("students load", e);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students, hydrated]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAction = (id: number, action: string) => {
    setActiveMenuId(null);
    if (action === "delete") {
      if (window.confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) {
        setStudents(students.filter((s) => s.id !== id));
        showToast("Öğrenci sistemden silindi.");
      }
    } else if (action === "status") {
      setStudents(
        students.map((s) =>
          s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s
        )
      );
      showToast("Öğrenci durumu güncellendi.");
    } else if (action === "edit") {
      const target = students.find((s) => s.id === id);
      if (target) setEditingStudent(target);
    }
  };

  const handleSubmitNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const courses = newStudent.courses
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    setStudents([
      {
        id: Date.now(),
        name: newStudent.name.trim(),
        parent: newStudent.parent.trim() || "—",
        phone: newStudent.phone.trim(),
        email: newStudent.email.trim() || undefined,
        grade: newStudent.grade,
        courses,
        status: "active",
      },
      ...students,
    ]);
    setNewStudent({ name: "", parent: "", phone: "", email: "", grade: "8. Sınıf", courses: "" });
    setModalType(null);
    showToast("Yeni öğrenci eklendi.");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setStudents(students.map((s) => (s.id === editingStudent.id ? editingStudent : s)));
    setEditingStudent(null);
    showToast("Öğrenci bilgileri güncellendi.");
  };

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr");
    return students.filter((s) => {
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (!q) return true;
      const haystack = [
        s.name,
        s.parent,
        s.email || "",
        s.phone,
        s.grade,
        s.courses.join(" "),
      ]
        .join(" ")
        .toLocaleLowerCase("tr");
      return haystack.includes(q);
    });
  }, [students, filterStatus, search]);

  return (
    <div className="space-y-6 relative pb-32">
      {toast && (
        <div className="fixed top-20 right-4 sm:right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right-8 z-50 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Öğrenci & Veli Yönetimi</h2>
          <p className="text-slate-500 text-sm mt-1">
            Öğrencilerinizin ve velilerin listesi, iletişim bilgileri ve durumları.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setModalType("friend")}
            className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors shadow-sm font-medium border border-purple-200 text-sm"
          >
            <UserPlus className="w-4 h-4" /> Arkadaş Ekle
          </button>
          <button
            onClick={() => setModalType("newStudent")}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium text-sm"
          >
            Yeni Öğrenci
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Öğrenci adı, veli, ders, sınıf..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalType("filter")}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium relative"
          >
            <Filter className="w-4 h-4" /> Filtrele
            {filterStatus !== "all" && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 min-w-[640px]">
            <thead className="bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Öğrenci</th>
                <th className="px-6 py-4">Veli</th>
                <th className="px-6 py-4">İletişim</th>
                <th className="px-6 py-4">Sınıf & Kurslar</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm">
                    Sonuç bulunamadı.
                  </td>
                </tr>
              )}
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group relative">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailStudent(student)}
                        className="font-bold text-slate-800 hover:text-primary-600 text-left"
                      >
                        {student.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{student.parent}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <a
                        href={`tel:${student.phone}`}
                        title={student.phone}
                        className="p-1.5 hover:bg-slate-200 rounded-md transition-colors"
                        aria-label={`${student.name} telefonu ara`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      {student.email && (
                        <a
                          href={`mailto:${student.email}`}
                          title={student.email}
                          className="p-1.5 hover:bg-slate-200 rounded-md transition-colors"
                          aria-label={`${student.name} mail at`}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800 mb-1">{student.grade}</p>
                    <div className="flex gap-1 flex-wrap">
                      {student.courses.map((course) => (
                        <span
                          key={course}
                          className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 font-medium"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.status === "active" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        Pasif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailStudent(student)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Detay"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Daha fazla"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeMenuId === student.id && (
                          <div className="absolute right-0 top-10 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-[100] py-1 text-left animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => handleAction(student.id, "edit")}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <PenTool className="w-4 h-4 text-slate-400" /> Profili Düzenle
                            </button>
                            <button
                              onClick={() => handleAction(student.id, "status")}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <PauseCircle className="w-4 h-4 text-slate-400" />
                              {student.status === "active" ? "Pasife Al" : "Aktifleştir"}
                            </button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button
                              onClick={() => handleAction(student.id, "delete")}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" /> Öğrenciyi Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Modal */}
      {modalType === "filter" && (
        <Modal title="Duruma Göre Filtrele" onClose={() => setModalType(null)} icon={<Filter className="w-5 h-5" />}>
          <div className="space-y-3">
            {(["all", "active", "inactive"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setFilterStatus(opt);
                  setModalType(null);
                }}
                className={`w-full py-2.5 rounded-lg border font-medium ${
                  filterStatus === opt
                    ? "bg-primary-50 border-primary-200 text-primary-700"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                {opt === "all" ? "Tümü" : opt === "active" ? "Sadece Aktif Öğrenciler" : "Sadece Pasif Öğrenciler"}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modalType === "friend" && (
        <Modal title="Arkadaş Ekle" onClose={() => setModalType(null)} icon={<UserPlus className="w-5 h-5 text-purple-600" />}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setModalType(null);
              showToast("Arkadaşlık isteği gönderildi.");
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-posta veya Profil Kodu</label>
              <input
                required
                type="text"
                placeholder="ogrenci@demo.com veya STD-8891"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white font-medium py-2 rounded-lg hover:bg-purple-700">
              İstek Gönder
            </button>
          </form>
        </Modal>
      )}

      {modalType === "newStudent" && (
        <Modal title="Yeni Öğrenci Ekle" onClose={() => setModalType(null)} icon={<GraduationCap className="w-5 h-5 text-primary-600" />}>
          <form onSubmit={handleSubmitNewStudent} className="space-y-3">
            <div className="bg-primary-50 text-primary-700 p-3 rounded-lg text-xs font-medium border border-primary-100">
              Öğrenci ve Velisi, gönderdiğiniz bağlantı ile otomatik bağlantılı hesaplar oluşturabilecektir.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Öğrenci Adı Soyadı"
                value={newStudent.name}
                onChange={(v) => setNewStudent({ ...newStudent, name: v })}
                required
              />
              <FormInput
                label="Veli Adı"
                value={newStudent.parent}
                onChange={(v) => setNewStudent({ ...newStudent, parent: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Telefon"
                type="tel"
                value={newStudent.phone}
                onChange={(v) => setNewStudent({ ...newStudent, phone: v })}
                placeholder="+90 555 ..."
              />
              <FormInput
                label="E-posta"
                type="email"
                value={newStudent.email}
                onChange={(v) => setNewStudent({ ...newStudent, email: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sınıf</label>
                <select
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  {[
                    "1. Sınıf",
                    "2. Sınıf",
                    "3. Sınıf",
                    "4. Sınıf",
                    "5. Sınıf",
                    "6. Sınıf",
                    "7. Sınıf",
                    "8. Sınıf",
                    "9. Sınıf",
                    "10. Sınıf",
                    "11. Sınıf",
                    "12. Sınıf",
                    "Üniversite",
                    "Yetişkin",
                  ].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <FormInput
                label="Kurslar (virgülle)"
                value={newStudent.courses}
                onChange={(v) => setNewStudent({ ...newStudent, courses: v })}
                placeholder="Matematik, Fen"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 mt-2"
            >
              Öğrenciyi Ekle
            </button>
          </form>
        </Modal>
      )}

      {editingStudent && (
        <Modal title="Profili Düzenle" onClose={() => setEditingStudent(null)} icon={<PenTool className="w-5 h-5 text-primary-600" />}>
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <FormInput
              label="Ad Soyad"
              value={editingStudent.name}
              onChange={(v) => setEditingStudent({ ...editingStudent, name: v })}
              required
            />
            <FormInput
              label="Veli Adı"
              value={editingStudent.parent}
              onChange={(v) => setEditingStudent({ ...editingStudent, parent: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Telefon"
                type="tel"
                value={editingStudent.phone}
                onChange={(v) => setEditingStudent({ ...editingStudent, phone: v })}
              />
              <FormInput
                label="E-posta"
                type="email"
                value={editingStudent.email || ""}
                onChange={(v) => setEditingStudent({ ...editingStudent, email: v })}
              />
            </div>
            <FormInput
              label="Kurslar (virgülle)"
              value={editingStudent.courses.join(", ")}
              onChange={(v) =>
                setEditingStudent({
                  ...editingStudent,
                  courses: v.split(",").map((c) => c.trim()).filter(Boolean),
                })
              }
            />
            <button type="submit" className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700">
              Kaydet
            </button>
          </form>
        </Modal>
      )}

      {detailStudent && (
        <Modal
          title={`${detailStudent.name} — Profil`}
          onClose={() => setDetailStudent(null)}
          icon={<GraduationCap className="w-5 h-5 text-primary-600" />}
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold">
                {detailStudent.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{detailStudent.name}</p>
                <p className="text-xs text-slate-500">{detailStudent.grade}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Veli" value={detailStudent.parent} />
              <Field label="Durum" value={detailStudent.status === "active" ? "Aktif" : "Pasif"} />
              <Field label="Telefon" value={detailStudent.phone} link={`tel:${detailStudent.phone}`} />
              {detailStudent.email && (
                <Field label="E-posta" value={detailStudent.email} link={`mailto:${detailStudent.email}`} />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Aldığı kurslar</p>
              <div className="flex gap-2 flex-wrap">
                {detailStudent.courses.length === 0 && <p className="text-xs text-slate-500">Kurs eklenmemiş.</p>}
                {detailStudent.courses.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-700"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setDetailStudent(null);
                  setEditingStudent(detailStudent);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700"
              >
                Profili Düzenle
              </button>
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  icon,
  children,
}: {
  title: string;
  onClose: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm outline-none"
      />
    </div>
  );
}

function Field({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      {link ? (
        <a href={link} className="text-primary-600 hover:underline font-medium break-all">
          {value}
        </a>
      ) : (
        <p className="text-slate-800 font-medium break-words">{value}</p>
      )}
    </div>
  );
}
