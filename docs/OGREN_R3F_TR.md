# React Three Fiber'i Kendi Kodundan Öğren

> Bu rehber senin için yazıldı Muhammet. Bugün Claude uygulamana bir 3D "kabuk"
> (sahne katmanı) ekledi. Amaç: o kodun **ne yaptığını** ve **neden öyle
> yazıldığını** anlaman. Her örnek uydurma değil — hepsi `src/scene/` altındaki
> kendi dosyalarından alıntı. Oku, dene, boz, geri al. En iyi öğrenme bu.

---

## İçindekiler

1. [Büyük resim: tarayıcıda 3D nasıl çalışır](#1-büyük-resim)
2. [Kendi dosyalarının tur rehberi](#2-kendi-dosyalarının-tur-rehberi)
3. [Kavram sözlüğü](#3-kavram-sözlüğü)
4. [Bugünün mimari dersleri](#4-bugünün-mimari-dersleri)
5. [Kendi başına 5 mini alıştırma](#5-kendi-başına-5-mini-alıştırma)
6. [Sonraki öğrenme adımları](#6-sonraki-öğrenme-adımları)

---

## 1. Büyük Resim

### Zincir: WebGL → three.js → React Three Fiber

Tarayıcıda 3D üç katmandan oluşur. Her katman bir alttakini "insan diline" çevirir:

```
   Senin kodun (R3F, JSX)
          │  "React bileşeni gibi <mesh> yaz"
          ▼
   three.js (JavaScript kütüphanesi)
          │  "sahne, kamera, ışık, geometri nesneleri"
          ▼
   WebGL (tarayıcı API'si)
          │  "ekran kartına gönderilen ham çizim komutları"
          ▼
   GPU (ekran kartı) → ekrandaki pikseller
```

**WebGL** nedir? Tarayıcının ekran kartıyla (GPU) konuşmasını sağlayan düşük
seviyeli bir API. Çok güçlü ama çok çıplak: bir üçgeni ekrana çizmek için bile
onlarca satır matris matematiği yazman gerekir. Kimse doğrudan WebGL yazmak
istemez.

**three.js** nedir? WebGL'in üstüne kurulmuş bir JavaScript kütüphanesi. Sana
`Mesh`, `Camera`, `PointLight` gibi hazır nesneler verir. "Şu küpü şuraya koy,
şu ışığı yak" dersin, three.js gereken WebGL komutlarını kendisi üretir. Bugünkü
kodun aslında hep three.js nesneleri kullanıyor — sen sadece onları React
diliyle yazıyorsun.

**React Three Fiber (R3F)** nedir? three.js'i **React bileşeni gibi** yazmanı
sağlayan bir köprü. Normal three.js'te şöyle yazardın:

```js
// saf three.js (bunu YAZMIYORSUN, sadece karşılaştırma için)
const geometry = new THREE.BoxGeometry(1.1, 1.55, 0.03);
const material = new THREE.MeshStandardMaterial({ color: '#e8ddc8' });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

R3F'te aynı şey senin `DioramaStage.tsx` dosyanda şöyle:

```tsx
<mesh castShadow>
  <boxGeometry args={[1.1, 1.55, 0.03]} />
  <meshStandardMaterial color={LOOK.palette.paper} roughness={0.85} metalness={0.05} />
</mesh>
```

Fark ne? İkinci hali **bildirimsel** (declarative): "ne istediğini" yazıyorsun,
"nasıl kurulacağını" değil. Tıpkı React'te `<button>` yazıp DOM manipülasyonuyla
uğraşmadığın gibi. R3F'in kuralı basit: three.js'teki her sınıf, küçük harfle
başlayan bir JSX etiketi olur. `THREE.Mesh` → `<mesh>`, `THREE.BoxGeometry` →
`<boxGeometry>`, `THREE.PointLight` → `<pointLight>`.

### Neden R3F?

Çünkü zaten React biliyorsun. State değişince ekran güncelleniyor, bileşenleri
parçalara bölüyorsun, prop geçiyorsun — bu alışkanlıkların 3D'de de aynen
çalışıyor. `FloatingCard` senin yazdığın bir bileşen; onu dört kez farklı
prop'larla çağırıyorsun, tıpkı normal bir React kartı gibi. 3D dünyası birden
"React'in bildiğin dünyası" haline geliyor.

---

## 2. Kendi Dosyalarının Tur Rehberi

`src/scene/` klasöründe yedi dosya var. Sıra önemli: dıştan içe gidelim — önce
"3D açılsın mı?" kararını veren dosyalar, sonra sahnenin içi.

### `webglSupport.ts` — "3D'yi açmalı mıyım?" bekçisi

Bu dosyada hiç 3D yok. Sadece **karar mantığı**: tarayıcı 3D'yi düzgün
çalıştırabilir mi?

```ts
export function detectWebGL(
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas'),
): boolean {
  try {
    const canvas = createCanvas();
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
```

Kritik satır: `canvas.getContext('webgl2') || canvas.getContext('webgl')`. Görünmez
bir canvas oluşturup ondan bir WebGL "context" istiyor. Alabilirse → tarayıcı 3D
destekliyor. Alamazsa → `false` döner ve uygulama 3D'yi hiç açmaz. Önce `webgl2`
(yeni sürüm), yoksa eski `webgl` deneniyor.

İkinci önemli fonksiyon `isSoftwareRenderer`. Bazı ortamlarda WebGL "var" görünür
ama aslında ekran kartı yerine **işlemci** (CPU) çiziyordur — SwiftShader, llvmpipe
gibi. Bu o kadar yavaştır ki:

```ts
return /swiftshader|llvmpipe|software/i.test(renderer);
```

Ekran kartının adını okuyup içinde bu kelimeler geçiyorsa "yazılımsal renderer"
diyor ve 3D'yi kapatıyor. Yorumdaki kanıt çarpıcı: *"50ms setInterval → 1200ms
drift"* — yani yazılımsal render ana thread'i o kadar tıkıyor ki 50 milisaniyelik
zamanlayıcı 1.2 saniye gecikiyor. Uygulamanın kalbi (Final Brief üretimi) buna
kurban edilemez.

**Değiştirirsen ne olur:** `resolveSceneMode` fonksiyonunda URL kuralları var.
Tarayıcıda `?scene=off` yazarsan 3D tamamen kapanır (kill switch). `?scene=force`
yazarsan yazılımsal renderer'da bile zorla açılır (görsel kanıt ekran görüntüsü
almak için). Bunları denemek için kodu değiştirmene bile gerek yok — sadece adres
çubuğuna ekle.

### `SceneLayer.tsx` — "3D'yi sayfaya as ama incecik"

Bu, `AppLayout`'un çağırdığı bileşen. İşi: bekçiye danış, "evet" derse 3D
tuvalini sayfaya as.

```tsx
const SceneCanvas = lazy(() => import('./SceneCanvas'));
```

Bu satır altın değerinde. `lazy(...)` R3F ve three.js kodunu **ayrı bir dosyaya
(chunk) böler** ve ancak gerçekten 3D açılacaksa indirir. three.js büyük bir
kütüphanedir (yüz kilobaytlar). WebGL'i olmayan bir kullanıcı bu koca dosyayı
boşuna indirmez. Sayfa hızlı açılır.

İkinci kritik parça — sahnenin sayfadaki konumu:

```tsx
<div
  data-testid="scene-layer"
  aria-hidden
  style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
>
```

Her kelimeyi tek tek oku, çünkü hepsi bilinçli:
- `position: 'fixed'` + `inset: 0` → tüm ekranı kaplar, kaydırınca yerinde kalır.
- `zIndex: 0` → en arkada durur; menüler, kartlar hep önünde.
- **`pointerEvents: 'none'`** → bu en önemlisi. 3D katman fareyi/tıklamayı
  **hiç yakalamaz**. Tıklamalar sanki o katman yokmuş gibi altındaki gerçek
  butonlara geçer. 3D bir dekor; kullanıcı onunla "etkileşmez", sadece görür.
- `aria-hidden` → ekran okuyucular bu dekoratif katmanı görmezden gelir.

Üçüncü satır — güvenlik supabı:

```tsx
if (!on) return null;
```

`on` state'i `null` (henüz karar verilmedi) ya da `false` (3D kapalı) ise bileşen
**hiçbir şey render etmez**. 3D olmadan uygulama %100 çalışır. Yorumdaki spec bunu
söylüyor: *"Final Brief asla 3D'ye rehin olmaz."*

### `SceneCanvas.tsx` — sahnenin çatısı (`<Canvas>`)

İşte R3F'in kalbi burada başlıyor. `<Canvas>` bileşeni, three.js'in tüm
kurulumunu (sahne, renderer, animasyon döngüsü) senin yerine yapar.

```tsx
<Canvas
  dpr={[1, 2]}
  shadows
  camera={{ position: [6.5, 4.2, 8.5], fov: 34, near: 0.1, far: 60 }}
  gl={{ antialias: true, powerPreference: 'high-performance' }}
  onCreated={({ gl }) => {
    gl.setClearColor(LOOK.clearColor);
  }}
>
```

Prop prop okuyalım:
- `dpr={[1, 2]}` → "device pixel ratio". Retina ekranda 2x keskinlik, ama en fazla
  2 (aksi halde 4K ekranlarda GPU boğulur). Alt/üst sınır çifti.
- `shadows` → gölgeleri aç. Bir ışığın `castShadow`, bir yüzeyin `receiveShadow`
  demesi ancak bu açıkken işe yarar.
- `camera={{ position: [6.5, 4.2, 8.5], fov: 34, ... }}` → başlangıç kamerası.
  Konum `[x, y, z]`: 6.5 sağda, 4.2 yukarıda, 8.5 önde. `fov` = 34 derece görüş
  açısı (dar açı = teleobjektif, sinematik). `near`/`far` = kameranın gördüğü en
  yakın/en uzak mesafe.
- `onCreated` → tuval kurulunca bir kez çalışır. Burada arka plan rengini
  `LOOK.clearColor`'dan (yani `#080705`, neredeyse siyah) alıyor.

`<Canvas>`'ın içindeki her şey artık 3D dünyasıdır:

```tsx
<fog attach="fog" args={[LOOK.fog.color, LOOK.fog.near, LOOK.fog.far]} />
<ContextLostGuard onContextLost={onContextLost} />
<CameraRig />
<DioramaStage />
<PostFX />
```

`<fog attach="fog" .../>` özel bir kalıp: bu bir nesne değil, sahnenin `fog`
özelliğine **bağlanır** (attach). Uzaktaki nesneler sise karışıp kaybolur —
derinlik ve gizem hissi verir. `args` = three.js'in `Fog` kurucusuna geçen
argümanlar: renk, yakın mesafe, uzak mesafe.

Ayrıca `ContextLostGuard` var — GPU bazen "context kaybı" yaşar (sürücü
çökmesi, sekme uyuması). Bu bileşen o olayı dinler ve olursa 2D'ye düşer:

```tsx
gl.domElement.addEventListener('webglcontextlost', handle);
return () => gl.domElement.removeEventListener('webglcontextlost', handle);
```

`useEffect` içindeki `return` fonksiyonu dinleyiciyi **temizler**. Bileşen kalkınca
dinleyici de kalkar → hafıza sızıntısı olmaz. Bu React'te her zaman geçerli altın
kural.

### `lookConfig.ts` — tek görsel otorite (BURAYI SEV)

Bu dosya bir bileşen değil, **ayar dosyası**. Sahnenin bütün görsel kararları —
kamera açıları, sis rengi, bloom şiddeti, palet — tek yerde toplanmış. Diğer
dosyalar sadece buradan **okur**, kendi başlarına renk/şiddet uydurmaz.

İki büyük parça var. Birincisi kamera açıları:

```ts
export const CAMERA_POSES: Record<Step, CameraPose> = {
  dashboard: { position: [6.5, 4.2, 8.5], target: [0, 1.1, 0], fov: 34 },
  director:  { position: [3.6, 2.6, 7.2], target: [0.6, 1.2, 0], fov: 32 },
  recipe:    { position: [-5.4, 3.2, 6.4], target: [-0.4, 1.0, 0], fov: 34 },
  ...
};
```

Uygulamandaki her ekranın (dashboard, director, recipe...) kameranın dioramaya
**hangi açıdan baktığını** burada tanımlıyor. Kullanıcı "recipe" sekmesine
geçince kamera yumuşakça o poza kayar. `position` = kamera nerede, `target` =
neye bakıyor, `fov` = ne kadar geniş açı.

İkinci parça görsel ayarlar:

```ts
export const LOOK = {
  fog: { color: '#0b0a08', near: 9, far: 26 },
  clearColor: '#080705',
  bloom: { intensity: 0.35, luminanceThreshold: 0.72, luminanceSmoothing: 0.2 },
  vignette: { offset: 0.28, darkness: 0.82 },
  grain: { opacity: 0.16 },
  chromaticAberration: { offset: 0.0012 },
  cameraDamp: 2.2,
  palette: {
    gold: '#f7c948',
    amber: '#d6a84f',
    paper: '#e8ddc8',
    ink: '#0a0c14',
    floor: '#141210',
  },
} as const;
```

Dosyanın en sonundaki güvenlik fonksiyonu da güzel bir ders:

```ts
export function cameraPoseFor(step: Step): CameraPose {
  return CAMERA_POSES[step] ?? CAMERA_POSES.dashboard;
}
```

`?? CAMERA_POSES.dashboard` = "eğer `step` diye bir poz yoksa dashboard pozunu
kullan". Yorumda diyor ki: tip sistemine göre bu imkânsız görünür, ama kayıtlı
(persist) bozuk bir değer gelirse kamera **asla tanımsız bir yere düşmemeli**.
Savunmacı programlama — Upwork müşterileri bunu sever.

**Değiştirirsen ne olur (hepsi güvenli, tek dosya):**
- `bloom.intensity`'yi `0.35` yerine `0.6` yap → altın ışıltı çok daha
  parlak/rüya gibi olur. `0.1` yap → neredeyse kapanır, sahne matlaşır.
- `fog.far`'ı `26` yerine `14` yap → sis çok daha yakında başlar, sahne
  daralır ve kasvetli olur. `60` yap → sis dağılır, her şey net görünür.
- `palette.gold`'u `#f7c948` yerine `#4ea3ff` (mavi) yap → lamba ve toz
  partiküllerinin rengi maviye döner, sıcak sahne soğur.
- Bir kamera pozunda `position`'ı değiştir, mesela `dashboard`'ı
  `[0, 12, 0.1]` yap → kamera tepeden kuşbakışı bakar.

Değişikliği kaydet, tarayıcı otomatik yenilenir (Vite HMR). Beğenmezsen eski
sayıyı geri yaz. Hiçbir şey bozulmaz.

### `CameraRig.tsx` — tek kamera otoritesi

Kamerayı **sadece** bu dosya oynatır. Başka hiçbir yer kameraya dokunmaz. Neden?
Çünkü iki farklı yer aynı anda kamerayı oynatmaya kalkarsa kavga çıkar, kamera
titrer. "Tek otorite" kuralı bunu engeller.

```tsx
export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const currentStep = useStudioStore((s) => s.currentStep);
  const targetRef = useRef(new Vector3(0, 1.1, 0));

  useFrame((_, delta) => {
    const pose = cameraPoseFor(currentStep);
    const lambda = LOOK.cameraDamp;

    camera.position.x = MathUtils.damp(camera.position.x, pose.position[0], lambda, delta);
    ...
```

Kritik kavramlar:
- `useThree((s) => s.camera)` → R3F'in verdiği kancayla sahnenin kamerasını al.
- `useStudioStore((s) => s.currentStep)` → **senin Zustand store'un**. Kullanıcı
  hangi sekmede? İşte 3D dünya ile uygulamanın geri kalanı burada buluşuyor. Sekme
  değişince kamera hareket ediyor.
- `useFrame((_, delta) => {...})` → bu fonksiyon **saniyede ~60 kez** çalışır. Her
  karede kamerayı hedefe biraz daha yaklaştırır. `delta` = son kareden bu yana
  geçen saniye.
- `MathUtils.damp(mevcut, hedef, lambda, delta)` → yumuşak geçiş sihri. Kamerayı
  hedefe **anında değil, üstel olarak** yaklaştırır. Yani ani zıplama değil,
  kayarak varış. `lambda` (burada `cameraDamp: 2.2`) hızı belirler: büyük sayı =
  hızlı yaklaşma, küçük sayı = tembel/yavaş.

Son parça — FOV değişimini sadece gerektiğinde yap:

```tsx
if (Math.abs(camera.fov - pose.fov) > 0.01) {
  camera.fov = MathUtils.damp(camera.fov, pose.fov, lambda, delta);
  camera.updateProjectionMatrix();
}
```

`updateProjectionMatrix()` pahalı bir işlem, o yüzden ancak FOV gerçekten
değişiyorsa (fark 0.01'den büyükse) çağrılıyor. Performans disiplini.

Dikkat: `return null;`. Bu bileşen ekrana **hiçbir şey çizmez**. Sadece bir yan
etki (kamerayı oynatmak) çalıştırır. R3F'te bu tamamen normaldir — bazı bileşenler
görünmez "mantık motorları"dır.

**Değiştirirsen ne olur:** `lookConfig.ts`'te `cameraDamp: 2.2`'yi `0.6` yap →
kamera sekmeler arası çok yavaş, tembel süzülür. `8` yap → neredeyse anında
zıplar. Kamerayı "hissetmenin" en iyi yolu bu sayıyla oynamak.

### `DioramaStage.tsx` — sahnenin içindeki her şey

En eğlenceli dosya. Zemin, masa, lamba, yüzen kartlar, toz, ışıklar — hepsi
burada. Diorama = küçük bir vitrin/maket sahnesi.

Önce yüzen kart bileşeni. Bir kart aslında **iki mesh'in** birleşimi (kağıt +
üstündeki mürekkep dörtgeni):

```tsx
<group ref={ref} position={position} rotation={[0, rotationY, 0]}>
  <mesh castShadow>
    <boxGeometry args={[1.1, 1.55, 0.03]} />
    <meshStandardMaterial color={LOOK.palette.paper} roughness={0.85} metalness={0.05} />
  </mesh>
  <mesh position={[0, 0, 0.02]}>
    <planeGeometry args={[0.94, 1.38]} />
    <meshStandardMaterial color={LOOK.palette.ink} roughness={1} />
  </mesh>
</group>
```

- `<group>` = birden çok nesneyi tek grup gibi taşımak/döndürmek için kapsayıcı
  (React'teki `<div>` gibi düşün, ama 3D'de). Grubu döndürürsen içindeki her şey
  birlikte döner.
- `<boxGeometry args={[1.1, 1.55, 0.03]}>` = 1.1 geniş, 1.55 yüksek, 0.03 kalın
  bir kutu → ince bir kart.
- `<meshStandardMaterial roughness={0.85} metalness={0.05}>` = malzeme. `roughness`
  (pürüzlülük) yüksek → mat, kağıt gibi. `metalness` (metaliklik) düşük → metal
  değil. Bu ikili gerçekçi ışık tepkisinin temelidir.

Kartın süzülmesi `useFrame` ile:

```tsx
useFrame(({ clock }) => {
  if (!ref.current) return;
  ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.6 + phase) * 0.12;
  ref.current.rotation.y = rotationY + Math.sin(clock.elapsedTime * 0.25 + phase) * 0.06;
});
```

`Math.sin(zaman)` -1 ile +1 arası salınan bir dalga. Onu `* 0.12` ile çarpınca
kart yukarı-aşağı 0.12 birim süzülür. Her kart farklı bir `phase` (faz kayması)
alır — bu yüzden hepsi aynı anda değil, dağınık/doğal hareket eder. Aynı numara
`rotation.y`'de: kart hafifçe sağa-sola sallanır.

Sonra lamba direği. Işığın kaynağını görsel yapan üç parça:

```tsx
<mesh position={[0, 3.3, 0]}>
  <sphereGeometry args={[0.16, 16, 16]} />
  <meshStandardMaterial color={LOOK.palette.gold} emissive={LOOK.palette.gold} emissiveIntensity={2.2} />
</mesh>
<pointLight position={[0, 3.3, 0]} color={LOOK.palette.gold} intensity={14} distance={12} decay={2} castShadow />
```

Önemli ayrım: **ampul topu ışık yaymaz.** `emissive` sadece o topu "kendi kendine
parlıyor gibi" gösterir — göze parlak görünür ama etraftaki nesneleri aydınlatmaz.
Asıl aydınlatmayı **aynı konumdaki `<pointLight>`** yapar. Yani bir ışık
kaynağını inandırıcı yapmak için ikisini birlikte kullanırsın: parlayan bir cisim
+ görünmez bir ışık. `pointLight` = tek noktadan her yöne yayılan ışık (ampul
gibi). `intensity` = güç, `distance` = ışığın eriştiği menzil, `decay` = uzaklıkla
sönme.

Sahnenin geri kalanı `DioramaStage` fonksiyonunda: zemin diski
(`<circleGeometry args={[9, 64]}>` — 9 yarıçaplı, 64 kenarlı = pürüzsüz daire),
stüdyo masası (kutu + dört bacak, bacaklar `.map` ile üretiliyor — normal React!),
dört yüzen kart, lamba, ve toz.

Toz için `drei` kütüphanesinden hazır bir bileşen:

```tsx
<Sparkles count={90} scale={[10, 5, 10]} position={[0, 2.2, 0]} size={1.6} speed={0.25} opacity={0.35} color={LOOK.palette.amber} />
```

`Sparkles` = havada süzülen ışıltı partikülleri. Kendin yazsan yüzlerce satır;
drei bir etiketle veriyor. `count` = kaç partikül, `speed` = hız.

En sonda ışıklar:

```tsx
<ambientLight intensity={0.22} color={LOOK.palette.paper} />
<directionalLight position={[-6, 8, 4]} intensity={0.5} color="#8fa3c2" castShadow />
```

- `ambientLight` = **yönü olmayan** genel dolgu ışığı. Her yeri eşit, hafifçe
  aydınlatır ki karanlık köşeler tamamen siyah olmasın. Gölge oluşturmaz.
- `directionalLight` = **paralel** ışınlar, güneş gibi. Uzaktan tek yönden gelir,
  gölge oluşturur (`castShadow`). Buradaki soğuk mavi (`#8fa3c2`) sıcak altın
  lambayla kontrast yaratıyor — sinematik renk dengesi.

Ve tüm sahne çok yavaş dönüyor:

```tsx
useFrame((_, delta) => {
  if (stage.current) stage.current.rotation.y += delta * 0.02;
});
```

`delta * 0.02` = saniyede 0.02 radyan, göz zar zor fark eder — "vitrindeki maket
usulca dönüyor" hissi. `delta` ile çarpmak önemli: bilgisayar hızı ne olursa olsun
dönüş hızı aynı kalır (60fps'te de 144fps'te de).

**Değiştirirsen ne olur:**
- `delta * 0.02`'yi `delta * 0.3` yap → diorama gözle görülür şekilde döner.
- `<Sparkles count={90}>`'ı `count={400}` yap → hava toz bulutuna döner.
- `ambientLight intensity={0.22}`'yi `1.5` yap → sahne aydınlanır, gizem kaybolur.
  `0` yap → sadece lamba ışığı kalır, çok karanlık ve dramatik olur.
- Beşinci bir `<FloatingCard position={[0, 3, 1]} rotationY={0} phase={3} />`
  ekle → yeni bir kart belirir. Sahneye kendi nesneni katmayı böyle öğrenirsin.

### `PostFX.tsx` — sinema sonrası işleme (post-processing)

Sahne çizildikten **sonra** bütün görüntüye uygulanan efektler. Fotoğrafı çekip
sonra filtre atmak gibi. `EffectComposer` bunları sıraya dizer:

```tsx
<EffectComposer>
  <Bloom intensity={LOOK.bloom.intensity} luminanceThreshold={LOOK.bloom.luminanceThreshold} luminanceSmoothing={LOOK.bloom.luminanceSmoothing} mipmapBlur />
  <ChromaticAberration offset={chromaticOffset} />
  <Noise opacity={LOOK.grain.opacity} />
  <Vignette offset={LOOK.vignette.offset} darkness={LOOK.vignette.darkness} />
</EffectComposer>
```

- `Bloom` = parlak yerler etrafa taşar, ışıldar (lamba, altın yüzeyler).
  `luminanceThreshold` = "ne kadar parlak olursa bloom'a girsin" eşiği.
- `ChromaticAberration` = ucuz lens gibi renkleri kenarlarda hafif kaydırır.
  Çok az (`0.0012`) — "gerçek kamera" hissi katar, abartılırsa baş ağrıtır.
- `Noise` = film grenini/kumu. Dijital "temizliği" kırar, analog/yağlıboya doku.
- `Vignette` = kenarları karartır, gözü merkeze çeker. Sinema klasiği.

Dikkat: bütün sayılar `LOOK`'tan geliyor. PostFX kendi başına hiçbir şey uydurmuyor.
Tek otorite kuralı burada da işliyor.

**Değiştirirsen ne olur:** en dramatik oyuncak `Vignette`. `darkness`'ı `0.82`'den
`0.98` yap → kenarlar kapkara, spot ışığı efekti. `0.2` yap → neredeyse düz. Ama
en kolayı yine `lookConfig.ts`'ten `bloom.intensity`'yi yükseltmek.

### `ThoughtBubble/` — 3D değil ama aynı fikir

Bu klasör (`ThoughtDock.tsx` vb.) 3D değil, ama bugünkü mimarinin "ruhunu" gösterdiği
için değerli. Uygulamanın "iç sesleri" (advisor yorumları) burada baloncuk olarak
belirir. `AppLayout` en sonda `<ThoughtDock />` diye asar — tıpkı `<SceneLayer />`
gibi, uygulamanın üzerine binen ayrı bir katman.

İlginç ortak nokta: `useTypewriter.ts` de tıpkı `CameraRig`'in `useFrame`'i gibi
**zamanla bir şeyi ilerletir**, ama React tarzıyla (`setInterval` + state):

```ts
const interval = window.setInterval(() => {
  setCount((current) => { ... return current + 1; });
}, 1000 / cps);
return () => window.clearInterval(interval);
```

Metni karakter karakter açar. Yine `return () => clear...` ile temizlik. 3D
`useFrame`'i ile 2D `setInterval`'i kafanda eşleştir: ikisi de "zamanı işleyip
görüntüyü güncelleyen döngü". `CameraRig` kamerayı, `useTypewriter` metni ilerletir.

---

## 3. Kavram Sözlüğü

Her kavram + MAMILAS'taki gerçek örneği.

- **Mesh** — Geometri + malzemenin birleşimi; ekranda gördüğün somut cisim. Bir
  mesh tek başına anlamsızdır, hem şekli hem yüzeyi olmalı. *Örnek:* kartın kağıt
  gövdesi bir mesh (`<mesh><boxGeometry/><meshStandardMaterial/></mesh>`).

- **Geometry (geometri)** — Cismin **şekli/iskeleti**; noktaların uzaydaki dizilimi.
  Rengi yoktur, sadece formu. *Örnek:* `<boxGeometry args={[1.1, 1.55, 0.03]}>` kart
  şeklini, `<circleGeometry args={[9, 64]}>` zemin diskini verir.

- **Material (malzeme)** — Yüzeyin **görünümü**: rengi, ışığa nasıl tepki verdiği,
  parlaklığı. Geometrinin "derisi". *Örnek:* `<meshStandardMaterial roughness={0.85}
  metalness={0.05}>` mat kağıt yüzeyi. `roughness` mat/parlak, `metalness` metal
  olup olmadığını ayarlar.

- **Işık türleri** — Sahne ışıksız kapkaranlıktır. Üç tip kullanıyorsun:
  - `ambientLight` → yönsüz genel dolgu, gölge yapmaz (`intensity={0.22}`).
  - `directionalLight` → güneş gibi paralel, tek yönden, gölge yapar
    (`position={[-6, 8, 4]}`).
  - `pointLight` → ampul gibi tek noktadan her yöne (lamba direğinde `intensity={14}`).

- **Camera / FOV** — Sahneyi hangi göz görüyor. `fov` (field of view) = görüş
  açısı, derece. Küçük fov (34) = dar/teleobjektif/sinematik; büyük fov (90) =
  geniş açı/balıkgözü. *Örnek:* `lookConfig`'te her ekranın kendi `fov`'u var
  (dashboard 34, timeline 30).

- **useFrame** — R3F kancası; içindeki fonksiyon her karede (~60fps) çalışır.
  Animasyonun kalbi. `delta` argümanı son kareden bu yana geçen saniyeyi verir.
  *Örnek:* `DioramaStage`'te dioramayı döndürür, `CameraRig`'te kamerayı kaydırır.

- **damp** — `THREE.MathUtils.damp(mevcut, hedef, lambda, delta)`. Bir değeri
  hedefe **yumuşakça, üstel** yaklaştırır (ani zıplama yok). Kaydırmalı geçişlerin
  sırrı. *Örnek:* `CameraRig`'te kamera pozisyonu, `cameraDamp: 2.2` hızıyla.

- **group** — Birden çok 3D nesneyi tek birim gibi taşıyıp döndüren kapsayıcı
  (3D'nin `<div>`'i). *Örnek:* `FloatingCard` iki mesh'i bir `<group>` içinde tutar;
  grubu süzdürünce ikisi birlikte süzülür. Tüm sahne de bir grup (`<group ref={stage}>`).

- **fog (sis)** — Uzaktaki nesneleri belli bir renge doğru soldurur; derinlik ve
  atmosfer katar. *Örnek:* `<fog attach="fog" args={['#0b0a08', 9, 26]}>` — 9
  biriminden sonra sisleme başlar, 26'da tamamen kaybolur.

- **postprocessing (sonradan işleme)** — Tüm sahne çizildikten sonra görüntünün
  bütününe uygulanan efekt katmanı (bloom, vignette, gren). Fotoğrafa filtre gibi.
  *Örnek:* `PostFX.tsx`'teki `<EffectComposer>` zinciri.

- **draw call** — GPU'ya gönderilen "şunu çiz" komutu. Her mesh kabaca bir draw
  call'dur. Ne kadar az → o kadar hızlı. Bu yüzden çok tekrar eden nesnelerde
  dikkatli olunur. *Örnek:* Dört `FloatingCard`, masa + dört bacak, lamba... hepsi
  ayrı draw call'lar; sahne bilerek sade tutulmuş ki performans iyi olsun.

- **emissive** — Malzemenin "kendi kendine parlıyor gibi" görünmesi; ama etrafı
  aydınlatmaz. *Örnek:* Lamba ampulü `emissive={gold} emissiveIntensity={2.2}`
  ile parlak görünür, ama aydınlatmayı yanındaki `pointLight` yapar.

---

## 4. Bugünün Mimari Dersleri

Bunlar sadece "3D bilgisi" değil — **iyi yazılım** dersleri. Upwork'te işi
kapan da bunları uygulayan geliştiricidir.

### Ders 1: Tek görsel otorite (`lookConfig.ts`)

Bütün renkler, kamera açıları, efekt şiddetleri **tek dosyada**. `DioramaStage`
kendi başına `color="#f7c948"` yazmaz; `LOOK.palette.gold` der. `PostFX` bloom
şiddetini uydurmaz; `LOOK.bloom.intensity`'den okur.

**Neden akıllıca:** Müşteri "her yeri biraz daha altın yap" derse **bir satır**
değiştirirsin, otuz dosyada arama yapmazsın. Renkler tutarlı kalır, çünkü tek
kaynaktan gelirler. Buna "single source of truth" (tek doğruluk kaynağı) denir ve
her ciddi projenin bel kemiğidir. *Upwork'te para eden:* revizyonlar dakikalar
sürer, saatler değil → memnun müşteri, tekrar iş.

### Ders 2: WebGL fallback neden şart

`SceneLayer` önce `webglSupport`'a danışır; WebGL yoksa ya da yavaşsa 3D'yi hiç
açmaz, `return null` der. Uygulama 2D olarak tam çalışır.

**Neden akıllıca:** Kullanıcının makinesini/tarayıcısını sen seçemezsin. Eski
laptop, kısıtlı iş bilgisayarı, gizlilik tarayıcısı... 3D bir **süs**, uygulamanın
asıl işi (Final Brief) değil. Süs çalışmazsa asıl iş yine yürümeli. *Upwork'te
para eden:* "bende açılmıyor" şikâyeti gelmez, çünkü zarifçe düşüyor. Sağlam
yazılım = az destek talebi = iyi itibar. Yorumdaki spec bunu kanunlaştırmış:
*"Final Brief asla 3D'ye rehin olmaz."*

### Ders 3: `pointer-events: none` katmanı

3D katman ekranı kaplar ama `pointerEvents: 'none'` sayesinde hiçbir tıklamayı
yakalamaz — hepsi altındaki gerçek butonlara geçer.

**Neden akıllıca:** Dekoratif bir görsel katmanı, işlevsel arayüzün **üstüne**
koyup yine de arayüzü çalışır tutmanın standart yolu budur. Aksi halde güzel bir
arka plan koyarsın ama butonlar tıklanmaz olur — klasik acemi hatası. *Upwork'te
para eden:* "arka planı şık yap ama hiçbir şeyi bozma" isteği çok gelir; bu tek
CSS kuralı seni kurtarır.

### Ders 4: Lazy chunk (`lazy(() => import(...))`)

three.js + R3F büyük. `SceneLayer` onları `lazy` ile ayrı dosyaya böler; ancak 3D
gerçekten açılacaksa indirilir.

**Neden akıllıca:** İlk açılış hızı = kullanıcı deneyiminin ve SEO'nun en kritik
metriği. Kimsenin görmeyeceği yüz kilobaytlık kütüphaneyi baştan indirmezsin.
"Code splitting" (kod bölme) her modern web projesinin beklediği bir beceridir.
*Upwork'te para eden:* "sayfam yavaş açılıyor" işlerinin yarısı budur; lazy
loading'i bilen kişi o işi alır.

**Özet zihin haritası:** İyi mimari çoğu zaman "asıl işi koru, süsü ayır, tek
yerden yönet, kırılırsa zarifçe düş" demektir. Bugünkü dört ders de bunun farklı
yüzleri.

---

## 5. Kendi Başına 5 Mini Alıştırma

Kolaydan zora. Her biri **tek dosya**. Bir şeyi bozarsan geri alma komutu her
alıştırmanın sonunda. Değişiklikten sonra `npm run dev` çalışıyorsa tarayıcı
kendini yeniler.

> **Genel geri alma:** Bir dosyayı ellemeden önceki haline döndürmek için:
> ```bash
> git checkout -- src/scene/DOSYA_ADI
> ```
> Bu komut o dosyadaki **tüm kaydedilmemiş değişikliklerini** siler ve son
> commit'teki haline döner. Endişelenme, deneme cesareti işin yarısı.

### Alıştırma 1 (çok kolay) — Bir rengi değiştir
`src/scene/lookConfig.ts` aç. `palette.gold` değerini `'#f7c948'`'ten `'#5ad1ff'`
(buz mavisi) yap. Kaydet, tarayıcıya bak: lamba ve toz partikülleri maviye döndü
mü? Tek değişkenin kaç yere yayıldığını gör — işte tek otoritenin gücü.
- Geri al: `git checkout -- src/scene/lookConfig.ts`

### Alıştırma 2 (kolay) — Sisi kapat, sonra boğ
Yine `lookConfig.ts`. Önce `fog.far`'ı `26` → `200` yap (sis pratikte kaybolur,
her şey net). Sonra `9` yap (sis burnunun dibinde başlar, sahne kaybolur). İki uç
arasındaki farkı hisset. Atmosferin ne kadar çok "sis"ten geldiğini anla.
- Geri al: `git checkout -- src/scene/lookConfig.ts`

### Alıştırma 3 (orta) — Kamerayı tepeye taşı
`lookConfig.ts`'te `CAMERA_POSES.dashboard`'ı şununla değiştir:
`{ position: [0, 14, 0.5], target: [0, 0, 0], fov: 40 }`. Kaydet. Kamera artık
dioramaya kuşbakışı yukarıdan bakıyor. `position`'ın `[x, y, z]` olduğunu ve `y`
büyüdükçe kameranın yükseldiğini gözlemle.
- Geri al: `git checkout -- src/scene/lookConfig.ts`

### Alıştırma 4 (orta-zor) — Sahneye kendi nesneni ekle
`src/scene/DioramaStage.tsx`'te `<LampPost />` satırının hemen altına şunu ekle:
```tsx
<mesh position={[0, 1, 1.5]} castShadow>
  <sphereGeometry args={[0.5, 32, 32]} />
  <meshStandardMaterial color={LOOK.palette.amber} roughness={0.3} metalness={0.8} />
</mesh>
```
Sahnenin ortasında parlak, yarı-metalik bir küre belirmeli. `roughness`'ı `0.3`
→ `0.9` yapıp farkı gör (parlak → mat). Kendi mesh'ini kurmayı öğrendin.
- Geri al: `git checkout -- src/scene/DioramaStage.tsx`

### Alıştırma 5 (zor) — Nesneni canlandır
Alıştırma 4'teki küreyi statikten canlıya çevir. `DioramaStage` fonksiyonu içinde
küreye bir `ref` ver ve `useFrame`'le döndür/zıplat. `FloatingCard`'daki desenden
kopyala:
```tsx
// fonksiyonun başında:
const orb = useRef<Mesh>(null);
useFrame(({ clock }) => {
  if (orb.current) {
    orb.current.position.y = 1 + Math.sin(clock.elapsedTime * 1.2) * 0.4;
    orb.current.rotation.y += 0.01;
  }
});
// küreyi <mesh ref={orb} ...> yaparak bağla
```
(`Mesh` tipini `import { Mesh } from 'three'` ile alman gerekebilir; `Group`
importunun yanına ekle.) Küre artık süzülüp dönüyor. `Math.sin` + `useFrame`
kombosuyla her şeyi canlandırabileceğini anladıysan R3F'in ruhunu yakaladın.
- Geri al: `git checkout -- src/scene/DioramaStage.tsx`

> Bir şey ekranı bembeyaz yapar ve `npm run dev` terminalinde kırmızı hata
> çıkarsa panik yok: hatayı oku (genelde eksik virgül/import), ya düzelt ya da
> `git checkout` ile geri dön. Beyaz ekran = düzeltilebilir bir yazım hatası,
> felaket değil.

---

## 6. Sonraki Öğrenme Adımları

### drei kütüphanesinden 3 faydalı hazır bileşen

`@react-three/drei` = R3F'in "hazır parçalar deposu". Zaten `Sparkles`'ı
kullanıyorsun. Sıradaki üçü öğrenmeye değer:

1. **`<OrbitControls />`** — Fareyle sahneyi döndür/yakınlaştır/kaydır. Tek satır
   ekle, sahneyi elinle çevir. (Not: senin projende kamera otoritesi `CameraRig`'te
   olduğu için üretimde kullanmazsın, ama **öğrenirken** bir nesneyi her açıdan
   görmek için harika. Ayrı bir deneme dosyasında dene.)

2. **`<Text>`** — 3D uzayda gerçek yazı. Kartların üstüne başlık koymak istersen
   (bugünkü kartların mürekkep dörtgeni yerine) bunu kullanırsın. Font yükler,
   uzayda döner.

3. **`<useGLTF>` / `<Gltf>`** — Blender veya hazır kütüphanelerden **gerçek 3D
   model** (`.glb/.gltf`) yükler. Bugünkü kutu-küre dünyandan gerçek modellere
   geçişin kapısı. Upwork'te "şu ürünü 3D göster" işlerinin temeli budur.

### İyi kaynaklar

- **Three.js Journey** (Bruno Simon, threejs-journey.com) — 3D web'in en iyi
  ücretli kursu. Önce saf three.js, sonra R3F. Sabırlı, derinlemesine. Bir işten
  para kazanınca ilk yatırımın bu olsun.
- **React Three Fiber resmi dokümanları** (r3f.docs.pmnd.rs) — Kısa, örnekli,
  aranabilir. "useFrame nasıl?", "material türleri?" diye baktığın referans. drei
  dokümanları da aynı sitede.
- **Bruno Simon'un portföyü** (bruno-simon.com) — Tarayıcıda araba sürdüğün
  efsane site. "3D web nereye gidebilir" görmek ve ilham için. Kaynağı da açık,
  incele.
- **three.js resmi örnekleri** (threejs.org/examples) — Yüzlerce çalışan demo.
  Bir efekti merak edince "acaba three.js'te var mı" diye ilk bakılacak yer.

### Kişisel yol haritası önerisi

1. Bu rehberdeki 5 alıştırmayı bitir (kodun içinde rahat hisset).
2. Ayrı bir küçük deneme projesi aç, `OrbitControls` + bir `<Text>` ekle.
3. Bir `.glb` model indir (poly.pizza, sketchfab bedava bölümü) ve `useGLTF` ile
   sahneye koy.
4. Three.js Journey'in ücretsiz ilk bölümlerini izle.
5. Basit bir "ürün gösterici" (dönen bir nesne + birkaç buton) yap → bu senin
   ilk Upwork portföy parçan olur.

Unutma: bugün gördüğün her şey — `<mesh>`, `useFrame`, `damp`, tek otorite,
fallback — küçük parçalar. Tek tek öğrenilir, üst üste konur. Sen zaten React
biliyorsun; R3F ona takılan bir başlık. Boz, dene, geri al. İyi yolculuklar.
