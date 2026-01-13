/**
 * Focal Point Picker
 * Vanilla JS implementation converted from akorn's React FocalPointPicker
 *
 * Usage:
 * const picker = new FocalPointPicker({
 *   photoId: 'uuid-here',
 *   photoUrl: '/uploads/photo.jpg',
 *   initialX: 50,
 *   initialY: 50,
 *   altText: 'Photo description',
 *   onSave: (x, y) => { console.log('Saved:', x, y); }
 * });
 * picker.open();
 */

class FocalPointPicker {
  constructor(options) {
    this.photoId = options.photoId;
    this.photoUrl = options.photoUrl;
    this.focalX = options.initialX || 50;
    this.focalY = options.initialY || 50;
    this.onSave = options.onSave || (() => {});
    this.altText = options.altText || '';

    this.overlay = null;
    this.image = null;
    this.crosshair = null;
  }

  open() {
    this.createModal();
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    document.body.style.overflow = '';
  }

  createModal() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'focal-point-overlay';
    this.overlay.innerHTML = `
      <div class="focal-point-modal">
        <div class="focal-point-header">
          <div>
            <h2>Set Focal Point</h2>
            <p class="focal-point-subtitle">Click on the image to set the focal point for responsive cropping</p>
          </div>
          <button class="focal-point-close" aria-label="Close">&times;</button>
        </div>
        <div class="focal-point-body">
          <p class="focal-point-instructions">
            <strong>Tip:</strong> Click on the most important part of your image (e.g., person's face, main subject).
            This point will stay visible when the image is cropped for different screen sizes.
          </p>
          <div class="focal-point-image-container">
            <img class="focal-point-image" src="${this.photoUrl}" alt="${this.altText}">
            <div class="focal-point-crosshair">
              <div class="crosshair-v"></div>
              <div class="crosshair-h"></div>
              <div class="crosshair-dot"></div>
            </div>
          </div>
          <div class="focal-point-coords">
            <div class="coord-box">
              <span class="coord-label">X:</span>
              <strong id="focalX">${this.focalX.toFixed(1)}</strong>%
            </div>
            <div class="coord-box">
              <span class="coord-label">Y:</span>
              <strong id="focalY">${this.focalY.toFixed(1)}</strong>%
            </div>
          </div>
        </div>
        <div class="focal-point-footer">
          <button class="btn btn-secondary" id="resetBtn">
            <span>↺</span> Reset to Center
          </button>
          <div class="focal-point-actions">
            <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
            <button class="btn btn-primary" id="saveBtn">
              <span>✓</span> Save Focal Point
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // Get DOM elements
    this.image = this.overlay.querySelector('.focal-point-image');
    this.crosshair = this.overlay.querySelector('.focal-point-crosshair');

    // Attach event listeners
    this.attachEvents();

    // Set initial position
    this.updateCrosshair();
  }

  attachEvents() {
    // Close button
    this.overlay.querySelector('.focal-point-close').addEventListener('click', () => this.close());

    // Image click
    this.image.addEventListener('click', (e) => this.handleImageClick(e));

    // Reset button
    this.overlay.querySelector('#resetBtn').addEventListener('click', () => {
      this.focalX = 50;
      this.focalY = 50;
      this.updateCrosshair();
    });

    // Cancel button
    this.overlay.querySelector('#cancelBtn').addEventListener('click', () => this.close());

    // Save button
    this.overlay.querySelector('#saveBtn').addEventListener('click', () => this.save());

    // Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    // Backdrop click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  handleImageClick(e) {
    e.stopPropagation();

    if (!this.image) {
      console.log('❌ No image ref');
      return;
    }

    const rect = this.image.getBoundingClientRect();

    // Calculate click position relative to image
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to percentage
    const percentX = (clickX / rect.width) * 100;
    const percentY = (clickY / rect.height) * 100;

    this.focalX = Math.max(0, Math.min(100, percentX));
    this.focalY = Math.max(0, Math.min(100, percentY));

    console.log('🎯 Focal point set:', { x: this.focalX.toFixed(1), y: this.focalY.toFixed(1) });
    this.updateCrosshair();
  }

  updateCrosshair() {
    this.crosshair.style.left = `${this.focalX}%`;
    this.crosshair.style.top = `${this.focalY}%`;

    document.getElementById('focalX').textContent = this.focalX.toFixed(1);
    document.getElementById('focalY').textContent = this.focalY.toFixed(1);
  }

  async save() {
    const saveBtn = this.overlay.querySelector('#saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span> Saving...';

    try {
      await this.onSave(this.focalX, this.focalY);
      this.close();
    } catch (error) {
      console.error('Failed to save focal point:', error);
      alert('Failed to save focal point: ' + error.message);
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FocalPointPicker;
}
