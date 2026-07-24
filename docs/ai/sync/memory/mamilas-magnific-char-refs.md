---
name: mamilas-magnific-char-refs
description: "Mami's recurring characters get @-handle tags in image prompts so Magnific captures them as references"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2f7a7338-3753-45e6-b728-d49f1faa9427
---

Mami üretim öncesi tekrar eden karakterleri Magnific'te HAZIR tutuyor. Image prompt'larında karakter geçen her karede `@handle` etiketiyle çağır — Magnific onları referans olarak yakalıyor. Örnek (SAYILAR 10→20 dersi, project.json): Öğretmen=`@ogretmen`, Aras=`@aras2`, Defne=`@defne2`.

**Why:** Kimlik tutarlılığı 57 sahne boyunca @tag + Magnific ref'iyle sağlanıyor; ben karakterin yüzünü/kıyafetini TARİF ETMİYORUM (sadece poz/aksiyon/ifade/yerleşim) — identity'yi ref taşıyor. Bunlar Mami'nin ORİJİNAL karakterleri, IP değil, firewall'u tetiklemez.

**How to apply:** Sahnede tanımlı bir tekrar-karakter varsa image prompt'a `@handle` göm; handle'ları Mami'den al/teyit et (tam yazım: @ogretmen no-2, @aras2, @defne2). [[mamilas-generation-routine]]

İlgili: 1. sınıf eğitim dersinde **on-screen text AÇIK** — VO'daki rakam/kavram diegetik olarak KAREYE gömülür (tahtada tebeşir), overlay/post-prod YOK, text-protect negatifi şart. [[mamilas-production-export]]
