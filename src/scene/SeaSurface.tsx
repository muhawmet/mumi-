import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, ShaderMaterial, Vector3 } from 'three';
import { LOOK } from './lookConfig';
import { type ScenePalette } from './scenePalette';

/* ============================================================
   SeaSurface — deniz artık RESİM değil, SU (three.js'in hakkı).
   Düz unlit plane emekli: gerçek vertex dalgaları (4 bileşenli
   sinüs alanı, analitik normal), fresnel gök yansıması, güneşin
   FİZİKSEL speküler yolu (glitter çıkartması değil — ışığın dalga
   sırtlarında kırılması) ve fog'la birebir aynı aerial erime.

   Painterly disiplin (karıncalanma dersi kapsamında):
   - Dalga genliği kameradan uzaklaştıkça SIFIRA iner → ufuk çizgisi
     jilet gibi temiz kalır, uzak su sakin gradyana yatışır (uzakta
     speckle/shimmer üretilemez).
   - Speküler parıltı yatay "dab"lara bölünür (Turner fırçası),
     iğne-glint değil; keskin terim de dalga fade'iyle ölür.
   - Renk matematiği palette'ten (world-adaptif), uniform'lar her
     karede EASED lerp'lenir — world switch'te su da ışıkla döner.
   ============================================================ */

