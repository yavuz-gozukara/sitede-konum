# Bölge Avcısı — Konum Tabanlı Sanal Para Toplama Oyunu

## Ne yapar

- Oyuncu bir takma isim girer, konum bonusunu (GPS varsa hassas, yoksa IP tahmini) toplar
- Toplanan sanal parayla site içinde slot oyunu oynar (gerçek para yok, yatırma/çekme yok)
- `/admin.html` sayfasında, şifreyle korunan bir panelden tüm oyuncuların takma adı, şehri ve
  bakiyesi liste halinde görülebilir

## Kurulum

### 1. Upstash Redis (daha önce kurduysan aynısını kullanabilirsin)

- https://upstash.com üzerinden ücretsiz veritabanı oluştur
- `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` değerlerini al

### 2. Vercel ortam değişkenleri

Projeyi Vercel'e bağladıktan sonra **Settings → Environment Variables** kısmına ekle:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ADMIN_SECRET` — admin paneline giriş şifren, kendin belirle (örn. `guclu-bir-sifre-123`)
  Bunu kimseyle paylaşma; admin panelindeki tüm oyuncu listesine bu şifreyle erişiliyor.

### 3. Deploy et, admin paneline gir

- Site: `https://siten.vercel.app`
- Admin panel: `https://siten.vercel.app/admin.html` → `ADMIN_SECRET` olarak belirlediğin şifreyi gir

## Önemli notlar

- Oyuncuların konumu şehir/ülke seviyesinde tutulur, admin panelinde de bu seviyede gösterilir
- Sitede oyunculara konumun bölge bonusu için kullanıldığını belirten bir bilgi metni zaten var
  (üstteki mavi banner) — bunu kaldırmaman önerilir, şeffaflık hem kullanıcı güveni hem de
  KVKK açısından önemli
- `ADMIN_SECRET`'ı düzenli aralıklarla değiştirmen, admin sayfasının linkini herkese açık
  paylaşmaman önerilir
