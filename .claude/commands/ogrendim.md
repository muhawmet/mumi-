---
description: Bu oturumda öğrenilenleri Mami'ye numaralı liste hâlinde sor, seçtiklerini ana hafızaya taşı
allowed-tools: Bash(node scripts/ogrendim.mjs:*), Read, Edit
---

# /ogrendim — oturum kapanışında hüküm devri

Mami'nin tarifi (2026-08-07): *"her sohbetin okuduğu bir hafıza olacak. Ben seninle
konuşurken hafızacık.txt gibi bir şey oluşturacaksın, gerekenleri yazacaksın; doğru
dediğim bakacağım, 'tamam bunlar iyi' diyeceğim, ana hafızaya taşıyacaksın."*

İki yer var:
- **hafızacık** → `artifacts/ogrendiklerim.md` — oturum içinde, hüküm düştüğü an yazılır
- **ana hafıza** → `agents/OLCULENLER.md` — `CLAUDE.md`'den `@` ile çekilir, HER yeni
  sohbette otomatik yüklenir

## Şimdi ne yap

1. Defteri oku ve Mami'ye sun:

```
node scripts/ogrendim.mjs sor
```

2. 🔴 **Defter boşsa orada durma.** Bu oturumda öğrenilen bir şey mutlaka vardır ve
   yazılmamış olması senin kusurundur. Konuşmayı baştan tara ve şunları çıkar:
   - Mami'nin verdiği yeni kural ya da düzeltme (kendi cümlesiyle)
   - Gerçek kare/klip üstünde ölçülen motor davranışı
   - Bir aracın yalan söylediği yer
   Sonra her birini deftere yaz, sonra tekrar `sor`:

```
node scripts/ogrendim.mjs yaz "<hüküm>" --kanit "<ölçüm>" --bolum motion|prompt|dunya|cuzdan|kod
```

3. Listeyi Mami'ye **numaralı ve kısa** ver — telefonda okunacak. Her madde tek satır,
   uzun gerekçe yok. Sonra tek soru sor: **"Hangileri boş?"**

4. Cevabı geldiğinde taşı:

```
node scripts/ogrendim.mjs tasi --at 1,3        # bunlar düşer, kalan ana hafızaya
node scripts/ogrendim.mjs tasi --tut 2,4,5     # yalnız bunlar kalır
```

5. Taşıma bitince commit + push et. Yazılan yasa gönderilmezse öbür makine onsuz çalışır.

## Süzgeç — ana hafızaya ne girer

Üç soru, üçü de EVET olmalı:
1. Gerçek kare/klip üstünde mi ölçüldü? (yeşil test ya da sezgi değil)
2. Bunu bilmeyen bir oturum **yanlış** iş üretir mi?
3. Opus 5 buna ihtiyaç duyar mı? Duymuyorsa yazılmaz — o dosya da bir çit olabilir.

## Kural

**Ana hafızaya YALNIZ Mami'nin seçtiği girer.** Otomatik promote yok. Bu hat tam olarak
onun için var: toplu hasat hattı (`agents/lessons/CANDIDATES-*`) 115 aday biriktirip
7 onay üretmişti — çünkü toplu ve geç soruyordu. Bu hat **taze ve tek tuş.**
