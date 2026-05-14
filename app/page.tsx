import Link from 'next/link';
import { BookOpen, Users, Video, Star, Shield, CreditCard, MessageCircle, Calendar, Monitor, Sparkles, TrendingUp, Quote, ArrowUpRight } from 'lucide-react';
import { HomeComments } from '@/components/HomeComments';
import { CookieConsent } from '@/components/CookieConsent';
import { NewsletterSignup } from '@/components/NewsletterSignup';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Background Shapes */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50 -z-10"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl opacity-50 -z-10"></div>

      {/* Navbar */}
      <nav className="w-full flex flex-wrap justify-between items-center gap-4 py-6 px-4 sm:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="text-xl sm:text-2xl font-bold text-primary-600 flex items-center gap-2 shrink-0">
          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
          Akademi Pro
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-8 items-center font-medium text-slate-600 text-sm sm:text-base">
          <Link href="#ozellikler" className="hover:text-primary-600 transition-colors">Özellikler</Link>
          <Link href="#yorumlar" className="hover:text-primary-600 transition-colors">Yorumlar</Link>
          <Link href="/login" className="hidden sm:inline-flex hover:text-primary-600 transition-colors">Giriş Yap</Link>
          <Link href="/register" className="btn btn-primary">Hemen Başla</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex gap-2 mb-6 flex-wrap">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Akademik Dersler</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">Yabancı Diller</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">Sanat & Müzik</span>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold">Spor & Fitness</span>
            <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">Yazılım & Teknoloji</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">Kişisel Gelişim</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-primary-800">
            Eğitim Sürecinizi Tek Merkezden Yönetin
          </h1>
          <p className="text-lg text-slate-500 mb-8">
            Hem yüz yüze hem online dersleriniz için eksiksiz LMS, ödeme takibi, AI koçluk ve veli-öğretmen iletişim platformu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link href="/login?role=teacher" className="btn btn-primary justify-center">
              <Users className="w-5 h-5" /> Eğitmen Olarak Katıl
            </Link>
            <Link href="/login?role=parent" className="btn btn-outline justify-center">
              Veli / Öğrenci Girişi
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12 border-t border-slate-200 pt-8">
            <div>
              <p className="text-3xl font-extrabold text-slate-800">120+</p>
              <p className="text-sm text-slate-500 font-medium">Kayıtlı Eğitmen</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800">850+</p>
              <p className="text-sm text-slate-500 font-medium">Öğrenci</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800">4.9/5</p>
              <p className="text-sm text-slate-500 font-medium">Kullanıcı Puanı</p>
            </div>
          </div>
        </div>

        {/* Right Side - Engaging, Premium Testimonials & Proof Section */}
        <div className="space-y-6 relative">
          {/* Floating Accents */}
          <div className="absolute -top-6 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 animate-bounce z-20">
            <Sparkles className="w-3.5 h-3.5" /> Eğitimcilerin Yeni Favorisi
          </div>

          {/* Premium Card 1 */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border-2 border-primary-100 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-full -z-10 group-hover:scale-125 transition-transform"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +%120 Gelir Artışı
              </span>
            </div>
            <p className="text-slate-700 text-sm mb-4 leading-relaxed font-medium">
              &quot;Eskiden öğrenci taksitlerini, ek ders ücretlerini ve telafileri takip etmek tam bir kaostu. Akademi Pro ile tüm finansal süreçlerim ve programım tamamen otomatikleşti. Haftada en az 8 saatim bana kaldı, öğrenci sayımı iki katına çıkardım!&quot;
            </p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-extrabold shadow-md">
                AM
              </div>
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Dr. Alperen M.</p>
                <p className="text-xs text-primary-600 font-semibold">Matematik & Fizik Eğitmeni • 12 Yıllık Deneyim</p>
              </div>
            </div>
          </div>

          {/* Premium Card 2 */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary-50 to-transparent rounded-bl-full -z-10 group-hover:scale-125 transition-transform"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Kurumsal Çözüm
              </span>
            </div>
            <p className="text-slate-700 text-sm mb-4 leading-relaxed font-medium">
              &quot;Kurumumuzdaki 15 eğitmenin canlı derslerini, ödev takiplerini ve veli bilgilendirmelerini tek tıkla izleyebiliyoruz. Velilerden gelen &apos;Sisteminiz harika, her şey çok şeffaf&apos; dönütleri kurumsal itibarımızı zirveye taşıdı.&quot;
            </p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-700 text-white flex items-center justify-center font-extrabold shadow-md">
                SY
              </div>
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Sevim Y.</p>
                <p className="text-xs text-secondary-600 font-semibold">Yabancı Dil Kursu Kurucusu</p>
              </div>
            </div>
          </div>

          {/* Premium Card 3 */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Quote className="w-32 h-32 text-white" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-amber-400 bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                %100 Veli Memnuniyeti
              </span>
            </div>
            <p className="text-slate-200 text-sm mb-4 leading-relaxed font-medium relative z-10">
              &quot;Özel yetenek sınavlarına hazırladığım öğrencilerim çizimlerini anında yüklüyor, ben de sistem üzerinden detaylı kritik verebiliyorum. Hem ders odası hem ödev arşivi tek yerde. İnsanı içine çeken, muazzam akıcı bir platform!&quot;
            </p>
            <div className="flex items-center gap-3 border-t border-white/10 pt-3 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400 flex items-center justify-center font-extrabold border border-white/20">
                KD
              </div>
              <div>
                <p className="font-extrabold text-white text-sm">Kaan D.</p>
                <p className="text-xs text-slate-400">Güzel Sanatlar & Tasarım Atölyesi</p>
              </div>
            </div>
          </div>

          {/* Quick interactive prompt linking to full comments */}
          <div className="text-center pt-2">
            <Link href="#yorumlar" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4 transition-colors">
              Tüm canlı ziyaretçi yorumlarını ve değerlendirmeleri inceleyin <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="ozellikler" className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Neden Akademi Pro?</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Her alanda eğitim veren profesyoneller için tasarlanmış, uçtan uca eğitim yönetim platformu.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <Monitor className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Canlı Sanal Sınıflar</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Kamera, mikrofon ve ekran paylaşımlı Zoom kalitesinde online dersler. Katılımcı yönetimi ve soru çözüm modülü dahil.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-green-200 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ödeme & Fatura Takibi</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Online ve nakit ödemeleri tek yerden yönetin. Otomatik fatura oluşturma, komisyon takibi ve gelir raporları.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Akıllı Ders Programı</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Haftalık plan oluşturun, özel işlerinizi ekleyin, geçmiş haftalara arşivden ulaşın. Akşam derslerine özel destek.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Anlık Mesajlaşma</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Öğrenci, veli ve gruplarla güvenli mesajlaşma. Dosya paylaşımı, sesli arama ve ders hatırlatma bildirimleri.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Veli-Öğretmen Bağlantısı</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Veli ve öğrenci hesapları otomatik bağlanır. Veliler çocuklarının ilerlemesini, ödevlerini ve ödemelerini takip eder.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-red-200 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ödev & Soru Çözüm</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Öğrenciler çözüm fotoğrafı yükler, öğretmenler anında doğru/yanlış geri bildirimi verir. Tüm süreç kayıt altında.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Hemen Ücretsiz Deneyin</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Kredi kartı gerekmez. 1 ay boyunca tüm özellikleri ücretsiz kullanın.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/register" className="bg-white text-primary-600 px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg">
                Ücretsiz Kayıt Ol
              </Link>
              <Link href="/login" className="border-2 border-white/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">
                Demo ile Dene
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeComments />

      <NewsletterSignup />

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-6 sm:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-primary-600 mb-3">
              <BookOpen className="w-5 h-5" />
              <span className="font-bold text-lg">Akademi Pro</span>
            </div>
            <p className="text-sm text-slate-500">
              Eğitmenler, öğrenciler ve veliler için uçtan uca eğitim yönetim platformu.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ürün</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#ozellikler" className="hover:text-primary-600">Özellikler</Link></li>
              <li><Link href="#yorumlar" className="hover:text-primary-600">Kullanıcı yorumları</Link></li>
              <li><Link href="/register" className="hover:text-primary-600">Ücretsiz başla</Link></li>
              <li><Link href="/login" className="hover:text-primary-600">Giriş yap</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Yasal</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/gizlilik" className="hover:text-primary-600">Gizlilik Politikası (KVKK)</Link></li>
              <li><Link href="/kullanim-kosullari" className="hover:text-primary-600">Kullanım Koşulları</Link></li>
              <li><Link href="/iletisim" className="hover:text-primary-600">İletişim</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Destek</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="mailto:destek@akademipro.tr" className="hover:text-primary-600">destek@akademipro.tr</a></li>
              <li><Link href="/iletisim" className="hover:text-primary-600">Bize ulaşın</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Akademi Pro. Tüm hakları saklıdır.</p>
          <p>Türkiye&apos;de tasarlandı ve geliştirildi.</p>
        </div>
      </footer>

      <CookieConsent />
    </main>
  );
}
