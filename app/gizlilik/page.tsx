import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | EduCoach",
  description:
    "EduCoach platformunun gizlilik politikası, kişisel verilerin işlenmesi ve KVKK aydınlatma metni.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Gizlilik Politikası ve KVKK Aydınlatma Metni"
      subtitle="EduCoach olarak gizliliğinize değer veriyoruz."
      updatedAt="8 Mayıs 2026"
    >
      <p>
        Bu Gizlilik Politikası, EduCoach platformunu (&quot;Platform&quot;) kullanan ziyaretçi, öğrenci, veli ve
        eğitmenlerin (&quot;Kullanıcı&quot;) kişisel verilerinin nasıl toplandığını, işlendiğini, saklandığını ve
        korunduğunu açıklar. 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri
        sorumlusu olarak hareket etmekteyiz.
      </p>

      <h2>1. Veri Sorumlusu</h2>
      <p>
        Veri sorumlusu: EduCoach (örnek tüzel kişi adı). Tebligat adresi ve iletişim bilgileri{" "}
        <a href="/iletisim">İletişim sayfasında</a> yer almaktadır.
      </p>

      <h2>2. Topladığımız Veriler</h2>
      <ul>
        <li>
          <strong>Kimlik ve iletişim bilgileri:</strong> Ad, soyad, e-posta adresi, telefon, şehir.
        </li>
        <li>
          <strong>Hesap bilgileri:</strong> Profil kodu, rol (öğretmen/öğrenci/veli), şifre özeti, profil
          fotoğrafı.
        </li>
        <li>
          <strong>Eğitim verileri:</strong> Ders programı, oda kayıtları, mesajlar, ödev/dosya yüklemeleri.
        </li>
        <li>
          <strong>Ödeme bilgileri:</strong> IBAN, banka adı, hesap sahibi, ödeme talep ve geçmişi (Platform
          ödeme aracılık etmez; bilgileri yalnızca tarafların görüntülemesi için saklar).
        </li>
        <li>
          <strong>Vergi bilgileri:</strong> TC Kimlik, vergi dairesi, vergi numarası (yalnızca eğitmenin
          rızası ile, gelir raporlaması için).
        </li>
        <li>
          <strong>Teknik veriler:</strong> IP adresi, tarayıcı bilgisi, cihaz türü, oturum çerezleri.
        </li>
      </ul>

      <h2>3. İşleme Amaçları</h2>
      <ul>
        <li>Hizmetin sunulması (hesap oluşturma, giriş, ders takibi, mesajlaşma, bildirim).</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, KVKK, talep ve şikayetlerin yanıtlanması).</li>
        <li>Sistem güvenliğinin sağlanması, dolandırıcılık ve kötüye kullanımın önlenmesi.</li>
        <li>Hizmet kalitesinin geliştirilmesi (anonimleştirilmiş kullanım istatistikleri).</li>
      </ul>

      <h2>4. Hukuki Sebepler</h2>
      <p>
        Verileriniz; sözleşmenin kurulması veya ifası için zorunlu olması (m.5/2-c), hukuki yükümlülüğün
        yerine getirilmesi (m.5/2-ç), meşru menfaatimizin korunması (m.5/2-f) ve açık rıza (m.5/1) hukuki
        sebeplerine dayanılarak işlenir.
      </p>

      <h2>5. Veri Saklama Süresi</h2>
      <p>
        Verileriniz, hesabınız aktif olduğu sürece ve yasal saklama süreleri boyunca tutulur. Hesap kapatma
        talebinizde, yasal saklama yükümlülüğü olmayan veriler en fazla 30 gün içinde silinir veya
        anonimleştirilir.
      </p>

      <h2>6. Veri Aktarımı</h2>
      <p>
        Üçüncü tarafları yalnızca hizmetin sunulması için, gerekli güvenlik önlemleri alınarak kullanırız:
      </p>
      <ul>
        <li>
          <strong>Resend:</strong> İşlemsel e-posta gönderimi.
        </li>
        <li>
          <strong>Vercel:</strong> Uygulama barındırma altyapısı (AB veri merkezleri).
        </li>
        <li>
          <strong>Supabase</strong> (planlanan): Veritabanı ve kimlik doğrulama.
        </li>
      </ul>

      <h2>7. Çerezler</h2>
      <p>
        Oturum yönetimi ve tercihlerinizin hatırlanması için çerez kullanırız. Reklam veya üçüncü taraf
        analitik çerezi kullanmıyoruz. Tarayıcınızdan çerezleri her zaman silebilirsiniz.
      </p>

      <h2>8. KVKK Kapsamındaki Haklarınız</h2>
      <p>KVKK m. 11 uyarınca aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme.</li>
        <li>İşlenen veriler hakkında bilgi talep etme.</li>
        <li>İşlenme amacını ve buna uygun kullanılıp kullanılmadığını öğrenme.</li>
        <li>Verilerin yurt içinde/dışında aktarıldığı üçüncü kişileri bilme.</li>
        <li>Eksik/yanlış işlenmişse düzeltilmesini isteme.</li>
        <li>Silinmesini veya yok edilmesini isteme.</li>
        <li>Otomatik sistemlerle aleyhinize çıkan sonuca itiraz etme.</li>
        <li>Zarar halinde tazminat talep etme.</li>
      </ul>
      <p>
        Bu hakları kullanmak için <a href="/iletisim">İletişim</a> sayfasındaki adres üzerinden bizimle
        iletişime geçebilirsiniz. Talebinize en geç 30 gün içinde yanıt verilir.
      </p>

      <h2>9. Çocukların Gizliliği</h2>
      <p>
        18 yaşından küçük öğrenciler için kayıt, veli onayı ile yapılır. Veli, öğrencinin verilerinin
        işlenmesine ilişkin sorumluluğu kabul eder.
      </p>

      <h2>10. Politika Değişiklikleri</h2>
      <p>
        Bu politika gerektiğinde güncellenebilir. Önemli değişikliklerde kullanıcılar e-posta veya uygulama
        içi bildirim ile bilgilendirilir.
      </p>
    </LegalLayout>
  );
}
