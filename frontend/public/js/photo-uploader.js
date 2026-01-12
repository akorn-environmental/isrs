/**
 * ISRS Photo Uploader Component
 * Reusable photo upload with drag-and-drop, AI analysis, and metadata forms
 *
 * Usage:
 *   <div id="photo-uploader"></div>
 *   <script>
 *     const uploader = new PhotoUploader('photo-uploader', {
 *       maxFiles: 10,
 *       onUploadComplete: (photos) => console.log('Uploaded:', photos)
 *     });
 *   </script>
 */

(function() {
  'use strict';

  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://isrs-database-backend.onrender.com';

  class PhotoUploader {
    constructor(containerId, options = {}) {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        throw new Error(`Container with id '${containerId}' not found`);
      }

      this.options = {
        maxFiles: options.maxFiles || 10,
        maxFileSize: options.maxFileSize || 25, // MB
        acceptedTypes: options.acceptedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        onUploadStart: options.onUploadStart || (() => {}),
        onUploadProgress: options.onUploadProgress || (() => {}),
        onUploadComplete: options.onUploadComplete || (() => {}),
        onUploadError: options.onUploadError || (() => {}),
        showMetadataForm: options.showMetadataForm !== false,
        autoUpload: options.autoUpload || false
      };

      this.files = [];
      this.uploadedPhotos = [];

      this.init();
    }

    init() {
      this.render();
      this.attachEventListeners();
    }

    render() {
      this.container.innerHTML = `
        <div class="photo-uploader">
          <div class="photo-uploader-dropzone" id="dropzone">
            <div class="dropzone-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <h3>Upload Photos</h3>
              <p>Drag & drop photos here, or click to select</p>
              <p class="upload-limits">Max ${this.options.maxFiles} files, ${this.options.maxFileSize}MB each</p>
              <button type="button" class="btn btn-primary" id="selectFilesBtn">Select Files</button>
            </div>
            <input type="file" id="fileInput" multiple accept="${this.options.acceptedTypes.join(',')}" style="display: none;">
          </div>

          <div class="photo-previews" id="previews" style="display: none;"></div>

          ${this.options.showMetadataForm ? `
            <div class="photo-metadata-form" id="metadataForm" style="display: none;">
              <h3>Photo Information</h3>
              <p class="form-help">This information will be applied to all uploaded photos</p>

              <div class="form-row">
                <div class="form-group">
                  <label for="caption">Caption</label>
                  <input type="text" id="caption" placeholder="Brief description of the photo(s)">
                </label>
              </div>

              <div class="form-group">
                <label for="description">Description (optional)</label>
                <textarea id="description" rows="3" placeholder="Detailed description, context, or notes"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="locationName">Location</label>
                  <input type="text" id="locationName" placeholder="e.g., Chesapeake Bay, Virginia">
                </div>

                <div class="form-group">
                  <label for="projectName">Project Name (optional)</label>
                  <input type="text" id="projectName" placeholder="e.g., Oyster Restoration 2024">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="photographerName">Photographer</label>
                  <input type="text" id="photographerName" placeholder="Who took these photos?">
                </div>

                <div class="form-group">
                  <label for="licenseType">License</label>
                  <select id="licenseType">
                    <option value="All Rights Reserved">All Rights Reserved</option>
                    <option value="CC-BY">Creative Commons Attribution (CC-BY)</option>
                    <option value="CC-BY-SA">Creative Commons Attribution-ShareAlike (CC-BY-SA)</option>
                    <option value="CC-BY-NC">Creative Commons Attribution-NonCommercial (CC-BY-NC)</option>
                    <option value="CC0">Public Domain (CC0)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>
                  <input type="checkbox" id="isPublic"> Make photos visible in public gallery
                </label>
              </div>

              <div class="form-group">
                <label for="tags">Tags (comma-separated, optional)</label>
                <input type="text" id="tags" placeholder="e.g., oysters, restoration, field work">
              </div>
            </div>
          ` : ''}

          <div class="photo-uploader-actions" id="actions" style="display: none;">
            <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
            <button type="button" class="btn btn-primary" id="uploadBtn">
              <span class="upload-text">Upload Photos</span>
              <span class="upload-spinner" style="display: none;">Uploading...</span>
            </button>
          </div>

          <div class="upload-progress" id="uploadProgress" style="display: none;">
            <div class="progress-bar">
              <div class="progress-fill" id="progressFill"></div>
            </div>
            <p class="progress-text" id="progressText">Uploading 0/0 files...</p>
          </div>
        </div>
      `;

      this.injectStyles();
    }

    injectStyles() {
      if (document.getElementById('photo-uploader-styles')) return;

      const style = document.createElement('style');
      style.id = 'photo-uploader-styles';
      style.textContent = `
        .photo-uploader {
          font-family: 'PT Serif', Georgia, serif;
        }

        .photo-uploader-dropzone {
          border: 3px dashed #d0d0d0;
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          background: #f9f9f9;
          transition: all 0.3s;
          cursor: pointer;
        }

        .photo-uploader-dropzone:hover,
        .photo-uploader-dropzone.dragover {
          border-color: #2E5A8A;
          background: #f0f5fa;
        }

        .dropzone-content svg {
          color: #2E5A8A;
          margin-bottom: 1rem;
        }

        .dropzone-content h3 {
          margin: 0 0 0.5rem;
          color: #2E5A8A;
          font-size: 1.5rem;
        }

        .dropzone-content p {
          margin: 0.5rem 0;
          color: #666;
        }

        .upload-limits {
          font-size: 0.9rem;
          color: #999;
        }

        .photo-previews {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
        }

        .preview-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .preview-item img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }

        .preview-remove {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          transition: all 0.2s;
        }

        .preview-remove:hover {
          background: rgb(220, 53, 69);
          transform: scale(1.1);
        }

        .preview-filename {
          padding: 0.5rem;
          font-size: 0.85rem;
          color: #666;
          background: white;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .photo-metadata-form {
          background: #f9f9f9;
          padding: 2rem;
          border-radius: 8px;
          margin: 2rem 0;
        }

        .photo-metadata-form h3 {
          margin: 0 0 0.5rem;
          color: #2E5A8A;
        }

        .form-help {
          margin: 0 0 1.5rem;
          color: #666;
          font-size: 0.95rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #d0d0d0;
          border-radius: 6px;
          font-family: 'PT Serif', Georgia, serif;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #2E5A8A;
          box-shadow: 0 0 0 3px rgba(46, 90, 138, 0.1);
        }

        .photo-uploader-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-family: 'PT Serif', Georgia, serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #5BC0BE 0%, #2E5A8A 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(46, 90, 138, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          border: 2px solid #d0d0d0;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .upload-spinner {
          display: inline-block;
          margin-left: 0.5rem;
        }

        .upload-progress {
          margin-top: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 30px;
          background: #f0f0f0;
          border-radius: 15px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%);
          transition: width 0.3s;
          width: 0%;
        }

        .progress-text {
          text-align: center;
          margin-top: 0.5rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .photo-previews {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }
        }
      `;

      document.head.appendChild(style);
    }

    attachEventListeners() {
      const dropzone = this.container.querySelector('#dropzone');
      const fileInput = this.container.querySelector('#fileInput');
      const selectBtn = this.container.querySelector('#selectFilesBtn');
      const uploadBtn = this.container.querySelector('#uploadBtn');
      const cancelBtn = this.container.querySelector('#cancelBtn');

      // Dropzone click
      dropzone.addEventListener('click', (e) => {
        if (e.target.id !== 'selectFilesBtn') {
          fileInput.click();
        }
      });

      // Select files button
      selectBtn.addEventListener('click', () => fileInput.click());

      // File input change
      fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

      // Drag and drop
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        this.handleFiles(e.dataTransfer.files);
      });

      // Upload button
      if (uploadBtn) {
        uploadBtn.addEventListener('click', () => this.uploadPhotos());
      }

      // Cancel button
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.reset());
      }
    }

    handleFiles(fileList) {
      const files = Array.from(fileList);

      // Validate file count
      if (files.length + this.files.length > this.options.maxFiles) {
        alert(`Maximum ${this.options.maxFiles} files allowed`);
        return;
      }

      // Validate file types and sizes
      for (const file of files) {
        if (!this.options.acceptedTypes.includes(file.type)) {
          alert(`File type not supported: ${file.name}`);
          continue;
        }

        if (file.size > this.options.maxFileSize * 1024 * 1024) {
          alert(`File too large: ${file.name} (max ${this.options.maxFileSize}MB)`);
          continue;
        }

        this.files.push(file);
      }

      if (this.files.length > 0) {
        this.showPreviews();
        this.showMetadataForm();
        this.showActions();
      }
    }

    showPreviews() {
      const previewsContainer = this.container.querySelector('#previews');
      previewsContainer.style.display = 'grid';
      previewsContainer.innerHTML = '';

      this.files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = document.createElement('div');
          preview.className = 'preview-item';
          preview.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <button class="preview-remove" data-index="${index}">&times;</button>
            <div class="preview-filename">${file.name}</div>
          `;

          preview.querySelector('.preview-remove').addEventListener('click', () => {
            this.removeFile(index);
          });

          previewsContainer.appendChild(preview);
        };
        reader.readAsDataURL(file);
      });
    }

    showMetadataForm() {
      if (!this.options.showMetadataForm) return;
      const form = this.container.querySelector('#metadataForm');
      if (form) form.style.display = 'block';
    }

    showActions() {
      const actions = this.container.querySelector('#actions');
      if (actions) actions.style.display = 'flex';
    }

    removeFile(index) {
      this.files.splice(index, 1);

      if (this.files.length === 0) {
        this.reset();
      } else {
        this.showPreviews();
      }
    }

    getMetadata() {
      const metadata = {};

      if (this.options.showMetadataForm) {
        const caption = this.container.querySelector('#caption');
        const description = this.container.querySelector('#description');
        const locationName = this.container.querySelector('#locationName');
        const projectName = this.container.querySelector('#projectName');
        const photographerName = this.container.querySelector('#photographerName');
        const licenseType = this.container.querySelector('#licenseType');
        const isPublic = this.container.querySelector('#isPublic');
        const tags = this.container.querySelector('#tags');

        if (caption) metadata.caption = caption.value;
        if (description) metadata.description = description.value;
        if (locationName) metadata.locationName = locationName.value;
        if (projectName) metadata.projectName = projectName.value;
        if (photographerName) metadata.photographerName = photographerName.value;
        if (licenseType) metadata.licenseType = licenseType.value;
        if (isPublic) metadata.isPublic = isPublic.checked;
        if (tags && tags.value) metadata.tags = tags.value.split(',').map(t => t.trim()).filter(Boolean);
      }

      return metadata;
    }

    async uploadPhotos() {
      const uploadBtn = this.container.querySelector('#uploadBtn');
      const uploadText = uploadBtn.querySelector('.upload-text');
      const uploadSpinner = uploadBtn.querySelector('.upload-spinner');
      const progressContainer = this.container.querySelector('#uploadProgress');
      const progressFill = this.container.querySelector('#progressFill');
      const progressText = this.container.querySelector('#progressText');

      // Disable button
      uploadBtn.disabled = true;
      uploadText.style.display = 'none';
      uploadSpinner.style.display = 'inline';

      // Show progress
      progressContainer.style.display = 'block';

      // Get session token
      const sessionToken = localStorage.getItem('isrs_session_token');
      if (!sessionToken) {
        alert('Please log in to upload photos');
        this.reset();
        return;
      }

      // Get metadata
      const metadata = this.getMetadata();

      this.options.onUploadStart(this.files.length);

      let uploaded = 0;
      const results = [];

      for (const file of this.files) {
        try {
          const formData = new FormData();
          formData.append('photo', file);
          formData.append('metadata', JSON.stringify(metadata));

          const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionToken}`
            },
            body: formData
          });

          const data = await response.json();

          if (data.success) {
            results.push(data.data);
            uploaded++;
          } else {
            throw new Error(data.error || 'Upload failed');
          }

          // Update progress
          const progress = Math.round((uploaded / this.files.length) * 100);
          progressFill.style.width = progress + '%';
          progressText.textContent = `Uploading ${uploaded}/${this.files.length} files...`;

          this.options.onUploadProgress(uploaded, this.files.length);

        } catch (error) {
          console.error('Upload error:', error);
          this.options.onUploadError(file.name, error.message);
          alert(`Failed to upload ${file.name}: ${error.message}`);
        }
      }

      // Complete
      this.uploadedPhotos = results;
      this.options.onUploadComplete(results);

      // Reset after success
      setTimeout(() => {
        this.reset();
        alert(`Successfully uploaded ${uploaded} of ${this.files.length} photos!`);
      }, 1000);
    }

    reset() {
      this.files = [];
      this.render();
      this.attachEventListeners();
    }
  }

  // Export to global scope
  window.PhotoUploader = PhotoUploader;

})();
