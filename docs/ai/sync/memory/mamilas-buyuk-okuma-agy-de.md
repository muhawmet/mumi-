---
name: mamilas-buyuk-okuma-agy-de
description: "Usage en kritik kaynak — her büyük okumayı AGY ya da ajan yapar, Claude doğrular. AGY headless şu an izin kapısında kırık; kök neden ve iki çözüm yolu yazılı."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dff11cc7-964e-45e2-b131-bfd474423e16
  modified: 2026-08-02T08:37:54.910Z
---

Mami'nin emri (2026-08-02): *"en önemli şey senin usageın, her büyük okuma agy de kontrol
sen de."*

**Why:** Claude'un bağlamı dolunca buddy olacak yer kalmıyor — bu Mami'nin 2026-07-27
teşhisinin aynısı, bu sefer okuma tarafında. 511 satırlık bir raporu ana bağlamda okumak,
o bağlamı sonraki on karar için harcamaktır. AGY'nin usage'ı bitmez, Codex'inki biter.

**How to apply:**
- 200 satırdan uzun dosya · geniş kod taraması · korpus okuması → **AGY'ye ya da Claude
  ajanına.** Ana bağlamda okunmaz. Ajan da olur: ajan bağlamı ana bağlamı korur.
- AGY **TARİF eder, HÜKÜM vermez.** Her iddiası grep/dosya ile doğrulanır — bir günde beş
  kez yanlış alarm verdiği ölçüldü. Doğrulanmamış iddia kanıt değildir. [[mamilas-agy-video-gozu]]
- **Codex ikinci gözdür ve usage'ı BİTER** — yalnız son denetimde, tek geçişte.
- Çıktı biçimi şart koşulur: sıkıştırılmış, dosya+satır kanıtlı, yorumsuz. Yoksa okuma işi
  ana bağlama geri döner.

🔴 **AGY HEADLESS KIRIK (2026-08-02 ölçüldü).** `agy --mode plan -p "..."` izin kapısına
takılıyor. Kök neden log'da: `ApplyProjectPermissionGrants: no grants for project
"CLI Project", cleared project permissions` — global allowlist yükleniyor ama proje
bağlamında **temizleniyor.** `~/.gemini/antigravity-cli/settings.json` içine 47 salt-okur
izin eklendi (`command(grep)`, `read_file(<repo>)` …), **yetmedi**; yedek
`settings.json.yedek-2026-08-02`.
İki yol, ikisi de Mami'nin kararı: (a) AGY interaktif koşulur — bugüne kadar böyle çalıştı;
(b) Mami kendi terminalinden `--dangerously-skip-permissions` ile koşar. **Claude bu izni
kendi başına açmaz** ve classifier zaten bloke ediyor; zorlanmadı.
Çözülene kadar büyük okuma **Claude ajanına** verilir — ölçüldü, işe yarıyor.

İlgili: [[mamilas-ajan-devri-buddy-on-kosulu]] · [[mamilas-duyu-ve-ikinci-goz-yetkisi]]
