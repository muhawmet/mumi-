import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  test: {
    exclude: ['e2e/**', '.claude/**', 'node_modules/**'],
    // vitest 4.1.9 + vite 8 modül-runner: varsayılan 'threads' havuzunda ikinci
    // test dosyası aynı worker'da yüklenince vitest modül context'i kaybolur
    // (describe undefined → "Cannot read properties of undefined (reading 'config')").
    // 'forks' her dosyaya temiz child-process context'i verir.
    pool: 'forks',
    server: {
      deps: {
        // scripts/mamilas-command.mjs testlerde aynı process'te dinamik import ile
        // yüklenir. Vitest'in inline module-evaluator'ı bu ESM'i vm.Script ile
        // yeniden derlerken, dosyadaki emoji (astral-plane / UTF-16 surrogate pair,
        // örn. console.error'daki 🔧🎬🎭) karakterlerini bozup
        // "SyntaxError: Invalid or unexpected token" atıyor (node native ESM sorunsuz).
        // Runner'ı external bırakınca Node'un kendi loader'ıyla yüklenir, inline edilmez.
        // scripts/ altındaki tüm .mjs'ler node CLI script'leridir (agents-sync.mjs de
        // mamilas-command.mjs'i statik import eder → transitif emoji sorunu); hepsi external.
        external: [/[\\/]scripts[\\/][^\\/]+\.mjs$/, 'sharp'],
      },
    },
  },
})
