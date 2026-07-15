#!/bin/zsh
# MAMILAS — siteyi aç (çift tıkla). Windows karşılığı: BASLAT.bat
cd "$(dirname "$0")" || exit 1

echo ""
echo "  MAMILAS Studio Console"
echo "  ----------------------"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  ❌ Node.js bulunamadı."
  echo "     Kur: https://nodejs.org (LTS)"
  echo ""
  echo "Kapatmak için Enter'a bas."; read _
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "  İlk çalıştırma — kütüphaneler kuruluyor."
  echo "  Bu birkaç dakika sürer, bekle."
  echo ""
  npm install || { echo ""; echo "  ❌ Kurulum başarısız."; read _; exit 1; }
  echo ""
fi

echo "  Site açılıyor… tarayıcı birazdan gelecek."
echo "  Kapatmak için: bu pencerede Ctrl+C"
echo ""

( sleep 3; open http://localhost:5173 ) &
npm run dev

echo ""
echo "  Sunucu durdu."
echo "Kapatmak için Enter'a bas."; read _
