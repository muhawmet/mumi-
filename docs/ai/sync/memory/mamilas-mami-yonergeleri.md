---
name: mamilas-mami-yonergeleri
description: "Mami'nin MAMILAS üretiminde verdiği yönergeler — ürün, karakter, cast, motion, teslim, revize kuralları."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0b4a7c89-f6c0-4d85-8a52-503440509ec0
  modified: 2026-07-26T07:49:54.239Z
---

Mami'nin (Muhammet) doğrudan verdiği yönler. Mikro zanaat değil — **onun kararları**. Zanaatı işi yaptıkça öğren.

**ÜRÜN:** Premium okullara satılıyor → **öğreticilik VE show ikisi de kusursuz**. "Çok öğretici ama show yok, kusursuzlar ama çok sadeler" = kabul edilmez. Boş/beyaz arka plan yasak.

**START FRAME HER ŞEYİ TAŞIR (en kritik):** *"Kling sonradan bir şey üretmede çok kötü. Kareye yeni karakter, yazı falan aldığında bozuk çıkarıyor. O yüzden start frame'de yaşıyoruz tamamen."* → Motion'da **yeni öğe doğurtma** (sonradan giren çocuk, beliren yazı, yeni nesne). Sahnede ne olacaksa **start frame'de zaten var** olacak; motion yalnız var olanı canlandırır. Bu yüzden start frame'ler show'u tam kurar. (Sürtünme temiz çıktı; Bileşke'de bu yüzden morphing oldu.)

**KARAKTER:** Her kareye sıkıştırma — **50-50**, olması gereken sahnede görünsün. Tekrar eden karakter/hero-prop → `@tag` (Magnific auto-tag'liyor): @efe, @mira, @ali, @can, @araba, @kitap. Tag adaptif ol ama **her ufak nesneye tag açma**. 2+ karede görünen belirgin nesne = tag adayı, üretimden ÖNCE.

**CAST:** Türk/Anadolu — **siyahi/asyalı yok** (Türkiye okullarında yok), arka plan çocukları dahil. **Yaş sınıfa uysun** (6. sınıf = ~11-12, minik çocuk değil).

**YAZI:** Türkçe veya boş, **İngilizce yok**. Gereksiz dekoratif tabela yok. Bulanık/okunmayan arka plan yazısına takılma; **net okunan** yanlışı düzelt.

**ON-SCREEN TEXT NEDEN YASA (2026-07-26, Mami açıkladı):** Mami **After Effects bilmiyor**, Premiere'i şu an öğreniyor → **post-prodüksiyonda yazı katmanı YOK**. Yazı karede doğacak, karede bitecek. Bu yüzden "yazıyı hiç bozmama" bir tercih değil, **AE'nin yerine geçen yeteneğimiz**: PNG indir → resmi tarat → yazı hiç bozulmaz akışı, rakiplerin (motion prompt'unu düz ChatGPT'ye atıyorlar) yapamadığı şey. Sonuç: yazıyı post'a bırakan hiçbir tarif kabul edilmez, motion yazı bölgesine dokunmaz (warp/parallax/kayma yok), yazı revizyonu = kareyi yeniden üret.

**MOTION:** Kamera **film gibi ama ölçülü** — klişe "slowly push in" sıkıcı, sahneye yakışmayan abartı da olmaz. **Kamera + VO beraber anlatır, karakter gözlemci.** Sahneler arası **ahengi yönetmen planlar** (Mami Premiere'i iyi bilmiyor). **Süre = VO okuma + baş/tail** (JSON'a kilitlenme). **Ses yok, ağız kilitli** — ekranda kimse konuşmaz (VO'yu Mami ElevenLabs'te kendi yapıyor).

**REVİZE:** *Sahne bozuksa* → baştan üret. *Küçük şey (sayı/yazı/renk/tek öğe)* → **resimden revize** ("use this referenced image, change ONLY…"). Node `###` ayracıyla çeker.

**SÜREÇ:** **Tek geçiş** — kareye bir kez bak, aynı geçişte motion + varsa revizeyi yaz. Aynı kareleri tekrar tekrar açma. **Görmediğin kareye motion yazma.**

**TESLİM:** Windows'ta **`.txt`** (`.md` uğraştırıyor), prompt blokları ``` fence'siz, **tek parça yapıştırmaya hazır**, birleşik (motion+kamera+negatif akan tek metin).

İlişkili: [[mamilas-uretim-akisi]] · [[mamilas-command-json-blokajlari]]
