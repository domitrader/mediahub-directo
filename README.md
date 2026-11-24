# 🌐 MediaHub Directo

> **Directorio curado de herramientas web gratuitas sin registro para descargar vídeo y audio organizadas por plataforma.**

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-00E5FF?style=flat-square&logo=pwa)](./manifest.json)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-D4AF37?style=flat-square)](./LICENSE)
[![Despliegue](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Netlify%20%7C%20GitHub%20Pages-00E5FF?style=flat-square)](#-despliegue)

---

## ⚡ Descripción

**MediaHub Directo** es una aplicación web progresiva (PWA) estática y ultrarrápida diseñada con enfoque **Mobile-First**. Ofrece acceso directo a las mejores herramientas web gratuitas del mundo para descargar audio y vídeo de plataformas como **YouTube, X (Twitter), Instagram, TikTok y Facebook**, sin necesidad de registrarse, instalar extensiones ni pagar suscripciones.

## ✨ Características Principales

- 📱 **Mobile-First & PWA:** Totalmente responsiva y lista para añadir como icono de acceso directo en la pantalla de inicio de tu smartphone o tablet sin pasar por tiendas de aplicaciones.
- 🎨 **Estética Oscura Premium:** Interfaz refinada con tema oscuro (`#0B0F19`), tarjetas glassmorphism con efecto desenfoque, detalles en dorado (`#D4AF37`) y acentos en cian neón (`#00E5FF`).
- 📋 **Verificador Rápido de Enlace / Portapapeles:** Detecta automáticamente si tienes un enlace copiado de YouTube, Instagram, X, TikTok o Facebook y te muestra al instante los descargadores directos recomendados.
- 🔍 **Búsqueda Instantánea en Tiempo Real:** Filtra al vuelo por nombre de herramienta, plataforma, formatos (MP3, MP4) o etiquetas, sin retrasos y tolerante a tildes.
- 🏷️ **Pestañas de Filtrado Deslizables:** Píldoras táctiles con scroll horizontal suave (`Todas`, `★ Favoritas`, `Multiplataforma`, `YouTube`, `X (Twitter)`, `Instagram`, `TikTok y Facebook`).
- ⭐ **Favoritos Persistentes:** Guarda tus herramientas preferidas mediante `localStorage` para acceder a ellas en un solo toque.
- 🛡️ **Distinción Transparente de Anuncios:** Etiquetas claras que diferencian servicios *"Sin anuncios"* de aquellos *"Con anuncios"*.
- ⚖️ **Aviso Legal y de Responsabilidad:** Directorio meramente informativo; no aloja ni retransmite contenidos de terceros.

---

## 🗂️ Herramientas Incluidas

1. **Cobalt** (Multiplataforma) — Sin anuncios, sin rastreadores, alta velocidad.
2. **SaveFrom** (Multiplataforma) — Veterano descargador para múltiples redes.
3. **CNVMP3** (YouTube) — Conversor directo MP3/MP4 sin cuentas.
4. **Y2Mate** (YouTube) — Resoluciones múltiples y extracción de audio.
5. **SSSTwitter** (X / Twitter) — Descarga de vídeos y GIFs en alta calidad.
6. **TwitterVid** (X / Twitter) — Ligero y directo para X.
7. **SnapInsta** (Instagram) — Reels, fotos y vídeos de Instagram públicos.
8. **FastDL** (Instagram) — Descargador alternativo para Instagram.
9. **SSSTik** (TikTok) — Descarga directa sin marcas de agua o audio MP3.
10. **SnapTik** (TikTok) — Extracción de vídeo limpio sin marcas.
11. **FDown** (Facebook) — Descarga de vídeos públicos en SD y HD.

---

## 🚀 Despliegue en 1 Clic

### En Vercel
1. Importa el repositorio `mediahub-directo` en [vercel.com](https://vercel.com).
2. El archivo `vercel.json` ya está configurado con las rutas y cabeceras óptimas.
3. Haz clic en **Deploy**.

### En Netlify
1. Conecta el repositorio en [netlify.com](https://netlify.com).
2. El archivo `_redirects` gestiona automáticamente la redirección `/* /index.html 200`.
3. Haz clic en **Deploy site**.

### En GitHub Pages
1. Ve a **Settings > Pages** en tu repositorio de GitHub.
2. En **Build and deployment > Source**, selecciona **Deploy from a branch**.
3. Selecciona la rama `main` y la carpeta `/ (root)`.
4. Tu web estará publicada al instante en `https://domitrader.github.io/mediahub-directo/`.

---

## 💻 Tecnologías Utilizadas

- **HTML5 Semántico:** Estructura limpia y accesible.
- **CSS3 Vanilla Modular:** Variables CSS nativas, Grid, Flexbox y animaciones de hardware.
- **JavaScript Vanilla ES6+:** Cero dependencias ni frameworks pesados (0 KB de React/Vue/Node innecesario).
- **Service Worker & Web App Manifest:** Soporte para instalación PWA y funcionamiento sin conexión.

---

## ⚖️ Aviso Legal

MediaHub Directo es un índice informativo de servicios web de terceros. Los nombres de marcas y plataformas (YouTube, Twitter/X, Instagram, TikTok, Facebook, etc.) son marcas registradas de sus respectivos propietarios. Respeta siempre los derechos de autor y las condiciones de servicio de cada plataforma.
