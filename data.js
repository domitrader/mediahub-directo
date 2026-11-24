const TOOLS_DIRECTORY = [
  {
    id: "cobalt",
    name: "Cobalt",
    category: "multiplataforma",
    categoryLabel: "Multiplataforma",
    platforms: ["YouTube", "X", "Instagram", "TikTok", "Vimeo", "Reddit"],
    url: "https://cobalt.tools",
    description: "Interfaz minimalista y rápida. Pegas el enlace, eliges vídeo o audio y descarga directo sin rastreadores.",
    badges: ["Gratis", "Sin registro", "Sin anuncios", "MP4 / Audio"],
    featured: true
  },
  {
    id: "savefrom",
    name: "SaveFrom",
    category: "multiplataforma",
    categoryLabel: "Multiplataforma",
    platforms: ["YouTube", "Facebook", "Instagram", "X", "Vimeo"],
    url: "https://es.savefrom.net",
    description: "Uno de los descargadores web más veteranos para bajar vídeos en MP4 pegando directamente la URL.",
    badges: ["Gratis", "Sin registro", "MP4", "Con anuncios"],
    featured: false
  },
  {
    id: "cnvmp3",
    name: "CNVMP3",
    category: "youtube",
    categoryLabel: "YouTube",
    platforms: ["YouTube"],
    url: "https://cnvmp3.com",
    description: "Conversor directo para extraer audio MP3 o vídeo MP4 de YouTube sin crear cuenta ni pasos extra.",
    badges: ["Gratis", "Sin registro", "MP3 / MP4"],
    featured: true
  },
  {
    id: "y2mate",
    name: "Y2Mate",
    category: "youtube",
    categoryLabel: "YouTube",
    platforms: ["YouTube"],
    url: "https://www.y2mate.com",
    description: "Permite elegir entre varias resoluciones de vídeo MP4 o convertir a MP3 al instante pegando el enlace.",
    badges: ["Gratis", "Sin registro", "MP4 / MP3", "Con anuncios"],
    featured: false
  },
  {
    id: "ssstwitter",
    name: "SSSTwitter",
    category: "x-twitter",
    categoryLabel: "X (Twitter)",
    platforms: ["X", "Twitter"],
    url: "https://ssstwitter.com",
    description: "Descarga vídeos y GIFs públicos de X en varias calidades MP4 o extrae el audio con solo pegar el enlace del post.",
    badges: ["Gratis", "Sin registro", "MP4 / MP3", "Con anuncios"],
    featured: true
  },
  {
    id: "twittervid",
    name: "TwitterVid",
    category: "x-twitter",
    categoryLabel: "X (Twitter)",
    platforms: ["X", "Twitter"],
    url: "https://twittervid.com",
    description: "Alternativa sencilla y directa para guardar vídeos públicos de X en el móvil o PC.",
    badges: ["Gratis", "Sin registro", "MP4"],
    featured: false
  },
  {
    id: "snapinsta",
    name: "SnapInsta",
    category: "instagram",
    categoryLabel: "Instagram",
    platforms: ["Instagram"],
    url: "https://snapinsta.app",
    description: "Descarga Reels y vídeos públicos de Instagram en alta calidad pegando la URL sin iniciar sesión.",
    badges: ["Gratis", "Sin registro", "Reels / MP4", "Con anuncios"],
    featured: true
  },
  {
    id: "fastdl",
    name: "FastDL",
    category: "instagram",
    categoryLabel: "Instagram",
    platforms: ["Instagram"],
    url: "https://fastdl.app",
    description: "Herramienta de respaldo para guardar vídeos y Reels públicos de Instagram en formato MP4.",
    badges: ["Gratis", "Sin registro", "MP4", "Con anuncios"],
    featured: false
  },
  {
    id: "ssstik",
    name: "SSSTik",
    category: "tiktok-fb",
    categoryLabel: "TikTok y Facebook",
    platforms: ["TikTok"],
    url: "https://ssstik.io",
    description: "Descarga vídeos públicos de TikTok sin marca de agua o extrae solo el sonido en MP3.",
    badges: ["Gratis", "Sin registro", "Sin marca de agua", "MP3"],
    featured: true
  },
  {
    id: "snaptik",
    name: "SnapTik",
    category: "tiktok-fb",
    categoryLabel: "TikTok y Facebook",
    platforms: ["TikTok"],
    url: "https://snaptik.app",
    description: "Alternativa rápida para bajar vídeos de TikTok sin marca de agua pegando el enlace.",
    badges: ["Gratis", "Sin registro", "MP4"],
    featured: false
  },
  {
    id: "fdown",
    name: "FDown",
    category: "tiktok-fb",
    categoryLabel: "TikTok y Facebook",
    platforms: ["Facebook"],
    url: "https://fdown.net",
    description: "Descarga vídeos públicos de Facebook en calidad estándar o HD sin necesidad de cuenta.",
    badges: ["Gratis", "Sin registro", "HD / MP4", "Con anuncios"],
    featured: false
  }
];

if (typeof window !== "undefined") {
  window.TOOLS_DIRECTORY = TOOLS_DIRECTORY;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = TOOLS_DIRECTORY;
}
