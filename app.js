/**
 * MediaHub Directo - JavaScript ES6+
 * Directorio curado de descargadores web gratuitos sin registro.
 * Incluye Modo Gestión/Edición (Añadir enlaces, Editar datos y Borrar herramientas).
 */

(function () {
  'use strict';

  // ==========================================================================
  // CLAVES DE ALMACENAMIENTO (localStorage)
  // ==========================================================================
  const STORAGE_KEY_CATALOG = 'mediahub_catalog';
  const STORAGE_KEY_FAVORITES = 'mediahub_favorites';
  const STORAGE_KEY_EDIT_MODE = 'mediahub_edit_mode';

  // ==========================================================================
  // ESTADO DE LA APLICACIÓN
  // ==========================================================================
  const state = {
    tools: [],
    activeCategory: 'all',
    searchQuery: '',
    favorites: new Set(),
    isEditMode: true,
    detectedPlatform: null,
    pendingDeleteId: null
  };

  // Nombres y etiquetas oficiales de categorías
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
    btnEmptyAddTool: document.getElementById('btn-empty-add-tool'),

    // Modo Edición / Gestión
    btnToggleEdit: document.getElementById('btn-toggle-edit'),
    adminManagementBar: document.getElementById('admin-management-bar'),
    btnAdminAddTool: document.getElementById('btn-admin-add-tool'),
    btnAdminExportData: document.getElementById('btn-admin-export-data'),
    btnAdminResetData: document.getElementById('btn-admin-reset-data'),

    // Modal Editor de Sitios
    toolEditorModal: document.getElementById('tool-editor-modal'),
    modalEditorCloseBtn: document.getElementById('modal-editor-close-btn'),
    modalEditorCancelBtn: document.getElementById('modal-editor-cancel-btn'),
    toolEditorForm: document.getElementById('tool-editor-form'),
    editorTitleText: document.getElementById('editor-title-text'),
    formToolId: document.getElementById('form-tool-id'),
    formToolName: document.getElementById('form-tool-name'),
    formToolCategory: document.getElementById('form-tool-category'),
    formToolUrl: document.getElementById('form-tool-url'),
    formToolPlatforms: document.getElementById('form-tool-platforms'),
    formToolDesc: document.getElementById('form-tool-desc'),
    formToolBadges: document.getElementById('form-tool-badges'),
    formToolFeatured: document.getElementById('form-tool-featured'),

    // Modal Confirmación de Borrado
    deleteConfirmModal: document.getElementById('delete-confirm-modal'),
    modalDeleteCloseBtn: document.getElementById('modal-delete-close-btn'),
    modalDeleteCancelBtn: document.getElementById('modal-delete-cancel-btn'),
    modalDeleteConfirmBtn: document.getElementById('modal-delete-confirm-btn'),
    deleteConfirmMessage: document.getElementById('delete-confirm-message'),

    // Banner Inteligente
    quickDetectBanner: document.getElementById('quick-detect-banner'),
    bannerText: document.getElementById('banner-text'),
    bannerDismissBtn: document.getElementById('banner-dismiss-btn'),

    // Verificación Rápida / Portapapeles
    btnQuickVerify: document.getElementById('btn-quick-verify'),
    verifyModal: document.getElementById('verify-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    verifyForm: document.getElementById('verify-form'),
    verifyUrlInput: document.getElementById('verify-url-input'),
    btnModalPasteClipboard: document.getElementById('btn-modal-paste-clipboard'),
    modalResult: document.getElementById('modal-result'),

    // Toast y Pie
    toastContainer: document.getElementById('toast-container'),
    currentYear: document.getElementById('current-year')
  };

  // ==========================================================================
  // INICIALIZACIÓN
  // ==========================================================================
  function init() {
    loadCatalog();
    loadFavorites();
    loadEditMode();
    setupYear();
    registerEventListeners();
    registerServiceWorker();
    render();
  }

  // ==========================================================================
  // GESTIÓN DEL CATÁLOGO (localStorage)
  // ==========================================================================
  function loadCatalog() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATALOG);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          state.tools = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Error leyendo catálogo de localStorage:', e);
    }

    // Si no hay datos guardados, usamos los predeterminados de data.js
    if (Array.isArray(window.TOOLS_DIRECTORY)) {
      state.tools = JSON.parse(JSON.stringify(window.TOOLS_DIRECTORY));
    } else {
      state.tools = [];
    }
  }

  function saveCatalog() {
    try {
      localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(state.tools));
    } catch (e) {
      console.warn('Error guardando catálogo en localStorage:', e);
    }
  }

  function resetCatalogToDefault() {
    if (!Array.isArray(window.TOOLS_DIRECTORY)) return;
    state.tools = JSON.parse(JSON.stringify(window.TOOLS_DIRECTORY));
    try {
      localStorage.removeItem(STORAGE_KEY_CATALOG);
    } catch (e) {
      console.warn(e);
    }
    render();
    showToast('Catálogo inicial de 11 herramientas restablecido.', 'default');
  }

  // ==========================================================================
  // GESTIÓN DE MODO EDICIÓN
  // ==========================================================================
  function loadEditMode() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EDIT_MODE);
      // Por defecto activo para responder a la petición del usuario
      state.isEditMode = stored !== null ? stored === 'true' : true;
    } catch (e) {
      state.isEditMode = true;
    }
    applyEditModeUI();
  }

  function toggleEditMode() {
    state.isEditMode = !state.isEditMode;
    try {
      localStorage.setItem(STORAGE_KEY_EDIT_MODE, String(state.isEditMode));
    } catch (e) {}
    applyEditModeUI();
    showToast(state.isEditMode ? '🛠️ Modo Edición activado' : '👁️ Modo Vista normal activado', 'default');
  }

  function applyEditModeUI() {
    if (state.isEditMode) {
      document.body.classList.add('edit-mode-active');
      if (DOM.btnToggleEdit) {
        DOM.btnToggleEdit.setAttribute('aria-pressed', 'true');
        DOM.btnToggleEdit.title = 'Desactivar modo edición';
      }
    } else {
      document.body.classList.remove('edit-mode-active');
      if (DOM.btnToggleEdit) {
        DOM.btnToggleEdit.setAttribute('aria-pressed', 'false');
        DOM.btnToggleEdit.title = 'Activar modo edición';
      }
    }
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
      const categoryMatch = normalizeText(tool.categoryLabel || tool.category).includes(normalizedQuery);
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
                <span class="badge-category">${escapeHTML(tool.categoryLabel || CATEGORY_NAMES[tool.category] || tool.category)}</span>
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

        <!-- Acciones del Modo Edición (Editar / Borrar) -->
        <div class="card-admin-actions">
          <button type="button" class="btn-card-edit" data-tool-id="${escapeHTML(tool.id)}" title="Editar enlace o información">
            <span>✏️ Editar</span>
          </button>
          <button type="button" class="btn-card-delete" data-tool-id="${escapeHTML(tool.id)}" data-tool-name="${escapeHTML(tool.name)}" title="Eliminar este sitio">
            <span>🗑️ Borrar</span>
          </button>
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
  // OPERACIONES CRUD (AÑADIR, EDITAR Y BORRAR SITIOS)
  // ==========================================================================
  function openAddToolModal() {
    DOM.toolEditorForm.reset();
    DOM.formToolId.value = '';
    DOM.editorTitleText.textContent = 'Añadir Nuevo Sitio';
    DOM.formToolCategory.value = state.activeCategory !== 'all' && state.activeCategory !== 'favoritos' 
      ? state.activeCategory 
      : 'multiplataforma';
    DOM.toolEditorModal.classList.add('open');
    DOM.formToolName.focus();
  }

  function openEditToolModal(toolId) {
    const tool = state.tools.find(t => t.id === toolId);
    if (!tool) return;

    DOM.formToolId.value = tool.id;
    DOM.formToolName.value = tool.name;
    DOM.formToolUrl.value = tool.url;
    DOM.formToolCategory.value = tool.category;
    DOM.formToolPlatforms.value = Array.isArray(tool.platforms) ? tool.platforms.join(', ') : '';
    DOM.formToolDesc.value = tool.description || '';
    DOM.formToolBadges.value = Array.isArray(tool.badges) ? tool.badges.join(', ') : '';
    DOM.formToolFeatured.checked = Boolean(tool.featured);

    DOM.editorTitleText.textContent = `Editar Sitio: ${tool.name}`;
    DOM.toolEditorModal.classList.add('open');
    DOM.formToolName.focus();
  }

  function closeToolEditorModal() {
    DOM.toolEditorModal.classList.remove('open');
    DOM.toolEditorForm.reset();
  }

  function handleSaveToolSubmit(e) {
    e.preventDefault();

    const name = DOM.formToolName.value.trim();
    const url = DOM.formToolUrl.value.trim();
    const category = DOM.formToolCategory.value;
    const categoryLabel = CATEGORY_NAMES[category] || category;
    const desc = DOM.formToolDesc.value.trim();
    const featured = DOM.formToolFeatured.checked;

    // Procesar plataformas
    const platformsRaw = DOM.formToolPlatforms.value.trim();
    const platforms = platformsRaw 
      ? platformsRaw.split(',').map(p => p.trim()).filter(Boolean)
      : [categoryLabel];

    // Procesar badges
    const badgesRaw = DOM.formToolBadges.value.trim();
    let badges = badgesRaw 
      ? badgesRaw.split(',').map(b => b.trim()).filter(Boolean)
      : ['Gratis', 'Sin registro', 'MP4'];

    const editingId = DOM.formToolId.value;

    if (editingId) {
      // Modo Edición
      const toolIndex = state.tools.findIndex(t => t.id === editingId);
      if (toolIndex !== -1) {
        state.tools[toolIndex] = {
          ...state.tools[toolIndex],
          name,
          url,
          category,
          categoryLabel,
          platforms,
          description: desc,
          badges,
          featured
        };
        saveCatalog();
        render();
        closeToolEditorModal();
        showToast(`Sitio "${name}" actualizado con éxito.`, 'gold');
      }
    } else {
      // Modo Nuevo
      // Generar slug/id único
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueId = baseSlug ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : `tool-${Date.now()}`;

      const newTool = {
        id: uniqueId,
        name,
        category,
        categoryLabel,
        platforms,
        url,
        description: desc,
        badges,
        featured
      };

      state.tools.unshift(newTool); // Aparece al principio para fácil revisión
      saveCatalog();
      render();
      closeToolEditorModal();
      showToast(`¡Sitio "${name}" añadido al catálogo!`, 'gold');
    }
  }

  function promptDeleteTool(toolId, toolName) {
    state.pendingDeleteId = toolId;
    if (DOM.deleteConfirmMessage) {
      DOM.deleteConfirmMessage.innerHTML = `¿Seguro que deseas eliminar <strong>${escapeHTML(toolName)}</strong> del directorio? Esta acción no se puede deshacer en tu sesión actual.`;
    }
    DOM.deleteConfirmModal.classList.add('open');
  }

  function closeDeleteConfirmModal() {
    state.pendingDeleteId = null;
    DOM.deleteConfirmModal.classList.remove('open');
  }

  function confirmDeleteTool() {
    if (!state.pendingDeleteId) return;

    const toolToDelete = state.tools.find(t => t.id === state.pendingDeleteId);
    const toolName = toolToDelete ? toolToDelete.name : 'Sitio';

    state.tools = state.tools.filter(t => t.id !== state.pendingDeleteId);
    state.favorites.delete(state.pendingDeleteId);

    saveCatalog();
    saveFavorites();
    render();
    closeDeleteConfirmModal();
    showToast(`"${toolName}" ha sido eliminado del directorio.`, 'default');
  }

  // Exportar datos actuales a formato data.js (para cuando el usuario decida bloquear la web)
  function exportDataToClipboard() {
    const formattedData = `const TOOLS_DIRECTORY = ${JSON.stringify(state.tools, null, 2)};\n\nif (typeof window !== "undefined") {\n  window.TOOLS_DIRECTORY = TOOLS_DIRECTORY;\n}\nif (typeof module !== "undefined" && module.exports) {\n  module.exports = TOOLS_DIRECTORY;\n}`;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(formattedData)
        .then(() => {
          showToast('📋 ¡Datos copiados al portapapeles! Listo para pegarlos.', 'gold');
        })
        .catch(() => {
          downloadDataAsFile(formattedData);
        });
    } else {
      downloadDataAsFile(formattedData);
    }
  }

  function downloadDataAsFile(content) {
    const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo data.js descargado con tus cambios.', 'gold');
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

    setCategory(platformInfo.id);

    if (DOM.quickDetectBanner && DOM.bannerText) {
      DOM.bannerText.textContent = platformInfo.message;
      DOM.quickDetectBanner.classList.add('visible');
    }

    showToast(`⚡ Enlace de ${platformInfo.name} reconocido`, 'gold');

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ==========================================================================
  // MANEJO DEL PORTAPAPELES Y MODAL DE VERIFICACIÓN
  // ==========================================================================
  async function handleQuickVerifyClick() {
    if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
      try {
        const text = await navigator.clipboard.readText();
        const detected = detectPlatformFromUrl(text);

        if (detected) {
          applyDetectedCategory(detected);
          return;
        } else if (text && text.startsWith('http')) {
          openVerifyModal(text);
          return;
        }
      } catch (err) {
        console.info('Acceso automático al portapapeles no concedido:', err);
      }
    }

    openVerifyModal();
  }

  function openVerifyModal(prefillValue = '') {
    if (!DOM.verifyModal) return;
    DOM.verifyModal.classList.add('open');

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
        DOM.modalResult.textContent = `✓ Reconocido como ${detected.name}. Mostrando herramientas óptimas...`;
      }
      setTimeout(() => {
        closeVerifyModal();
        applyDetectedCategory(detected);
      }, 700);
    } else if (urlString && (urlString.startsWith('http://') || urlString.startsWith('https://'))) {
      if (DOM.modalResult) {
        DOM.modalResult.className = 'modal-result warning visible';
        DOM.modalResult.textContent = 'Enlace genérico detectado. Te recomendamos probar las herramientas Multiplataforma.';
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

    DOM.categoryPills.forEach(pill => {
      const pillCat = pill.dataset.category;
      const isActive = pillCat === categoryKey;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');

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

    // 5. Clics en la cuadrícula (delegación para favoritos, editar y borrar)
    DOM.toolsGrid.addEventListener('click', (e) => {
      // Favoritos
      const favBtn = e.target.closest('.btn-favorite');
      if (favBtn) {
        e.preventDefault();
        const toolId = favBtn.dataset.toolId;
        const toolName = favBtn.dataset.toolName;
        if (toolId) toggleFavorite(toolId, toolName);
        return;
      }

      // Editar
      const editBtn = e.target.closest('.btn-card-edit');
      if (editBtn) {
        e.preventDefault();
        const toolId = editBtn.dataset.toolId;
        if (toolId) openEditToolModal(toolId);
        return;
      }

      // Borrar
      const deleteBtn = e.target.closest('.btn-card-delete');
      if (deleteBtn) {
        e.preventDefault();
        const toolId = deleteBtn.dataset.toolId;
        const toolName = deleteBtn.dataset.toolName;
        if (toolId) promptDeleteTool(toolId, toolName);
        return;
      }
    });

    // 6. Botones de Modo Edición
    DOM.btnToggleEdit.addEventListener('click', toggleEditMode);
    DOM.btnAdminAddTool.addEventListener('click', openAddToolModal);
    if (DOM.btnEmptyAddTool) {
      DOM.btnEmptyAddTool.addEventListener('click', openAddToolModal);
    }
    DOM.btnAdminExportData.addEventListener('click', exportDataToClipboard);
    DOM.btnAdminResetData.addEventListener('click', () => {
      if (confirm('¿Deseas restablecer el catálogo original de 11 herramientas? Se descartarán los cambios no exportados.')) {
        resetCatalogToDefault();
      }
    });

    // 7. Modales de Edición y Borrado
    DOM.toolEditorForm.addEventListener('submit', handleSaveToolSubmit);
    DOM.modalEditorCloseBtn.addEventListener('click', closeToolEditorModal);
    DOM.modalEditorCancelBtn.addEventListener('click', closeToolEditorModal);
    DOM.toolEditorModal.addEventListener('click', (e) => {
      if (e.target === DOM.toolEditorModal) closeToolEditorModal();
    });

    DOM.modalDeleteCloseBtn.addEventListener('click', closeDeleteConfirmModal);
    DOM.modalDeleteCancelBtn.addEventListener('click', closeDeleteConfirmModal);
    DOM.modalDeleteConfirmBtn.addEventListener('click', confirmDeleteTool);
    DOM.deleteConfirmModal.addEventListener('click', (e) => {
      if (e.target === DOM.deleteConfirmModal) closeDeleteConfirmModal();
    });

    // 8. Botón y Modal de Verificación Rápida
    DOM.btnQuickVerify.addEventListener('click', handleQuickVerifyClick);
    DOM.modalCloseBtn.addEventListener('click', closeVerifyModal);
    DOM.verifyModal.addEventListener('click', (e) => {
      if (e.target === DOM.verifyModal) closeVerifyModal();
    });
    DOM.verifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const urlVal = DOM.verifyUrlInput.value.trim();
      executeVerification(urlVal);
    });
    DOM.btnModalPasteClipboard.addEventListener('click', pasteIntoModalFromClipboard);

    // 9. Banner
    DOM.bannerDismissBtn.addEventListener('click', () => {
      DOM.quickDetectBanner.classList.remove('visible');
    });

    // Escape para cerrar cualquier modal abierto
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.toolEditorModal.classList.contains('open')) closeToolEditorModal();
        if (DOM.deleteConfirmModal.classList.contains('open')) closeDeleteConfirmModal();
        if (DOM.verifyModal.classList.contains('open')) closeVerifyModal();
      }
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
