/**
 * Focal Point Picker Component
 *
 * Interactive UI for setting focal point coordinates on images for responsive cropping.
 * Coordinates are stored as percentages (0-100) from top-left corner.
 *
 * Usage:
 *   const picker = new FocalPointPicker(imageUrl, currentX, currentY, onSave);
 *   picker.show();
 */

class FocalPointPicker {
  constructor(imageUrl, initialX = 50, initialY = 50, onSave) {
    this.imageUrl = imageUrl;
    this.focalX = initialX;
    this.focalY = initialY;
    this.onSave = onSave;
    this.modal = null;
    this.canvas = null;
    this.ctx = null;
    this.image = null;
    this.isDragging = false;
  }

  show() {
    this.createModal();
    this.loadImage();
  }

  createModal() {
    // Create modal overlay
    this.modal = document.createElement('div');
    this.modal.className = 'focal-point-modal';
    this.modal.innerHTML = \`
      <div class="focal-point-modal-content">
        <div class="focal-point-header">
          <h2>Set Focal Point</h2>
          <button class="focal-point-close">&times;</button>
        </div>

        <div class="focal-point-body">
          <div class="focal-point-instructions">
            <p>Click or drag on the image to set the focal point. This determines how the image crops on different screen sizes.</p>
          </div>

          <div class="focal-point-canvas-container">
            <canvas id="focalPointCanvas"></canvas>
            <div class="focal-point-crosshair"></div>
          </div>

          <div class="focal-point-coordinates">
            <div class="coord-group">
              <label>X:</label>
              <input type="number" id="focalX" min="0" max="100" step="0.1" value="\${this.focalX}">
              <span>%</span>
            </div>
            <div class="coord-group">
              <label>Y:</label>
              <input type="number" id="focalY" min="0" max="100" step="0.1" value="\${this.focalY}">
              <span>%</span>
            </div>
            <button class="btn-center" title="Center focal point">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="2"/>
                <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M10 0 L10 4 M10 16 L10 20 M0 10 L4 10 M16 10 L20 10" stroke="currentColor" stroke-width="1"/>
              </svg>
            </button>
          </div>

          <div class="focal-point-preview">
            <h3>Crop Previews</h3>
            <div class="preview-grid">
              <div class="preview-item">
                <div class="preview-label">Square (1:1)</div>
                <div class="preview-box preview-square"></div>
              </div>
              <div class="preview-item">
                <div class="preview-label">Landscape (16:9)</div>
                <div class="preview-box preview-landscape"></div>
              </div>
              <div class="preview-item">
                <div class="preview-label">Portrait (4:5)</div>
                <div class="preview-box preview-portrait"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="focal-point-footer">
          <button class="btn btn-secondary focal-point-cancel">Cancel</button>
          <button class="btn btn-primary focal-point-save">Save Focal Point</button>
        </div>
      </div>
    \`;

    document.body.appendChild(this.modal);

    // Get elements
    this.canvas = document.getElementById('focalPointCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.crosshair = this.modal.querySelector('.focal-point-crosshair');
    this.inputX = document.getElementById('focalX');
    this.inputY = document.getElementById('focalY');

    // Add event listeners
    this.modal.querySelector('.focal-point-close').addEventListener('click', () => this.close());
    this.modal.querySelector('.focal-point-cancel').addEventListener('click', () => this.close());
    this.modal.querySelector('.focal-point-save').addEventListener('click', () => this.save());
    this.modal.querySelector('.btn-center').addEventListener('click', () => this.centerFocalPoint());

    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

    this.inputX.addEventListener('input', (e) => this.handleInputChange(e, 'x'));
    this.inputY.addEventListener('input', (e) => this.handleInputChange(e, 'y'));

    // Close on overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
  }

  loadImage() {
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.onload = () => {
      this.setupCanvas();
      this.draw();
      this.updatePreviews();
    };
    this.image.onerror = () => {
      alert('Failed to load image. Please try again.');
      this.close();
    };
    this.image.src = this.imageUrl;
  }

  setupCanvas() {
    const container = this.modal.querySelector('.focal-point-canvas-container');
    const maxWidth = Math.min(600, container.clientWidth - 40);
    const maxHeight = 400;

    const scale = Math.min(maxWidth / this.image.width, maxHeight / this.image.height);
    this.canvas.width = this.image.width * scale;
    this.canvas.height = this.image.height * scale;
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw image
    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

    // Draw grid overlay
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;

    // Vertical lines (rule of thirds)
    for (let i = 1; i <= 2; i++) {
      const x = (this.canvas.width / 3) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal lines (rule of thirds)
    for (let i = 1; i <= 2; i++) {
      const y = (this.canvas.height / 3) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Draw focal point
    const x = (this.focalX / 100) * this.canvas.width;
    const y = (this.focalY / 100) * this.canvas.height;

    // Outer circle (white)
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20, 0, Math.PI * 2);
    this.ctx.stroke();

    // Inner circle (blue)
    this.ctx.strokeStyle = '#2980b9';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, Math.PI * 2);
    this.ctx.stroke();

    // Center dot
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Crosshair lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 1;

    // Horizontal crosshair
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.canvas.width, y);
    this.ctx.stroke();

    // Vertical crosshair
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.height);
    this.ctx.stroke();
  }

  handleMouseDown(e) {
    this.isDragging = true;
    this.updateFocalPoint(e);
  }

  handleMouseMove(e) {
    if (this.isDragging) {
      this.updateFocalPoint(e);
    }
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  updateFocalPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.focalX = Math.max(0, Math.min(100, (x / this.canvas.width) * 100));
    this.focalY = Math.max(0, Math.min(100, (y / this.canvas.height) * 100));

    this.inputX.value = this.focalX.toFixed(1);
    this.inputY.value = this.focalY.toFixed(1);

    this.draw();
    this.updatePreviews();
  }

  handleInputChange(e, axis) {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;

    if (axis === 'x') {
      this.focalX = Math.max(0, Math.min(100, value));
    } else {
      this.focalY = Math.max(0, Math.min(100, value));
    }

    this.draw();
    this.updatePreviews();
  }

  centerFocalPoint() {
    this.focalX = 50;
    this.focalY = 50;
    this.inputX.value = '50.0';
    this.inputY.value = '50.0';
    this.draw();
    this.updatePreviews();
  }

  updatePreviews() {
    const previews = [
      { selector: '.preview-square', ratio: 1 },
      { selector: '.preview-landscape', ratio: 16/9 },
      { selector: '.preview-portrait', ratio: 4/5 }
    ];

    previews.forEach(({ selector, ratio }) => {
      const preview = this.modal.querySelector(selector);
      const imageRatio = this.image.width / this.image.height;

      let cropWidth, cropHeight, offsetX, offsetY;

      if (imageRatio > ratio) {
        // Image is wider - crop sides
        cropHeight = this.image.height;
        cropWidth = cropHeight * ratio;
        offsetX = Math.max(0, Math.min(
          this.image.width - cropWidth,
          (this.focalX / 100) * this.image.width - cropWidth / 2
        ));
        offsetY = 0;
      } else {
        // Image is taller - crop top/bottom
        cropWidth = this.image.width;
        cropHeight = cropWidth / ratio;
        offsetX = 0;
        offsetY = Math.max(0, Math.min(
          this.image.height - cropHeight,
          (this.focalY / 100) * this.image.height - cropHeight / 2
        ));
      }

      const posX = -(offsetX / this.image.width) * 100;
      const posY = -(offsetY / this.image.height) * 100;
      const scaleX = (this.image.width / cropWidth) * 100;
      const scaleY = (this.image.height / cropHeight) * 100;

      preview.style.backgroundImage = \`url(\${this.imageUrl})\`;
      preview.style.backgroundPosition = \`\${posX}% \${posY}%\`;
      preview.style.backgroundSize = \`\${scaleX}% \${scaleY}%\`;
    });
  }

  save() {
    if (this.onSave) {
      this.onSave({
        focal_point_x: parseFloat(this.focalX.toFixed(2)),
        focal_point_y: parseFloat(this.focalY.toFixed(2))
      });
    }
    this.close();
  }

  close() {
    if (this.modal) {
      this.modal.remove();
    }
  }
}

// Export for use in other scripts
window.FocalPointPicker = FocalPointPicker;
