/**
 * Asset Zone Display
 * Vanilla JS component for displaying photos in zones with different display modes
 * Supports: single, slideshow, grid, lightbox modes
 *
 * Usage:
 * HTML: <div class="asset-zone" data-zone-id="home-hero" data-page-path="/"></div>
 * JavaScript: AssetZoneDisplay.initAll();
 *
 * Or initialize specific zone:
 * AssetZoneDisplay.loadZone('home-hero', '/', document.getElementById('myZone'));
 */

const AssetZoneDisplay = {
  API_BASE_URL: window.API_BASE_URL || (window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : ''),  // Same-origin in production

  /**
   * Initialize all asset zones on the page
   */
  async initAll() {
    const zones = document.querySelectorAll('[data-zone-id]');
    console.log(`🎨 Initializing ${zones.length} asset zone(s)`);

    for (const zoneEl of zones) {
      const zoneId = zoneEl.dataset.zoneId;
      const pagePath = zoneEl.dataset.pagePath || window.location.pathname;
      await this.loadZone(zoneId, pagePath, zoneEl);
    }
  },

  /**
   * Load a specific zone
   */
  async loadZone(zoneId, pagePath = '/', containerEl) {
    try {
      console.log(`📦 Loading zone: ${zoneId} for page: ${pagePath}`);

      // Use the public API endpoint
      const url = `${this.API_BASE_URL}/api/zones/public/${encodeURIComponent(zoneId)}?page_path=${encodeURIComponent(pagePath)}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Zone ${zoneId} returned ${response.status}`);
        // Keep default content if zone doesn't exist
        return;
      }

      const data = await response.json();

      if (!data.success || !data.zone || !data.assets || data.assets.length === 0) {
        console.log(`Zone ${zoneId} has no assets, keeping default content`);
        // Don't clear container - keep default/fallback content
        return;
      }

      const zone = data.zone;
      const assets = data.assets;

      console.log(`✅ Zone ${zoneId}: ${assets.length} asset(s), mode: ${zone.display_mode}`);

      const displayMode = zone.display_mode || 'single';
      const config = zone.configuration || {};

      switch (displayMode) {
        case 'single':
          this.renderSingle(containerEl, assets, config);
          break;
        case 'slideshow':
          this.renderSlideshow(containerEl, assets, config);
          break;
        case 'grid':
          this.renderGrid(containerEl, assets, config);
          break;
        case 'lightbox':
          this.renderLightbox(containerEl, assets, config);
          break;
        default:
          console.error(`Unknown display mode: ${displayMode}`);
      }
    } catch (error) {
      console.error(`Error loading zone ${zoneId}:`, error);
      // Don't clear container on error - keep default content
    }
  },

  /**
   * Render single asset
   */
  renderSingle(container, assets, config) {
    const asset = assets[0];
    const objectFit = config.objectFit || 'cover';
    const objectPosition = config.objectPosition || 'center';

    container.innerHTML = `
      <div class="asset-zone-single" style="width: 100%; height: 100%;">
        <img
          src="${asset.url}"
          alt="${asset.alt_text || ''}"
          loading="lazy"
          decoding="async"
          style="width: 100%; height: 100%; object-fit: ${objectFit}; object-position: ${objectPosition};"
        >
        ${asset.caption ? `<div class="asset-caption">${asset.caption}</div>` : ''}
      </div>
    `;

    // Handle click link
    if (asset.link_url) {
      container.style.cursor = 'pointer';
      container.addEventListener('click', () => {
        window.location.href = asset.link_url;
      });
    }
  },

  /**
   * Render slideshow
   */
  renderSlideshow(container, assets, config) {
    let currentIndex = 0;
    const transition = config.transition || 'fade';
    const speed = config.speed || 5000;
    const autoAdvance = config.autoAdvance !== false;
    const showControls = config.showControls !== false;
    const showIndicators = config.showIndicators !== false;
    const objectFit = config.objectFit || 'cover';

    container.innerHTML = `
      <div class="asset-zone-slideshow" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
        <div class="slideshow-track" style="position: relative; width: 100%; height: 100%;">
          ${assets.map((asset, i) => `
            <div class="slideshow-slide ${i === 0 ? 'active' : ''}"
                 style="position: absolute; inset: 0; opacity: ${i === 0 ? 1 : 0}; transition: opacity 0.5s ease;">
              <img
                src="${asset.url}"
                alt="${asset.alt_text || ''}"
                loading="${i === 0 ? 'eager' : 'lazy'}"
                decoding="async"
                style="width: 100%; height: 100%; object-fit: ${objectFit};"
              >
              ${asset.caption ? `<div class="asset-caption">${asset.caption}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ${assets.length > 1 && showControls ? `
          <button class="slideshow-prev" aria-label="Previous slide"
                  style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(0,0,0,0.5); color: white; border: none; padding: 1rem; cursor: pointer; font-size: 1.5rem; border-radius: 50%;">
            &#8249;
          </button>
          <button class="slideshow-next" aria-label="Next slide"
                  style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(0,0,0,0.5); color: white; border: none; padding: 1rem; cursor: pointer; font-size: 1.5rem; border-radius: 50%;">
            &#8250;
          </button>
        ` : ''}
        ${assets.length > 1 && showIndicators ? `
          <div class="slideshow-indicators" style="position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 0.5rem;">
            ${assets.map((_, i) => `
              <span data-index="${i}"
                    style="width: 10px; height: 10px; border-radius: 50%; background: ${i === 0 ? 'white' : 'rgba(255,255,255,0.5)'}; cursor: pointer;">
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    if (assets.length > 1) {
      const slides = container.querySelectorAll('.slideshow-slide');
      const indicators = container.querySelectorAll('.slideshow-indicators span');

      const showSlide = (index) => {
        slides.forEach((s, i) => {
          s.style.opacity = i === index ? '1' : '0';
          s.classList.toggle('active', i === index);
        });
        indicators.forEach((ind, i) => {
          ind.style.background = i === index ? 'white' : 'rgba(255,255,255,0.5)';
        });
        currentIndex = index;
      };

      const prevBtn = container.querySelector('.slideshow-prev');
      const nextBtn = container.querySelector('.slideshow-next');

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newIndex = (currentIndex - 1 + assets.length) % assets.length;
          showSlide(newIndex);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newIndex = (currentIndex + 1) % assets.length;
          showSlide(newIndex);
        });
      }

      indicators.forEach((indicator, i) => {
        indicator.addEventListener('click', (e) => {
          e.stopPropagation();
          showSlide(i);
        });
      });

      // Auto-advance
      if (autoAdvance) {
        let autoAdvanceTimer;
        const startAutoAdvance = () => {
          autoAdvanceTimer = setInterval(() => {
            const newIndex = (currentIndex + 1) % assets.length;
            showSlide(newIndex);
          }, speed);
        };

        const stopAutoAdvance = () => {
          clearInterval(autoAdvanceTimer);
        };

        container.addEventListener('mouseenter', stopAutoAdvance);
        container.addEventListener('mouseleave', startAutoAdvance);
        startAutoAdvance();
      }
    }
  },

  /**
   * Render grid
   */
  renderGrid(container, assets, config) {
    const columns = config.columns || 3;
    const gap = config.gap || '1rem';
    const objectFit = config.objectFit || 'cover';

    container.innerHTML = `
      <div class="asset-zone-grid" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: ${gap};">
        ${assets.map(asset => `
          <div class="grid-item" style="overflow: hidden; border-radius: 0.5rem;">
            <img
              src="${asset.url}"
              alt="${asset.alt_text || ''}"
              loading="lazy"
              decoding="async"
              style="width: 100%; height: 100%; object-fit: ${objectFit}; transition: transform 0.3s;"
              onmouseover="this.style.transform='scale(1.05)'"
              onmouseout="this.style.transform='scale(1)'"
            >
            ${asset.caption ? `<div class="asset-caption">${asset.caption}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * Render lightbox gallery
   */
  renderLightbox(container, assets, config) {
    const columns = config.columns || 4;
    const gap = config.gap || '0.5rem';

    container.innerHTML = `
      <div class="asset-zone-lightbox" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: ${gap};">
        ${assets.map((asset, i) => `
          <div class="lightbox-thumb" data-index="${i}" data-photo-url="${asset.url}"
               style="cursor: pointer; overflow: hidden; border-radius: 0.25rem; aspect-ratio: 1;">
            <img
              src="${asset.url}"
              alt="${asset.alt_text || ''}"
              loading="lazy"
              decoding="async"
              style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;"
              onmouseover="this.style.transform='scale(1.1)'"
              onmouseout="this.style.transform='scale(1)'"
            >
          </div>
        `).join('')}
      </div>
    `;

    // Setup lightbox click handlers
    container.querySelectorAll('.lightbox-thumb').forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        // Check if global openLightbox function exists (from gallery.html)
        if (typeof openLightbox === 'function') {
          openLightbox(i);
        } else {
          // Simple fallback lightbox
          this.openSimpleLightbox(assets, i);
        }
      });
    });
  },

  /**
   * Simple fallback lightbox (if gallery lightbox not available)
   */
  openSimpleLightbox(assets, startIndex) {
    let currentIndex = startIndex;

    const overlay = document.createElement('div');
    overlay.className = 'simple-lightbox-overlay';
    overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 9999; display: flex; align-items: center; justify-content: center;';
    overlay.innerHTML = `
      <div class="simple-lightbox" style="position: relative; max-width: 90vw; max-height: 90vh;">
        <button class="lightbox-close" style="position: absolute; top: -2rem; right: 0; background: none; border: none; color: white; font-size: 2rem; cursor: pointer;">&times;</button>
        <button class="lightbox-prev" style="position: absolute; left: -3rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: white; font-size: 3rem; cursor: pointer;">&lsaquo;</button>
        <img class="lightbox-image" src="" alt="" style="max-width: 90vw; max-height: 85vh; object-fit: contain;">
        <button class="lightbox-next" style="position: absolute; right: -3rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: white; font-size: 3rem; cursor: pointer;">&rsaquo;</button>
        <div class="lightbox-caption" style="position: absolute; bottom: -2rem; left: 0; right: 0; text-align: center; color: white;"></div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const img = overlay.querySelector('.lightbox-image');
    const caption = overlay.querySelector('.lightbox-caption');

    const showImage = (index) => {
      const asset = assets[index];
      img.src = asset.url;
      img.alt = asset.alt_text || '';
      caption.textContent = asset.caption || '';
      currentIndex = index;
    };

    overlay.querySelector('.lightbox-close').addEventListener('click', () => {
      overlay.remove();
      document.body.style.overflow = '';
    });

    overlay.querySelector('.lightbox-prev').addEventListener('click', () => {
      const newIndex = (currentIndex - 1 + assets.length) % assets.length;
      showImage(newIndex);
    });

    overlay.querySelector('.lightbox-next').addEventListener('click', () => {
      const newIndex = (currentIndex + 1) % assets.length;
      showImage(newIndex);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        document.body.style.overflow = '';
      }
    });

    // Keyboard navigation
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeydown);
      } else if (e.key === 'ArrowLeft') {
        const newIndex = (currentIndex - 1 + assets.length) % assets.length;
        showImage(newIndex);
      } else if (e.key === 'ArrowRight') {
        const newIndex = (currentIndex + 1) % assets.length;
        showImage(newIndex);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    showImage(startIndex);
  }
};

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AssetZoneDisplay.initAll();
  });
} else {
  // DOM already loaded
  AssetZoneDisplay.initAll();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssetZoneDisplay;
}
