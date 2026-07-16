---
name: mamilas-director
description: MAMILAS Pass A/Pass B veya uçtan uca prodüksiyon istendiğinde gerçek proje paketi, onaylı kare kapısı ve çıktı denetimiyle üretimi koordine eder.
---

> **DEPRECATED / ESKİ HAT (2026-07-16):** Bu skill eski "Pass A/Pass B + project.json"
> akışını anlatır — o hat runnable DEĞİLDİR. Canlı üretim: `/mamilas-uret` (Yönetmen modu,
> `--director`). Yerleşik Yönetmen'in runtime rol kartı: `agents/roles/director-session.md`.

# MAMILAS Production Director

Önce `AGENTS.md`, `docs/ai/PROJECT_CONTRACT.md` ve gerçek üretim paketini oku. Olmayan
`project.json` veya klasörleri varsayma; kullanıcıdan gelen gerçek paket yolunu kullan.

## Pass A

1. Kaynak paketi ve `agentBrief` içeriğini doğrula.
2. Her sahne için dünya/ref/palet ve zorunlu mandatların gerçek pipeline'dan geldiğini kanıtla.
3. Image prompt'ları üretim sözleşmesine göre incele; IP, palet, metin ve eksik gerçek
   kapılarından geçir.
4. Kullanıcıya yalnızca kararları, reddetme nedenlerini ve hazır çıktıları özetle.
5. Onaylı başlangıç karelerini bekle.

## Pass B

1. Her başlangıç karesini görsel olarak incele; prompt PASS'i kare PASS'i sayma.
2. Motion prompt'u yalnızca karede bulunan nesne, kişi, kamera ve ışık üzerinden yaz.
3. Text-protect, identity ve anti-morph gereksinimlerini sahneye göre uygula.
4. Gerçek çıktı paketini QA kapısından geçir; reddedileni sorumlu aşamaya geri gönder.

## Çoklu ajan

Bağımsız sahne veya denetim kolları varsa sınırlı ve görev-tanımlı uzmanlar kullanılabilir.
Tek bir küçük işte ajan çoğaltma. Her alt sonucu ana ajan kanıtla doğrular. İç muhakeme veya
ajan tartışması kullanıcıya dökülmez.

Kodda yaşayan otorite, motor süresi veya destek listesini burada yeniden yazma.

Bu dosya dış ajan tarafından tek başına okunabildiği için testle kilitli kanonik sıra:
Path > World / Render Lock > Material (only when world-compatible) > Source meaning > Approved image > Director Mandate > Reference DNA > Palette.