const SEA_VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vFade;
  varying float vViewZ;

  /* 4 dalga bileşeni: yön (xz, normalize), dalga boyu λ, genlik A, hız c.
     Altın-saat sakin deniz: uzun soluklu, alçak genlikli soluklanma. */
  const vec2 D0 = vec2( 0.196,  0.981); const float L0 = 21.0, A0 = 0.055, C0 = 0.90;
  const vec2 D1 = vec2(-0.447,  0.894); const float L1 = 12.0, A1 = 0.032, C1 = 0.72;
  const vec2 D2 = vec2( 0.707,  0.707); const float L2 =  7.0, A2 = 0.020, C2 = 1.05;
  const vec2 D3 = vec2(-0.163,  0.987); const float L3 =  4.1, A3 = 0.011, C3 = 1.30;

  void waveAcc(vec2 p, vec2 d, float lambda, float amp, float speed,
               inout float h, inout vec2 grad) {
    float k = 6.28318 / lambda;
    float ph = dot(d, p) * k + uTime * speed * k;
    h += amp * sin(ph);
    grad += amp * k * cos(ph) * d;
  }

  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);

    /* Uzaklık fade'i: 22 birimden sonra dalga sönmeye başlar, 48'de ayna-düz.
       Ufuk silüeti titremez; uzak su aerial gradyana teslim olur. */
    float dcam = distance(wp.xz, cameraPosition.xz);
    float fade = 1.0 - smoothstep(22.0, 48.0, dcam);

    float h = 0.0; vec2 grad = vec2(0.0);
    waveAcc(wp.xz, D0, L0, A0, C0, h, grad);
    waveAcc(wp.xz, D1, L1, A1, C1, h, grad);
    waveAcc(wp.xz, D2, L2, A2, C2, h, grad);
    waveAcc(wp.xz, D3, L3, A3, C3, h, grad);
    wp.y += h * fade;

    vNormal = normalize(vec3(-grad.x * fade, 1.0, -grad.y * fade));
    vWorld = wp.xyz;
    vFade = fade;
    vec4 mv = viewMatrix * wp;
    vViewZ = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const SEA_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSeaDeep;    // derin su gövdesi (palette.seaDeep)
  uniform vec3 uSky;        // grazing yansıma (palette.horizonGlow)
  uniform vec3 uSkyHigh;    // dik yansıma (palette.skyTop — su TEPEDEKİ göğü yansıtır)
  uniform vec3 uGlint;      // güneş yolu (palette.seaGlitter)
  uniform vec3 uFog;        // aerial haze — scene.fog ile ayni (AtmosphereRig damp'ler)
  uniform vec3 uSunPos;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vFade;
  varying float vViewZ;

  void main() {
    /* Yüzey mikro-kıpırtısı: 2 küçük oktav — vertex dalgalarının üstünde
       su "nefes alır". Yakında yaşar, uzakta vFade ile ölür (karınca yasak). */
    vec2 p = vWorld.xz;
    float r1 = sin(p.x * 2.3 + uTime * 0.8) * cos(p.y * 2.9 - uTime * 0.6);
    float r2 = sin(p.x * 5.1 - uTime * 1.1 + sin(p.y * 4.1 + uTime * 0.5));
    /* Ripple normali SADECE speküler içindir; fresnel geometrik normalde kalır
       (yoksa mikro-kıpırtı grazing'de gök-blob'ları üretir → su bulut okunur). */
    vec3 Ns = normalize(vNormal + vec3(r1 * 0.05 + r2 * 0.022, 0.0, r1 * 0.034 - r2 * 0.028) * vFade);
    vec3 Ng = normalize(vNormal);

    vec3 V = normalize(cameraPosition - vWorld);
    vec3 L = normalize(uSunPos - vWorld);
    vec3 H = normalize(L + V);

    /* Fresnel — Turner kuralı: sıcaklık IŞIK YOLUNDA yoğunlaşır.
       Su, güneşten uzakta SERİN zenit göğünü yansıtır (teal gövde yaşar),
       yalnız güneşe dönük grazing'de ufuk sıcaklığını toplar. Azimut'suz
       "hep krem" yansıma bütün denizi ağartıyordu — kök neden buydu. */
    float ndv = clamp(dot(Ng, V), 0.0, 1.0);
    float fres = pow(1.0 - ndv, 5.0);
    vec2 toSun = normalize(uSunPos.xz - cameraPosition.xz);
    vec2 toFrag = normalize(vWorld.xz - cameraPosition.xz);
    float sunward = smoothstep(0.4, 0.97, dot(toSun, toFrag));
    float grazing = pow(1.0 - ndv, 4.0);
    vec3 lowSky = mix(uSkyHigh * 1.35, uSky, sunward);
    vec3 skyRefl = mix(uSkyHigh, lowSky, grazing);
    vec3 col = mix(uSeaDeep, skyRefl, min(fres * mix(0.30, 0.55, sunward), 0.5));

    /* Swell formu: güneşe dönük yamaç hafif ısınır — dalga karanlıkta kaybolmaz. */
    col *= 0.94 + 0.06 * max(dot(Ng, L), 0.0);

    /* Güneş yolu: geniş erimiş bant + dalga sırtlarında kırılan dab'lar.
       Dab maskesi yatay fırça vuruşu — iğne parıltısı değil (painterly). */
    float ndh = max(dot(Ns, H), 0.0);
    float broad = pow(ndh, 48.0);
    float dabs = 0.55 + 0.45 * sin(vWorld.z * 1.6 + uTime * 0.5
                 + sin(vWorld.x * 0.85 + uTime * 0.21) * 1.9);
    float sharp = pow(ndh, 340.0) * dabs * vFade;
    col += uGlint * broad * 0.55 + mix(uGlint, vec3(1.0), 0.25) * sharp * 1.0;

    /* Aerial: three'nin fog metriğiyle BİREBİR (view-space depth, euclid değil) —
       su, tepeler ve gökle aynı havada erir; kendi sisini erken basmaz. */
    float fogF = clamp((vViewZ - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
    col = mix(col, uFog, fogF);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** SUN_POS DioramaStage'den gelir — tek güneş otoritesi orada. */
export function SeaSurface({ palette, sunPos }: { palette: ScenePalette; sunPos: readonly [number, number, number] }) {
  const matRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSeaDeep: { value: new Color(palette.seaDeep) },
    uSky: { value: new Color(palette.horizonGlow) },
    uSkyHigh: { value: new Color(palette.skyTop) },
    uGlint: { value: new Color(palette.seaGlitter) },
    uFog: { value: new Color(palette.fog) },
    uSunPos: { value: new Vector3(...sunPos) },
    uFogNear: { value: LOOK.fog.near },
    uFogFar: { value: LOOK.fog.far },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ilk değerler; canlı değerler useFrame'de damp'lenir
  }), []);

  /* World switch: renkler keskin kesmez, AtmosphereRig ile aynı tempoda DÖNER. */
  const targets = useMemo(() => ({
    seaDeep: new Color(), sky: new Color(), skyHigh: new Color(), glint: new Color(),
  }), []);
  targets.seaDeep.set(palette.seaDeep);
  targets.sky.set(palette.horizonGlow);
  targets.skyHigh.set(palette.skyTop);
  targets.glint.set(palette.seaGlitter);

  const scene = useThree((s) => s.scene);
  useFrame(({ clock }, dt) => {
    const u = uniforms;
    u.uTime.value = clock.elapsedTime;
    const k = 1 - Math.exp(-3 * dt);
    u.uSeaDeep.value.lerp(targets.seaDeep, k);
    u.uSky.value.lerp(targets.sky, k);
    u.uSkyHigh.value.lerp(targets.skyHigh, k);
    u.uGlint.value.lerp(targets.glint, k);
    if (scene.fog) u.uFog.value.copy(scene.fog.color); // AtmosphereRig'in damp'ı — çift otorite yok
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]}>
      {/* 200×200 birim, 180² segment: dalga vertex'te yaşar; fade bandı dışı düz */}
      <planeGeometry args={[200, 200, 180, 180]} />
      <shaderMaterial ref={matRef} vertexShader={SEA_VERT} fragmentShader={SEA_FRAG} uniforms={uniforms} />
    </mesh>
  );
}
