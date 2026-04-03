# Osobní Aplikace - Maty
Tento projekt je stavěný přednostně pro mobilní zařízení (telefon). 

Důležité instrukce pro budoucí vývoj:
1. **Mobilní rozhraní**: Aplikace simuluje PWA (Progressive Web App). Všechny úpravy UI by měly být dotykově optimalizované a responsivní.
2. **Apple Touch / Instalace na plochu**: Využíváme `manifest.json` a tagy v `index.html`, abych aplikaci mohl "Nainstalovat" na domovskou obrazovku v telefonu a běžela v celoobrazovkovém režimu přes webový prohlížeč.
3. V CSS platí ochrana přes safe-area (iOS zářezy), `touch-action`, a chování při scrollování nesmí narušovat zážitek.
