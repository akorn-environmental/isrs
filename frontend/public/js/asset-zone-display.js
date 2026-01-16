/**
 * Asset Zone Display
 * Vanilla JS component for displaying photos in zones with different display modes
 * Supports: single, slideshow, grid, lightbox modes
 *
 * Usage:
 * HTML: <div class="asset-zone" data-zone-id="home-hero-slideshow"></div>
 * JavaScript: AssetZoneDisplay.initAll();
 *
 * Or initialize specific zone:
 * AssetZoneDisplay.loadZone('home-hero-slideshow', document.getElementById('myZone'));
 */

const AssetZoneDisplay = {
  API_BASE_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : ''  // Same-origin URLs,

  /**
   * Initialize all asset zones on the page
   */
  async initAll() {
    const zones = document.querySelectorAll('[data-zone-id]');
    console.log(`🎨 Initializing ${zones.length} asset zone(s)`);

    for (const zoneEl of zones) {
      const zoneId = zoneEl.dataset.zoneId;
      await this.loadZone(zoneId, zoneEl);
    }
  },

  /**
   * Load a specific zone
   */
  async loadZone(zoneId, containerEl) {
    try {
      console.log(`📦 Loading zone: ${zoneId}`);
      const response = await fetch(`${this.API_BASE_URL}/api/asset-zones/${zoneId}`);

      if (!response.ok) {
        console.error(`Zone ${zoneId} returned ${response.status}`);
        return;
      }

      const zone = await response.json();

      if (!zone || !zone.assets || zone.assets.length === 0) {
        console.log(`Zone ${zoneId} has no assets`);
        containerEl.innerHTML = '<p class="zone-empty">No photos assigned to this zone yet.</p>';
        return;
      }

      console.log(`✅ Zone ${zoneId}: ${zone.assets.length} asset(s), mode: ${zone.display_mode}`);

      const displayMode = zone.display_mode || 'single';

      switch (displayMode) {
        case 'single':
          this.renderSingle(containerEl, zone);
          break;
        case 'slideshow':
          this.renderSlideshow(containerEl, zone);
          break;
        case 'grid':
          this.renderGrid(containerEl, zone);
          break;
        case 'lightbox':
          this.renderLightbox(containerEl, zone);
          break;
        default:
          console.error(`Unknown display mode: ${displayMode}`);
      }
    } catch (error) {
      console.error(`Error loading zone ${zoneId}:`, error);
      containerEl.innerHTML = '<p class="zone-error">Failed to load photos.</p>';
    }
  },

  /**
   * Render single asset
   */
  renderSingle(container, zone) {
    const asset = zone.assets[0];
    const focalX = asset.focal_point_x || 50;
    const focalY = asset.focal_point_y || 50;

    container.innerHTML = `
      <div class="asset-zone-single">
        <img
          src="${this.API_BASE_URL}${asset.file_path}"
          alt="${asset.alt_text || asset.caption || ''}"
          loading="lazy"
          decoding="async"
          style="object-position: ${focalX}% ${focalY}%;"
        >
        ${asset.caption ? `<div class="asset-caption">${asset.caption}</div>` : ''}
      </div>
    `;
  },

  /**
   * Render slideshow
   */
  renderSlideshow(container, zone) {
    const assets = zone.assets;
    let currentIndex = 0;

    container.innerHTML = `
      <div class="asset-zone-slideshow">
        <div class="slideshow-track">
          ${assets.map((asset, i) => {
            const focalX = asset.focal_point_x || 50;
            const focalY = asset.focal_point_y || 50;
            return `
              <div class="slideshow-slide ${i === 0 ? 'active' : ''}">
                <img
                  src="${this.API_BASE_URL}${asset.file_path}"
                  alt="${asset.alt_text || asset.caption || ''}"
                  loading="lazy"
                  decoding="async"
                  style="object-position: ${focalX}% ${focalY}%;"
                >
                ${asset.caption ? `<div class="asset-caption">${asset.caption}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
        ${assets.length > 1 ? `
          <button class="slideshow-prev" aria-label="Previous slide">&lsaquo;</button>
          <button class="slideshow-next" aria-label="Next slide">&rsaquo;</button>
          <div class="slideshow-indicators">
            ${assets.map((_, i) => `<span class="${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    if (assets.length > 1) {
      const slides = container.querySelectorAll('.slideshow-slide');
      const indicators = container.querySelectorAll('.slideshow-indicators span');

      const showSlide = (index) => {
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(i => i.classList.remove('active'));
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentIndex = index;
      };

      container.querySelector('.slideshow-prev').addEventListener('click', () => {
        const newIndex = (currentIndex - 1 + assets.length) % assets.length;
        showSlide(newIndex);
      });

      container.querySelector('.slideshow-next').addEventListener('click', () => {
        const newIndex = (currentIndex + 1) % assets.length;
        showSlide(newIndex);
      });

      indicators.forEach((indicator, i) => {
        indicator.addEventListener('click', () => showSlide(i));
      });

      // Auto-advance every 5 seconds
      const autoAdvanceInterval = zone.configuration?.autoAdvance || 5000;
      setInterval(() => {
        const newIndex = (currentIndex + 1) % assets.length;
        showSlide(newIndex);
      }, autoAdvanceInterval);
    }
  },

  /**
   * Render grid
   */
  renderGrid(container, zone) {
    const assets = zone.assets;
    const columns = zone.configuration?.columns || 3;

    container.innerHTML = `
      <div class="asset-zone-grid" style="grid-template-columns: repeat(${columns}, 1fr);">
        ${assets.map(asset => {
          const focalX = asset.focal_point_x || 50;
          const focalY = asset.focal_point_y || 50;
          return `
            <div class="grid-item">
              <img
                src="${this.API_BASE_URL}${asset.file_path}"
                alt="${asset.alt_text || asset.caption || ''}"
                loading="lazy"
                decoding="async"
                style="object-position: ${focalX}% ${focalY}%;"
              >
              ${asset.caption ? `<div class="asset-caption">${asset.caption}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * Render lightbox gallery
   */
  renderLightbox(container, zone) {
    const assets = zone.assets;

    container.innerHTML = `
      <div class="asset-zone-lightbox">
        ${assets.map((asset, i) => {
          const focalX = asset.focal_point_x || 50;
          const focalY = asset.focal_point_y || 50;
          return `
            <div class="lightbox-thumb" data-index="${i}" data-photo-url="${this.API_BASE_URL}${asset.file_path}">
              <img
                src="${this.API_BASE_URL}${asset.thumbnail_path || asset.file_path}"
                alt="${asset.alt_text || asset.caption || ''}"
                loading="lazy"
                decoding="async"
                style="object-position: ${focalX}% ${focalY}%;"
              >
            </div>
          `;
        }).join('')}
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
    overlay.innerHTML = `
      <div class="simple-lightbox">
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-prev">&lsaquo;</button>
        <img class="lightbox-image" src="" alt="">
        <button class="lightbox-next">&rsaquo;</button>
        <div class="lightbox-caption"></div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const img = overlay.querySelector('.lightbox-image');
    const caption = overlay.querySelector('.lightbox-caption');

    const showImage = (index) => {
      const asset = assets[index];
      const focalX = asset.focal_point_x || 50;
      const focalY = asset.focal_point_y || 50;

      img.src = `${this.API_BASE_URL}${asset.file_path}`;
      img.alt = asset.alt_text || asset.caption || '';
      img.style.objectPosition = `${focalX}% ${focalY}%`;
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
