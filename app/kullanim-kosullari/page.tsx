import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Akademi Pro",
  description: "Akademi Pro platformunun kullanım koşulları ve hizmet şartları.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Kullanım Koşulları"
      subtitle="Akademi Pro platformunu kullanmadan önce lütfen aşağıdaki şartları dikkatlice okuyun."
      updatedAt="8 Mayıs 2026"
    >
      <p>
        Akademi Pro (&quot;Platform&quot;) hizmetlerini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Bu
        koşullar, eğitmen, öğrenci ve velinin Platform üzerindeki hak ve yükümlülüklerini düzenler.
      </p>

      <h2>1. Hizmetin Tanımı</h2>
      <p>
        Platform; eğitmenlerin ders programını yönetmesi, ders odaları açması, öğrenciler ve velilerle
        iletişim kurması, ödeme talebi oluşturması ve gelir takibi yapması amacıyla geliştirilmiştir.
        Platform <strong>ödeme aracılığı yapmaz</strong>; ödeme bilgileri yalnızca tarafların
        görüntülenmesi için saklanır ve havale/EFT taraflar arasında doğrudan gerçekleştirilir.
      </p>

      <h2>2. Hesap Oluşturma</h2>
      <ul>
        <li>18 yaşından küçük kullanıcılar yalnızca veli onayı ile hesap oluşturabilir.</li>
        <li>Hesap bilgilerinin güvenliğinden Kullanıcı sorumludur. Şüpheli işlem fark ettiğinizde derhal bildirin.</li>
        <li>Yanlış veya yanıltıcı bilgi vermek hesabınızın askıya alınmasına yol açabilir.</li>
      </ul>

      <h2>3. Kullanıcı Yükümlülükleri</h2>
      <ul>
        <li>Platformu yalnızca yasal amaçlar için kullanmak.</li>
        <li>Diğer kullanıcılara saygılı davranmak; taciz, hakaret veya istismar içeren içerik göndermemek.</li>
        <li>Telif hakkı ihlali, dolandırıcılık, kötü amaçlı yazılım dağıtımı gibi davranışlardan kaçınmak.</li>
        <li>Vergi yükümlülüklerini kendi adına yerine getirmek (Platform bu konuda kesinti yapmaz).</li>
      </ul>

      <h2>4. İçerik Sahipliği</h2>
      <p>
        Platforma yüklediğiniz dosya, mesaj ve materyallerin telif hakkı size aittir. Platform, hizmetin
        sunulması için bu içerikleri sınırlı kapsamda kullanma hakkına sahiptir (ör. mesaj iletimi,
        yedekleme, görüntüleme).
      </p>

      <h2>5. Hizmet Düzeyi ve Değişiklikler</h2>
      <p>
        Platform, kesintisiz erişim için makul çabayı gösterir; ancak %100 kesintisiz çalışma garanti
        edilmez. Hizmet özellikleri zaman zaman güncellenebilir; önemli değişikliklerde önceden bildirim
        yapılır.
      </p>

      <h2>6. Ödemeler</h2>
      <p>
        Eğitmen-veli arasındaki ücretlendirme tamamen taraflar arasındadır. Platform; havale/EFT yapılmasını
        kolaylaştırmak amacıyla IBAN bilgisini saklar ve gösterir. Ödeme uyuşmazlıklarında Platform aracılık
        etmez; ancak işlem geçmişine ait kayıtları talep üzerine yetkili mercilere sunar.
      </p>

      <h2>7. Sorumluluğun Sınırlandırılması</h2>
      <p>
        Yasanın izin verdiği azami ölçüde, Platform; dolaylı zararlardan, kar kaybından, veri kaybından veya
        üçüncü taraf eylemlerinden sorumlu tutulamaz.
      </p>

      <h2>8. Hesap Kapatma</h2>
      <p>
        Hesabınızı dilediğiniz zaman <a href="/iletisim">İletişim sayfası</a> üzerinden kapatabilirsiniz.
        Kapatma sonrası verilerinizin saklanma ve silinmesi için lütfen{" "}
        <a href="/gizlilik">Gizlilik Politikası</a>&apos;na bakın.
      </p>

      <h2>9. Uygulanacak Hukuk</h2>
      <p>
        Bu koşullara ilişkin uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır. Tüketici sıfatına sahip
        Kullanıcılar için tüketici hakem heyetleri ve tüketici mahkemeleri yetkilidir.
      </p>

      <h2>10. İletişim</h2>
      <p>
        Sorularınız ve geri bildirimleriniz için <a href="/iletisim">İletişim sayfası</a>&apos;ndan bize
        ulaşabilirsiniz.
      </p>
    </LegalLayout>
  );
}
