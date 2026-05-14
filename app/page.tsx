import Link from 'next/link';
import { BookOpen, Users, Video, Star, Shield, CreditCard, MessageCircle, Calendar, Monitor } from 'lucide-react';
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

        {/* Right Side - Testimonials */}
        <div className="space-y-4">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-slate-600 text-sm mb-4 italic leading-relaxed">&quot;Yıllardır WhatsApp gruplarından ders programı paylaşıyordum, velilerle ödeme konusunda sıkıntı yaşıyordum. Akademi Pro&apos;ya geçeli 2 ay oldu, hayatım değişti. Her şey tek yerde.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">F</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Fatma K.</p>
                <p className="text-xs text-slate-500">Özel Ders Öğretmeni • 8 yıllık deneyim</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-slate-600 text-sm mb-4 italic leading-relaxed">&quot;Oğlumun öğretmeni bu sistemi kullanıyor. Ders saatlerini, ödevleri ve ödeme durumunu tek ekrandan görebiliyorum. Veliler için gerçekten pratik.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center font-bold">E</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Emre B.</p>
                <p className="text-xs text-slate-500">Veli • Bursa</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-slate-600 text-sm mb-4 italic leading-relaxed">&quot;Piyano dersi veriyorum, hem yüz yüze hem online. Eskiden Zoom ve Excel ayrı ayrıydı, şimdi tek platformda ders odası açıp ödememi de takip ediyorum.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">D</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Deniz A.</p>
                <p className="text-xs text-slate-500">Müzik Eğitmeni • İzmir</p>
              </div>
            </div>
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
                Hesabına Giriş Yap
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
