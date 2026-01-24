/**
 * MediaUploader Component
 * Unified uploader for photos and short videos (<2 minutes).
 * Integrates with LicenseAgreement for legal consent.
 */

class MediaUploader {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`MediaUploader: Container #${containerId} not found`);
            return;
        }

        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/photos/upload',
            maxImageSize: options.maxImageSize || 25 * 1024 * 1024, // 25MB
            maxVideoSize: options.maxVideoSize || 100 * 1024 * 1024, // 100MB
            maxVideoDuration: options.maxVideoDuration || 120, // 2 minutes
            allowedImageTypes: options.allowedImageTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            allowedVideoTypes: options.allowedVideoTypes || ['video/mp4', 'video/quicktime', 'video/webm'],
            onUploadStart: options.onUploadStart || (() => {}),
            onUploadProgress: options.onUploadProgress || (() => {}),
            onUploadComplete: options.onUploadComplete || (() => {}),
            onUploadError: options.onUploadError || (() => {}),
            showLicenseForm: options.showLicenseForm !== false,
            adminMode: options.adminMode || false,
            ...options
        };

        this.state = {
            selectedFile: null,
            filePreview: null,
            mediaType: null,
            videoDuration: null,
            isUploading: false,
            uploadProgress: 0,
            caption: '',
            description: '',
            tags: '',
            licenseValid: false,
            licenseData: null,
        };

        this.licenseAgreement = null;
        this.render();
        this.attachEventListeners();
    }

    get allowedTypes() {
        return [...this.options.allowedImageTypes, ...this.options.allowedVideoTypes];
    }

    render() {
        this.container.innerHTML = `
            <div class="media-uploader">
                <!-- File Drop Zone -->
                <div class="upload-dropzone" id="upload-dropzone">
                    <div class="dropzone-content">
                        <div class="dropzone-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                        </div>
                        <p class="dropzone-text">
                            <strong>Drop files here</strong> or <label for="file-input" class="dropzone-browse">browse</label>
                        </p>
                        <p class="dropzone-hint">
                            Photos: JPEG, PNG, GIF, WebP (max 25MB)<br/>
                            Videos: MP4, MOV, WebM (max 100MB, 2 min)
                        </p>
                    </div>
                    <input type="file" id="file-input" class="file-input" accept="${this.allowedTypes.join(',')}" />
                </div>

                <!-- Preview Section -->
                <div class="upload-preview" id="upload-preview" style="display: none;">
                    <div class="preview-header">
                        <span class="preview-filename" id="preview-filename"></span>
                        <button type="button" class="preview-remove" id="preview-remove" title="Remove file">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="preview-media" id="preview-media">
                        <!-- Image or video preview inserted here -->
                    </div>
                    <div class="preview-info" id="preview-info">
                        <!-- File size, dimensions, duration -->
                    </div>
                </div>

                <!-- Metadata Form -->
                <div class="upload-metadata" id="upload-metadata" style="display: none;">
                    <h4 class="metadata-title">Photo/Video Details</h4>

                    <div class="metadata-field">
                        <label for="upload-caption">Caption</label>
                        <input type="text" id="upload-caption" placeholder="Brief caption for the media" maxlength="255" />
                    </div>

                    <div class="metadata-field">
                        <label for="upload-description">Description</label>
                        <textarea id="upload-description" placeholder="Detailed description (location, context, etc.)" rows="3"></textarea>
                    </div>

                    <div class="metadata-field">
                        <label for="upload-tags">Tags</label>
                        <input type="text" id="upload-tags" placeholder="e.g., oysters, restoration, 2026 (comma-separated)" />
                    </div>
                </div>

                <!-- License Agreement -->
                ${this.options.showLicenseForm && !this.options.adminMode ? `
                    <div class="upload-license" id="upload-license" style="display: none;">
                        <div id="license-agreement-container"></div>
                    </div>
                ` : ''}

                <!-- Upload Button & Progress -->
                <div class="upload-actions" id="upload-actions" style="display: none;">
                    <div class="upload-progress" id="upload-progress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-text" id="progress-text">Uploading... 0%</span>
                    </div>

                    <div class="upload-buttons" id="upload-buttons">
                        ${!this.options.adminMode ? `
                            <p class="upload-note">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                Your upload will be reviewed by an admin before appearing in the public gallery.
                            </p>
                        ` : ''}
                        <button type="button" class="btn-upload" id="btn-upload" disabled>
                            Upload
                        </button>
                    </div>
                </div>

                <!-- Success/Error Messages -->
                <div class="upload-message" id="upload-message" style="display: none;"></div>
            </div>
        `;

        // Initialize license agreement if needed
        if (this.options.showLicenseForm && !this.options.adminMode) {
            const licenseContainer = this.container.querySelector('#license-agreement-container');
            if (licenseContainer) {
                this.licenseAgreement = new LicenseAgreement('license-agreement-container', {
                    onValidChange: (isValid, data) => {
                        this.state.licenseValid = isValid;
                        this.state.licenseData = data;
                        this.updateSubmitButton();
                    },
                    compact: true
                });
            }
        } else {
            // Admin mode - license not required
            this.state.licenseValid = true;
        }
    }

    attachEventListeners() {
        const dropzone = this.container.querySelector('#upload-dropzone');
        const fileInput = this.container.querySelector('#file-input');
        const removeBtn = this.container.querySelector('#preview-remove');
        const uploadBtn = this.container.querySelector('#btn-upload');
        const captionInput = this.container.querySelector('#upload-caption');
        const descriptionInput = this.container.querySelector('#upload-description');
        const tagsInput = this.container.querySelector('#upload-tags');

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // Remove file
        removeBtn.addEventListener('click', () => {
            this.clearSelection();
        });

        // Upload button
        uploadBtn.addEventListener('click', () => {
            this.uploadFile();
        });

        // Metadata inputs
        captionInput.addEventListener('input', (e) => {
            this.state.caption = e.target.value;
        });

        descriptionInput.addEventListener('input', (e) => {
            this.state.description = e.target.value;
        });

        tagsInput.addEventListener('input', (e) => {
            this.state.tags = e.target.value;
        });
    }

    async handleFileSelect(file) {
        // Validate file type
        if (!this.allowedTypes.includes(file.type)) {
            this.showMessage('error', `File type not allowed: ${file.type}`);
            return;
        }

        const isVideo = this.options.allowedVideoTypes.includes(file.type);
        const maxSize = isVideo ? this.options.maxVideoSize : this.options.maxImageSize;

        // Validate file size
        if (file.size > maxSize) {
            const maxMB = maxSize / 1024 / 1024;
            this.showMessage('error', `File too large. Maximum size is ${maxMB}MB for ${isVideo ? 'videos' : 'images'}.`);
            return;
        }

        this.state.selectedFile = file;
        this.state.mediaType = isVideo ? 'video' : 'photo';

        // Create preview
        await this.createPreview(file);

        // For videos, check duration
        if (isVideo) {
            const duration = await this.getVideoDuration(file);
            this.state.videoDuration = duration;

            if (duration > this.options.maxVideoDuration) {
                this.showMessage('error', `Video too long. Maximum duration is ${this.options.maxVideoDuration / 60} minutes.`);
                this.clearSelection();
                return;
            }
        }

        // Show UI sections
        this.showSections();
        this.updateSubmitButton();
    }

    async createPreview(file) {
        const previewSection = this.container.querySelector('#upload-preview');
        const previewMedia = this.container.querySelector('#preview-media');
        const previewFilename = this.container.querySelector('#preview-filename');
        const previewInfo = this.container.querySelector('#preview-info');
        const dropzone = this.container.querySelector('#upload-dropzone');

        // Hide dropzone, show preview
        dropzone.style.display = 'none';
        previewSection.style.display = 'block';

        // Set filename
        previewFilename.textContent = file.name;

        // Create media preview
        const url = URL.createObjectURL(file);
        this.state.filePreview = url;

        if (this.state.mediaType === 'video') {
            previewMedia.innerHTML = `
                <video src="${url}" controls class="preview-video"></video>
            `;
        } else {
            previewMedia.innerHTML = `
                <img src="${url}" alt="Preview" class="preview-image" />
            `;
        }

        // Show file info
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        let infoText = `${sizeMB} MB`;

        if (this.state.mediaType === 'photo') {
            // Get image dimensions
            const img = previewMedia.querySelector('img');
            img.onload = () => {
                infoText += ` | ${img.naturalWidth} x ${img.naturalHeight}`;
                previewInfo.textContent = infoText;
            };
        } else if (this.state.videoDuration) {
            const mins = Math.floor(this.state.videoDuration / 60);
            const secs = Math.floor(this.state.videoDuration % 60);
            infoText += ` | ${mins}:${secs.toString().padStart(2, '0')}`;
        }

        previewInfo.textContent = infoText;
    }

    getVideoDuration(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.onerror = () => resolve(0);
            video.src = URL.createObjectURL(file);
        });
    }

    showSections() {
        this.container.querySelector('#upload-metadata').style.display = 'block';
        this.container.querySelector('#upload-actions').style.display = 'block';

        if (this.options.showLicenseForm && !this.options.adminMode) {
            this.container.querySelector('#upload-license').style.display = 'block';
        }
    }

    hideSections() {
        this.container.querySelector('#upload-preview').style.display = 'none';
        this.container.querySelector('#upload-metadata').style.display = 'none';
        this.container.querySelector('#upload-actions').style.display = 'none';

        const licenseSection = this.container.querySelector('#upload-license');
        if (licenseSection) {
            licenseSection.style.display = 'none';
        }
    }

    clearSelection() {
        // Revoke preview URL
        if (this.state.filePreview) {
            URL.revokeObjectURL(this.state.filePreview);
        }

        // Reset state
        this.state.selectedFile = null;
        this.state.filePreview = null;
        this.state.mediaType = null;
        this.state.videoDuration = null;
        this.state.caption = '';
        this.state.description = '';
        this.state.tags = '';

        // Reset form inputs
        this.container.querySelector('#file-input').value = '';
        this.container.querySelector('#upload-caption').value = '';
        this.container.querySelector('#upload-description').value = '';
        this.container.querySelector('#upload-tags').value = '';

        // Hide sections, show dropzone
        this.hideSections();
        this.container.querySelector('#upload-dropzone').style.display = 'block';

        // Reset license form if exists
        if (this.licenseAgreement) {
            this.licenseAgreement.reset();
        }

        // Hide any messages
        this.hideMessage();
    }

    updateSubmitButton() {
        const btn = this.container.querySelector('#btn-upload');
        const hasFile = this.state.selectedFile !== null;
        const hasLicense = this.options.adminMode || this.state.licenseValid;

        btn.disabled = !hasFile || !hasLicense || this.state.isUploading;

        if (!hasLicense && hasFile && !this.options.adminMode) {
            btn.title = 'Please complete the license agreement';
        } else {
            btn.title = '';
        }
    }

    async uploadFile() {
        if (!this.state.selectedFile) return;
        if (!this.options.adminMode && !this.state.licenseValid) {
            this.showMessage('error', 'Please complete the license agreement');
            return;
        }

        this.state.isUploading = true;
        this.updateSubmitButton();
        this.showProgress();
        this.options.onUploadStart();

        try {
            const formData = new FormData();
            formData.append('file', this.state.selectedFile);
            formData.append('caption', this.state.caption);
            formData.append('description', this.state.description);
            formData.append('tags', this.state.tags);
            formData.append('is_public', 'false'); // Always false initially for user uploads

            if (this.options.adminMode) {
                formData.append('admin_upload', 'true');
            } else if (this.state.licenseData) {
                formData.append('photographer_name', this.state.licenseData.photographer_name || '');
                formData.append('photographer_email', this.state.licenseData.photographer_email || '');
                formData.append('copyright_holder', this.state.licenseData.copyright_holder || '');
                formData.append('license_type', this.state.licenseData.license_type || 'All Rights Reserved');
                formData.append('usage_rights_agreed', this.state.licenseData.usage_rights_agreed ? 'true' : 'false');
                formData.append('liability_waiver_agreed', this.state.licenseData.liability_waiver_agreed ? 'true' : 'false');
            }

            // Get auth token
            const token = localStorage.getItem('isrs_session_token');
            if (!token) {
                throw new Error('Not authenticated. Please log in.');
            }

            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.options.apiEndpoint);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    this.updateProgress(percent);
                    this.options.onUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                this.state.isUploading = false;
                this.hideProgress();

                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    this.showMessage('success',
                        this.options.adminMode
                            ? 'Upload successful!'
                            : 'Upload successful! Your submission is pending admin review.'
                    );
                    this.options.onUploadComplete(response);

                    // Clear form after short delay
                    setTimeout(() => {
                        this.clearSelection();
                    }, 3000);
                } else {
                    let errorMsg = 'Upload failed';
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        errorMsg = errorData.detail || errorData.message || errorMsg;
                    } catch (e) {}
                    this.showMessage('error', errorMsg);
                    this.options.onUploadError(new Error(errorMsg));
                    this.updateSubmitButton();
                }
            };

            xhr.onerror = () => {
                this.state.isUploading = false;
                this.hideProgress();
                this.showMessage('error', 'Network error. Please try again.');
                this.options.onUploadError(new Error('Network error'));
                this.updateSubmitButton();
            };

            xhr.send(formData);

        } catch (error) {
            this.state.isUploading = false;
            this.hideProgress();
            this.showMessage('error', error.message);
            this.options.onUploadError(error);
            this.updateSubmitButton();
        }
    }

    showProgress() {
        this.container.querySelector('#upload-progress').style.display = 'block';
        this.container.querySelector('#upload-buttons').style.display = 'none';
    }

    hideProgress() {
        this.container.querySelector('#upload-progress').style.display = 'none';
        this.container.querySelector('#upload-buttons').style.display = 'block';
    }

    updateProgress(percent) {
        this.container.querySelector('#progress-fill').style.width = `${percent}%`;
        this.container.querySelector('#progress-text').textContent = `Uploading... ${percent}%`;
    }

    showMessage(type, text) {
        const messageEl = this.container.querySelector('#upload-message');
        messageEl.className = `upload-message upload-message-${type}`;
        messageEl.textContent = text;
        messageEl.style.display = 'block';
    }

    hideMessage() {
        this.container.querySelector('#upload-message').style.display = 'none';
    }
}

