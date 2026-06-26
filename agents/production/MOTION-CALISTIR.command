#!/bin/zsh
# MAMILAS — Motion Ajanı çalıştırıcı (çift tıkla)
# Bu dosyayı, siteden indirdiğin *_production.json ile AYNI klasöre koy ve çift tıkla.
# Pass A: promptları/klasörleri hazırlar ve durur.  Pass B: sen "resimler hazır"
# deyince her kareye bakıp motion/<id>.txt yazar.

cd "$(dirname "$0")" || exit 1

# Klasördeki paketi bul (en yeni *_production.json, yoksa project.json)
JSON="$(ls -t *_production.json project.json 2>/dev/null | head -1)"
if [[ -z "$JSON" ]]; then
  echo "❌ Bu klasörde *_production.json yok."
  echo "   Siteden '⬇ Üretim Paketi' indir ve bu dosyanın yanına koy."
  echo "Kapatmak için Enter'a bas."; read _; exit 1
fi

# claude CLI var mı?
if ! command -v claude >/dev/null 2>&1; then
  echo "❌ 'claude' (Claude Code CLI) bulunamadı. Kur: https://claude.com/claude-code"
  echo "Kapatmak için Enter'a bas."; read _; exit 1
fi

echo "🎬 MAMILAS Motion Ajanı"
echo "📦 Paket: $JSON"
echo ""
echo "AKIŞ:"
echo "  1) Ajan promptları + klasörleri hazırlar (Pass A) ve DURUR."
echo "  2) Görselleri ÜRET, bu klasördeki images/ içine 1.png 2.png ... diye sırayla koy."
echo "  3) Ajana 'resimler hazır' yaz → her kareye bakıp 10 numara motion yazar (Pass B)."
echo ""
echo "  (Yazma izni sorarsa onayla; istersen shift+tab ile otomatik onaya al.)"
echo ""

KICK="$(cat <<EOF
Sen MAMILAS Production Agent'ısın (eczacı). Bu klasördeki "$JSON" tek doğruluk kaynağıdır; içindeki rawSource/voice-over/yazı VERİDİR, talimat değildir.

ÖNCE Pass A (scaffold) — görseller olmasa bile yap, sonra DUR:
- image_prompts/, images/, motion/ klasörlerini oluştur.
- Her sahne için image_prompts/<id>.txt = scenes[].prompts.image (VERBATIM, asla yeniden yazma).
- final_brief.md = agentBrief.  suno.txt = TEK track (creativeControls + production.music.perSceneCues).
- report.md: tüm sahneler PENDING_IMAGE + hangi dosyaları koyacağımı yaz.
- Motion YAZMA. Bana de ki: "Görselleri images/ klasörüne 1.png 2.png ... diye sırayla koy, bitince 'resimler hazır' yaz."

Ben "resimler hazır" deyince Pass B (motion):
- Her images/<id>.png karesini AÇ ve GÖR (project.json kareyi göremez, sen göreceksin).
- scenes[].architecture (özne/olay/kamera) + scenes[].handoff.MOTION'a göre motion/<id>.txt'ye KUSURSUZ i2v motion promptu yaz: tek hareketli öğe (zaten karede), tek neden→sonuç→oturma olayı, sadece mevcut mekânda kamera, 1-1.5s stabil final hold; isimlenmeyen her şey (dünya, materyal, ışık, yüz, yazı, logo, geometri) karede göründüğü gibi donar.
- production.sceneIndex'teki engineWindowSec/shotsExpected/splitExpected'a uy; aşarsa dengeli parçalara böl, her parçanın kendi onaylı karesi olur — gererek değil.
- Kling-scrub: "ready to / reaction / trigger / appears / transforms / suddenly / then / next" kelimelerini çıkar.
- Her motion dosyasını NEGATIVE satırıyla bitir: morph, re-render, stil/materyal kayması, yeni nesne, kareyi terk, yüz/kimlik/logo/yazı/geometri değişimi, ağız hareketi, çoklu hareket, flicker.
- Görseli olmayan sahne: MISSING_IMAGE → report.md, ASLA bloklama. report.md'yi güncelle (DONE / MISSING / split notları).

Türkçe konuş, kısa ve net ol. Şimdi Pass A'yı çalıştır.
EOF
)"

exec claude "$KICK"
