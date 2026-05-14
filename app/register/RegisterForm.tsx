"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  User,
  Users,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { mockRegister } from "@/lib/mockDb";
import { isSupabaseClientConfigured } from "@/lib/authEnv";
import { registerStudentParentLive, registerTeacherLive } from "@/lib/authAccounts";

type Role = "teacher" | "student_parent";

function FormField(props: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  ringClass?: string;
  autoComplete?: string;
}) {
  const ring = props.ringClass || "focus:ring-primary-500";
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{props.label}</label>
      <input
        required={props.required}
        type={props.type || "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 ${ring} text-sm outline-none`}
      />
    </div>
  );
}

export function RegisterForm({ initialRoleQuery }: { initialRoleQuery: string | null }) {
  const router = useRouter();
  const initialRole = initialRoleQuery;
  const [step, setStep] = useState<1 | 2 | 3>(initialRole === "teacher" || initialRole === "parent" ? 2 : 1);
  const [role, setRole] = useState<Role | null>(
    initialRole === "teacher" ? "teacher" : initialRole === "parent" ? "student_parent" : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [tName, setTName] = useState("");
  const [tSurname, setTSurname] = useState("");
  const [tEmail, setTEmail] = useState("");
  const [tPass, setTPass] = useState("");
  const [tPass2, setTPass2] = useState("");

  const [sName, setSName] = useState("");
  const [sSurname, setSSurname] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPass, setSPass] = useState("");

  const [pName, setPName] = useState("");
  const [pSurname, setPSurname] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPass, setPPass] = useState("");

  const goToLogin = () => router.push("/login");

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!acceptTerms) {
      setError("Devam etmek için Kullanım Koşulları ve Gizlilik Politikası'nı onaylayın.");
      return;
    }
    if (tPass !== tPass2) {
      setError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const fullName = `${tName.trim()} ${tSurname.trim()}`.trim();
      const email = tEmail.trim();
      if (isSupabaseClientConfigured()) {
        await registerTeacherLive({ fullName, email, password: tPass });
      } else {
        await mockRegister({
          type: "teacher",
          fullName,
          email,
          password: tPass,
        });
      }
      setStep(3);
      setTimeout(goToLogin, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!acceptTerms) {
      setError("Devam etmek için Kullanım Koşulları ve Gizlilik Politikası'nı onaylayın.");
      return;
    }
    setLoading(true);
    try {
      const studentFull = `${sName.trim()} ${sSurname.trim()}`.trim();
      const parentFull = `${pName.trim()} ${pSurname.trim()}`.trim();
      if (isSupabaseClientConfigured()) {
        await registerStudentParentLive({
          student: {
            fullName: studentFull,
            email: sEmail.trim(),
            password: sPass,
          },
          parent: {
            fullName: parentFull,
            email: pEmail.trim(),
            password: pPass,
          },
        });
      } else {
        await mockRegister({
          type: "student_parent",
          student: {
            fullName: studentFull,
            email: sEmail.trim(),
            password: sPass,
          },
          parent: {
            fullName: parentFull,
            email: pEmail.trim(),
            password: pPass,
          },
        });
      }
      setStep(3);
      setTimeout(goToLogin, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 p-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600 mb-2">
            <BookOpen className="w-7 h-7" />
            Akademi Pro
          </Link>
          <p className="text-slate-500 text-sm">Ücretsiz hesabınızı oluşturun ve eğitime başlayın</p>
        </div>

        <div className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 text-center mb-6">Nasıl katılmak istiyorsunuz?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setRole("teacher");
                    setStep(2);
                  }}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 mb-2">Öğretmenim</h4>
                  <p className="text-sm text-slate-500">Ders odaları açmak, öğrenci yönetmek ve ödeme almak istiyorum.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole("student_parent");
                    setStep(2);
                  }}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-secondary-500 hover:bg-secondary-50 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 mb-2">Öğrenci / Veliyim</h4>
                  <p className="text-sm text-slate-500">
                    Öğrenci ve Veli hesaplarını aynı anda oluşturarak bağlantılı kayıt olmak istiyorum.
                  </p>
                </button>
              </div>
              <p className="text-center text-sm text-slate-500 mt-6">
                Zaten hesabınız var mı?{" "}
                <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          )}

          {step === 2 && role === "teacher" && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                  aria-label="Geri"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                Öğretmen Kaydı
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Ad" required value={tName} onChange={setTName} autoComplete="given-name" />
                <FormField label="Soyad" required value={tSurname} onChange={setTSurname} autoComplete="family-name" />
              </div>
              <FormField
                label="E-posta"
                type="email"
                required
                value={tEmail}
                onChange={setTEmail}
                autoComplete="email"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Şifre"
                  type="password"
                  required
                  value={tPass}
                  onChange={setTPass}
                  placeholder="En az 6 karakter"
                  autoComplete="new-password"
                />
                <FormField
                  label="Şifre (tekrar)"
                  type="password"
                  required
                  value={tPass2}
                  onChange={setTPass2}
                  placeholder="Tekrar"
                  autoComplete="new-password"
                />
              </div>

              <TermsCheckbox checked={acceptTerms} onChange={setAcceptTerms} />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Kaydediliyor..." : "Hesap Oluştur"}
              </button>
            </form>
          )}

          {step === 2 && role === "student_parent" && (
            <form onSubmit={handleStudentParentSubmit} className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                  aria-label="Geri"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h3 className="text-lg font-bold text-slate-800">Öğrenci & Veli Kaydı (Bağlantılı Hesap)</h3>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Öğrenci Bilgileri
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <FormField label="Öğrenci Ad" required value={sName} onChange={setSName} />
                  <FormField label="Öğrenci Soyad" required value={sSurname} onChange={setSSurname} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Öğrenci E-posta"
                    type="email"
                    required
                    value={sEmail}
                    onChange={setSEmail}
                    autoComplete="email"
                  />
                  <FormField
                    label="Öğrenci Şifre"
                    type="password"
                    required
                    value={sPass}
                    onChange={setSPass}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-secondary-700 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Veli Bilgileri
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <FormField
                    label="Veli Ad"
                    required
                    value={pName}
                    onChange={setPName}
                    ringClass="focus:ring-secondary-500"
                  />
                  <FormField
                    label="Veli Soyad"
                    required
                    value={pSurname}
                    onChange={setPSurname}
                    ringClass="focus:ring-secondary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Veli E-posta"
                    type="email"
                    required
                    value={pEmail}
                    onChange={setPEmail}
                    autoComplete="email"
                    ringClass="focus:ring-secondary-500"
                  />
                  <FormField
                    label="Veli Şifre"
                    type="password"
                    required
                    value={pPass}
                    onChange={setPPass}
                    autoComplete="new-password"
                    ringClass="focus:ring-secondary-500"
                  />
                </div>
              </div>

              <TermsCheckbox checked={acceptTerms} onChange={setAcceptTerms} />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Hesaplar Bağlanıyor ve Oluşturuluyor..." : "Bağlantılı Hesapları Oluştur"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Kayıt Başarılı.</h3>
              <p className="text-slate-500">
                Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...
              </p>
              <button
                type="button"
                onClick={goToLogin}
                className="text-primary-600 font-semibold underline text-sm"
              >
                Hemen giriş yap
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TermsCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 text-primary-600 rounded"
      />
      <span>
        <Link href="/kullanim-kosullari" target="_blank" className="text-primary-600 underline">
          Kullanım Koşulları
        </Link>{" "}
        ve{" "}
        <Link href="/gizlilik" target="_blank" className="text-primary-600 underline">
          Gizlilik Politikası
        </Link>
        &apos;nı okudum, onaylıyorum.
      </span>
    </label>
  );
}