// CSS styles for the component
const mediaUploaderStyles = `
<style>
.media-uploader {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
}

.upload-dropzone {
    border: 2px dashed #ced4da;
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #f8f9fa;
}

.upload-dropzone:hover,
.upload-dropzone.dragover {
    border-color: #0d6efd;
    background: #e7f1ff;
}

.dropzone-icon {
    color: #6c757d;
    margin-bottom: 12px;
}

.dropzone-text {
    margin: 0 0 8px 0;
    color: #495057;
}

.dropzone-browse {
    color: #0d6efd;
    cursor: pointer;
    text-decoration: underline;
}

.dropzone-hint {
    margin: 0;
    font-size: 12px;
    color: #6c757d;
}

.file-input {
    display: none;
}

/* Preview Section */
.upload-preview {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.preview-filename {
    font-weight: 500;
    color: #495057;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.preview-remove {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #6c757d;
    border-radius: 4px;
    transition: all 0.2s;
}

.preview-remove:hover {
    background: #e9ecef;
    color: #dc3545;
}

.preview-media {
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    max-height: 400px;
}

.preview-image,
.preview-video {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
}

.preview-info {
    padding: 8px 12px;
    font-size: 12px;
    color: #6c757d;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
}

/* Metadata Form */
.upload-metadata {
    margin-bottom: 16px;
}

.metadata-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #212529;
}

.metadata-field {
    margin-bottom: 12px;
}

.metadata-field label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: #495057;
}

.metadata-field input,
.metadata-field textarea {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.metadata-field input:focus,
.metadata-field textarea:focus {
    border-color: #0d6efd;
    outline: 0;
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

/* Upload Actions */
.upload-actions {
    margin-top: 16px;
}

.upload-note {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    padding: 12px;
    background: #fff8e6;
    border: 1px solid #ffc107;
    border-radius: 4px;
    font-size: 13px;
    color: #856404;
}

.btn-upload {
    width: 100%;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    background: #0d6efd;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-upload:hover:not(:disabled) {
    background: #0b5ed7;
}

.btn-upload:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

/* Progress */
.upload-progress {
    text-align: center;
}

.progress-bar {
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: #0d6efd;
    transition: width 0.2s ease;
}

.progress-text {
    font-size: 13px;
    color: #6c757d;
}

/* Messages */
.upload-message {
    margin-top: 16px;
    padding: 12px;
    border-radius: 4px;
    text-align: center;
}

.upload-message-success {
    background: #d1e7dd;
    border: 1px solid #badbcc;
    color: #0f5132;
}

.upload-message-error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

/* License Section */
.upload-license {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e9ecef;
}
</style>
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleContainer = document.createElement('div');
    styleContainer.innerHTML = mediaUploaderStyles;
    document.head.appendChild(styleContainer.firstElementChild);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MediaUploader = MediaUploader;
}
