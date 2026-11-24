/**
 * MediaHub Directo - JavaScript ES6+
 * Directorio curado de descargadores web gratuitos sin registro.
 */

(function () {
  'use strict';

  // ==========================================================================
  // ESTADO DE LA APLICACIÓN
  // ==========================================================================
  const STORAGE_KEY_FAVORITES = 'mediahub_favorites';
  
  const state = {
    tools: Array.isArray(window.TOOLS_DIRECTORY) ? window.TOOLS_DIRECTORY : [],
    activeCategory: 'all',
    searchQuery: '',
    favorites: new Set(),
    detectedPlatform: null
  };

  // ==========================================================================
  // ELEMENTOS DEL DOM
  // ==========================================================================
  const DOM = {
    toolsGrid: document.getElementById('tools-grid'),
    emptyState: document.getElementById('empty-state'),
    toolsCount: document.getElementById('tools-count'),
    activeCategoryName: document.getElementById('active-category-name'),
    categoriesContainer: document.getElementById('categories-container'),
    categoryPills: document.querySelectorAll('.cat-pill'),
    favCounter: document.getElementById('fav-counter'),
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    btnResetFilters: document.getElementById('btn-reset-filters'),
    
    // Banner Inteligente
    quickDetectBanner: document.getElementById('quick-detect-banner'),
    bannerText: document.getElementById('banner-text'),
    bannerDismissBtn: document.getElementById('banner-dismiss-btn'),

    // Acciones de Verificación / Modal
    btnQuickVerify: document.getElementById('btn-quick-verify'),
    verifyModal: document.getElementById('verify-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    verifyForm: document.getElementById('verify-form'),
    verifyUrlInput: document.getElementById('verify-url-input'),
    btnModalPasteClipboard: document.getElementById('btn-modal-paste-clipboard'),
    modalResult: document.getElementById('modal-result'),

    // Toast y Footer
    toastContainer: document.getElementById('toast-container'),
    currentYear: document.getElementById('current-year')
  };

  // Nombres amigables de categorías
  const CATEGORY_NAMES = {
    all: 'Todas',
    favoritos: 'Favoritas',
    multiplataforma: 'Multiplataforma',
    youtube: 'YouTube',
    'x-twitter': 'X (Twitter)',
    instagram: 'Instagram',
    'tiktok-fb': 'TikTok y Facebook'
  };

  // ==========================================================================
  // INICIALIZACIÓN
  // ==========================================================================
  function init() {
    loadFavorites();
    setupYear();
    registerEventListeners();
    registerServiceWorker();
    render();
  }

  // ==========================================================================
  // GESTIÓN DE FAVORITOS (localStorage)
  // ==========================================================================
  function loadFavorites() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          state.favorites = new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('No se pudo acceder a localStorage para favoritos:', e);
      state.favorites = new Set();
    }
    updateFavoritesCounter();
  }

  function saveFavorites() {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify([...state.favorites]));
    } catch (e) {
      console.warn('Error guardando favoritos en localStorage:', e);
    }
    updateFavoritesCounter();
  }

  function toggleFavorite(toolId, toolName) {
    const isFav = state.favorites.has(toolId);
    if (isFav) {
      state.favorites.delete(toolId);
      showToast(`Quitado de favoritas: "${toolName}"`, 'default');
    } else {
      state.favorites.add(toolId);
      showToast(`Guardado en favoritas: "${toolName}"`, 'gold');
    }
    saveFavorites();
    render();
  }

  function updateFavoritesCounter() {
    const count = state.favorites.size;
    if (DOM.favCounter) {
      DOM.favCounter.textContent = count;
      DOM.favCounter.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  function setupYear() {
    if (DOM.currentYear) {
      DOM.currentYear.textContent = new Date().getFullYear();
    }
  }

  // ==========================================================================
  // NORMALIZACIÓN Y BÚSQUEDA
  // ==========================================================================
  function normalizeText(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function filterTools() {
    const normalizedQuery = normalizeText(state.searchQuery);

    return state.tools.filter(tool => {
      // 1. Filtro por categoría o favoritos
      if (state.activeCategory === 'favoritos') {
        if (!state.favorites.has(tool.id)) return false;
      } else if (state.activeCategory !== 'all') {
        if (tool.category !== state.activeCategory) return false;
      }

      // 2. Filtro por texto de búsqueda
      if (!normalizedQuery) return true;

      const nameMatch = normalizeText(tool.name).includes(normalizedQuery);
      const categoryMatch = normalizeText(tool.categoryLabel).includes(normalizedQuery);
      const descMatch = normalizeText(tool.description).includes(normalizedQuery);
      
      const platformsMatch = Array.isArray(tool.platforms) && 
        tool.platforms.some(p => normalizeText(p).includes(normalizedQuery));

      const badgesMatch = Array.isArray(tool.badges) && 
        tool.badges.some(b => normalizeText(b).includes(normalizedQuery));

      return nameMatch || categoryMatch || descMatch || platformsMatch || badgesMatch;
    });
  }

  // ==========================================================================
  // RENDERIZADO DE LA INTERFAZ
  // ==========================================================================
  function render() {
    const filteredTools = filterTools();

    // Actualizar contadores y etiquetas
    if (DOM.toolsCount) {
      DOM.toolsCount.textContent = filteredTools.length;
    }
    if (DOM.activeCategoryName) {
      DOM.activeCategoryName.textContent = CATEGORY_NAMES[state.activeCategory] || 'Todas';
    }

    // Gestionar estado vacío
    if (filteredTools.length === 0) {
      DOM.toolsGrid.innerHTML = '';
      DOM.emptyState.classList.add('visible');
      DOM.emptyState.setAttribute('aria-hidden', 'false');
      return;
    }

    DOM.emptyState.classList.remove('visible');
    DOM.emptyState.setAttribute('aria-hidden', 'true');

    // Construir HTML de las tarjetas
    const cardsHTML = filteredTools.map(tool => createToolCardHTML(tool)).join('');
    DOM.toolsGrid.innerHTML = cardsHTML;
  }

  function createToolCardHTML(tool) {
    const isFav = state.favorites.has(tool.id);
    const isFeatured = Boolean(tool.featured);

    // Badges procesadas con distinción visual "Sin anuncios" vs "Con anuncios"
    const badgesHTML = (tool.badges || []).map(badge => {
      const lowerBadge = badge.toLowerCase();
      let badgeClass = 'badge badge-default';

      if (lowerBadge.includes('sin anuncios')) {
        badgeClass = 'badge badge-no-ads';
      } else if (lowerBadge.includes('con anuncios')) {
        badgeClass = 'badge badge-with-ads';
      }

      return `<span class="${badgeClass}">${escapeHTML(badge)}</span>`;
    }).join('');

    // Plataformas soportadas
    const platformsHTML = (tool.platforms || []).map(platform => {
      return `<span class="platform-pill">${escapeHTML(platform)}</span>`;
    }).join('');

    return `
      <article class="tool-card ${isFeatured ? 'is-featured' : ''}" data-id="${escapeHTML(tool.id)}">
        <div>
          <!-- Cabecera de la Tarjeta -->
          <div class="card-header">
            <div class="card-title-area">
              <div class="card-meta-top">
                <span class="badge-category">${escapeHTML(tool.categoryLabel || tool.category)}</span>
                ${isFeatured ? '<span class="badge-featured" title="Recomendada por la comunidad">★ Recomendada</span>' : ''}
              </div>
              <h2 class="tool-name">${escapeHTML(tool.name)}</h2>
            </div>
            
            <!-- Botón Favorito (Estrella) -->
            <button 
              type="button" 
              class="btn-favorite ${isFav ? 'active' : ''}" 
              data-tool-id="${escapeHTML(tool.id)}"
              data-tool-name="${escapeHTML(tool.name)}"
              aria-label="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}"
              title="${isFav ? 'Quitar de favoritas' : 'Guardar en favoritas'}">
              ${isFav ? '★' : '☆'}
            </button>
          </div>

          <!-- Plataformas -->
          <div class="tool-platforms" style="margin-top: 0.65rem;">
            ${platformsHTML}
          </div>

          <!-- Descripción -->
          <p class="tool-description" style="margin-top: 0.65rem;">
            ${escapeHTML(tool.description)}
          </p>

          <!-- Badges de características -->
          <div class="tool-badges">
            ${badgesHTML}
          </div>
        </div>

        <!-- Botón de apertura directa -->
        <div class="card-footer">
          <a 
            href="${escapeHTML(tool.url)}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn-open-tool"
            aria-label="Abrir herramienta ${escapeHTML(tool.name)} en una nueva pestaña">
            <span>Abrir herramienta</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
    `;
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // DETECTOR DE PLATAFORMA POR URL
  // ==========================================================================
  function detectPlatformFromUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') return null;

    const clean = urlString.trim().toLowerCase();

    // YouTube
    if (/youtube\.com|youtu\.be/i.test(clean)) {
      return {
        id: 'youtube',
        name: 'YouTube',
        message: '¡Enlace de YouTube detectado! Mostrando conversores y descargadores de YouTube.'
      };
    }

    // X / Twitter
    if (/twitter\.com|x\.com|t\.co/i.test(clean)) {
      return {
        id: 'x-twitter',
        name: 'X (Twitter)',
        message: '¡Enlace de X / Twitter detectado! Mostrando herramientas para descargar posts de X.'
      };
    }

    // Instagram
    if (/instagram\.com|instagr\.am/i.test(clean)) {
      return {
        id: 'instagram',
        name: 'Instagram',
        message: '¡Enlace de Instagram detectado! Mostrando descargadores de Reels y publicaciones.'
      };
    }

    // TikTok
    if (/tiktok\.com/i.test(clean)) {
      return {
        id: 'tiktok-fb',
        name: 'TikTok',
        message: '¡Enlace de TikTok detectado! Mostrando descargadores sin marca de agua.'
      };
    }

    // Facebook
    if (/facebook\.com|fb\.watch|fb\.com/i.test(clean)) {
      return {
        id: 'tiktok-fb',
        name: 'Facebook',
        message: '¡Enlace de Facebook detectado! Mostrando herramientas para vídeos públicos de Facebook.'
      };
    }

    // Reddit & Vimeo (Multiplataforma)
    if (/reddit\.com|vimeo\.com/i.test(clean)) {
      return {
        id: 'multiplataforma',
        name: 'Multiplataforma',
        message: '¡Enlace compatible detectado! Mostrando herramientas multiplataforma.'
      };
    }

    return null;
  }

  function applyDetectedCategory(platformInfo) {
    if (!platformInfo) return;

    // Cambiar categoría activa
    setCategory(platformInfo.id);

    // Mostrar banner informativo
    if (DOM.quickDetectBanner && DOM.bannerText) {
      DOM.bannerText.textContent = platformInfo.message;
      DOM.quickDetectBanner.classList.add('visible');
    }

    // Mostrar notificación Toast
    showToast(`⚡ Enlace de ${platformInfo.name} reconocido`, 'gold');

    // Desplazar suavemente a los resultados
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ==========================================================================
  // MANEJO DEL PORTAPAPELES Y MODAL
  // ==========================================================================
  async function handleQuickVerifyClick() {
    // 1. Intentar leer automáticamente el portapapeles si la API está disponible
    if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
      try {
        const text = await navigator.clipboard.readText();
        const detected = detectPlatformFromUrl(text);

        if (detected) {
          applyDetectedCategory(detected);
          return;
        } else if (text && text.startsWith('http')) {
          // Es URL pero plataforma no directa -> abrir modal con la URL ya puesta
          openVerifyModal(text);
          return;
        }
      } catch (err) {
        // En muchos navegadores móviles, el acceso directo requiere permiso previo o gesto explícito
        console.info('Acceso automático al portapapeles no concedido, abriendo modal interactivo:', err);
      }
    }

    // 2. Si no se detectó URL directa o no hubo permiso, abrir el modal de verificación rápida
    openVerifyModal();
  }

  function openVerifyModal(prefillValue = '') {
    if (!DOM.verifyModal) return;
    DOM.verifyModal.classList.add('open');
    DOM.verifyModal.setAttribute('aria-hidden', 'false');

    if (DOM.modalResult) {
      DOM.modalResult.className = 'modal-result';
      DOM.modalResult.textContent = '';
    }

    if (DOM.verifyUrlInput) {
      DOM.verifyUrlInput.value = prefillValue;
      setTimeout(() => DOM.verifyUrlInput.focus(), 100);
    }
  }

  function closeVerifyModal() {
    if (!DOM.verifyModal) return;
    DOM.verifyModal.classList.remove('open');
    DOM.verifyModal.setAttribute('aria-hidden', 'true');
  }

  async function pasteIntoModalFromClipboard() {
    if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
      try {
        const text = await navigator.clipboard.readText();
        if (DOM.verifyUrlInput && text) {
          DOM.verifyUrlInput.value = text.trim();
          executeVerification(text.trim());
        }
      } catch (err) {
        showToast('Usa el atajo de pegar o mantén pulsado el campo para pegar.', 'default');
      }
    } else {
      showToast('Mantén pulsado en la caja de texto para pegar el enlace.', 'default');
    }
  }

  function executeVerification(urlString) {
    const detected = detectPlatformFromUrl(urlString);

    if (detected) {
      if (DOM.modalResult) {
        DOM.modalResult.className = 'modal-result success visible';
        DOM.modalResult.textContent = `✓ Reconocido como ${detected.name}. Redirigiendo a las herramientas óptimas...`;
      }
      setTimeout(() => {
        closeVerifyModal();
        applyDetectedCategory(detected);
      }, 700);
    } else if (urlString && (urlString.startsWith('http://') || urlString.startsWith('https://'))) {
      if (DOM.modalResult) {
        DOM.modalResult.className = 'modal-result warning visible';
        DOM.modalResult.textContent = 'Enlace genérico detectado. Te recomendamos probar Cobalt o SaveFrom en la categoría Multiplataforma.';
      }
      setTimeout(() => {
        closeVerifyModal();
        setCategory('multiplataforma');
      }, 1400);
    } else {
      if (DOM.modalResult) {
        DOM.modalResult.className = 'modal-result warning visible';
        DOM.modalResult.textContent = 'Introduce una URL válida que empiece por https://';
      }
    }
  }

  // ==========================================================================
  // CAMBIO DE CATEGORÍAS
  // ==========================================================================
  function setCategory(categoryKey) {
    state.activeCategory = categoryKey;

    // Actualizar estilos activos de las píldoras
    DOM.categoryPills.forEach(pill => {
      const pillCat = pill.dataset.category;
      const isActive = pillCat === categoryKey;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');

      // Scroll horizontal automático si la píldora queda fuera de pantalla
      if (isActive && DOM.categoriesContainer) {
        const containerRect = DOM.categoriesContainer.getBoundingClientRect();
        const pillRect = pill.getBoundingClientRect();
        if (pillRect.left < containerRect.left || pillRect.right > containerRect.right) {
          pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    });

    render();
  }

  // ==========================================================================
  // SISTEMA DE TOASTS FLOTANTES
  // ==========================================================================
  function showToast(message, type = 'default') {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'gold' ? 'gold' : ''}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'gold' ? '★' : 'ℹ'}</span>
      <span>${escapeHTML(message)}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, 3200);
  }

  // ==========================================================================
  // GESTIÓN DE EVENTOS
  // ==========================================================================
  function registerEventListeners() {
    // 1. Clic en las píldoras de categoría
    DOM.categoriesContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.cat-pill');
      if (!pill) return;
      const category = pill.dataset.category;
      if (category) {
        setCategory(category);
      }
    });

    // 2. Buscador instantáneo en tiempo real
    DOM.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      const hasValue = state.searchQuery.trim().length > 0;
      DOM.searchClearBtn.classList.toggle('visible', hasValue);
      render();
    });

    // 3. Limpiar buscador
    DOM.searchClearBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      state.searchQuery = '';
      DOM.searchClearBtn.classList.remove('visible');
      DOM.searchInput.focus();
      render();
    });

    // 4. Restablecer filtros desde estado vacío
    DOM.btnResetFilters.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.searchInput.value = '';
      DOM.searchClearBtn.classList.remove('visible');
      setCategory('all');
    });

    // 5. Clics en la cuadrícula (delegación para favoritos)
    DOM.toolsGrid.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.btn-favorite');
      if (favBtn) {
        e.preventDefault();
        const toolId = favBtn.dataset.toolId;
        const toolName = favBtn.dataset.toolName;
        if (toolId) {
          toggleFavorite(toolId, toolName);
        }
      }
    });

    // 6. Botón de verificación rápida de enlace
    DOM.btnQuickVerify.addEventListener('click', handleQuickVerifyClick);

    // 7. Modal de verificación rápida
    DOM.modalCloseBtn.addEventListener('click', closeVerifyModal);
    DOM.verifyModal.addEventListener('click', (e) => {
      if (e.target === DOM.verifyModal) {
        closeVerifyModal();
      }
    });

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.verifyModal.classList.contains('open')) {
        closeVerifyModal();
      }
    });

    // Formulario de verificación en modal
    DOM.verifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const urlVal = DOM.verifyUrlInput.value.trim();
      executeVerification(urlVal);
    });

    DOM.btnModalPasteClipboard.addEventListener('click', pasteIntoModalFromClipboard);

    // 8. Cerrar Banner informativo
    DOM.bannerDismissBtn.addEventListener('click', () => {
      DOM.quickDetectBanner.classList.remove('visible');
    });
  }

  // ==========================================================================
  // REGISTRO DE SERVICE WORKER (PWA)
  // ==========================================================================
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('MediaHub SW registrado con éxito:', registration.scope);
          })
          .catch((err) => {
            console.warn('Fallo en el registro del SW:', err);
          });
      });
    }
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
