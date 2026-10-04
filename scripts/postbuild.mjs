// GitHub Pages отдаёт 404.html для неизвестных путей — копируем index.html,
// чтобы прямые ссылки вида /app/today не выдавали 404, а открывали SPA.
import { copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
console.log('dist/index.html -> dist/404.html')
