/**
 * LicenseAgreement Component
 * Handles photographer attribution, copyright, and legal consent for media uploads.
 * Required for all user uploads to reduce ISRS/ICSR liability.
 */

class LicenseAgreement {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`LicenseAgreement: Container #${containerId} not found`);
            return;
        }

        this.options = {
            onValidChange: options.onValidChange || (() => {}),
            prefillData: options.prefillData || {},
            compact: options.compact || false,
            ...options
        };

        this.state = {
            photographerName: this.options.prefillData.photographerName || '',
            photographerEmail: this.options.prefillData.photographerEmail || '',
            copyrightHolder: this.options.prefillData.copyrightHolder || '',
            licenseType: this.options.prefillData.licenseType || 'All Rights Reserved',
            usageRightsAgreed: false,
            liabilityWaiverAgreed: false,
        };

        this.licenseTypes = [
            { value: 'All Rights Reserved', label: 'All Rights Reserved', description: 'Standard copyright - permission required for any use' },
            { value: 'CC-BY', label: 'CC BY (Attribution)', description: 'Others can use with credit' },
            { value: 'CC-BY-SA', label: 'CC BY-SA (Share Alike)', description: 'Others can use with credit, derivatives must use same license' },
            { value: 'CC-BY-NC', label: 'CC BY-NC (Non-Commercial)', description: 'Others can use with credit for non-commercial purposes only' },
            { value: 'CC0', label: 'CC0 (Public Domain)', description: 'No rights reserved - anyone can use freely' },
        ];

        this.render();
        this.attachEventListeners();
    }

    render() {
        const compactClass = this.options.compact ? 'license-compact' : '';

        this.container.innerHTML = `
            <div class="license-agreement ${compactClass}">
                <div class="license-section">
                    <h4 class="license-section-title">Attribution Information</h4>

                    <div class="license-field">
                        <label for="photographer-name" class="license-label">
                            Photographer Name <span class="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="photographer-name"
                            class="license-input"
                            placeholder="Enter photographer's full name"
                            value="${this.escapeHtml(this.state.photographerName)}"
                            required
                        />
                        <span class="license-help">The person who took this photo/video</span>
                    </div>

                    <div class="license-field">
                        <label for="photographer-email" class="license-label">
                            Photographer Email
                        </label>
                        <input
                            type="email"
                            id="photographer-email"
                            class="license-input"
                            placeholder="photographer@example.com"
                            value="${this.escapeHtml(this.state.photographerEmail)}"
                        />
                        <span class="license-help">Optional - for future contact about usage</span>
                    </div>

                    <div class="license-field">
                        <label for="copyright-holder" class="license-label">
                            Copyright Holder
                        </label>
                        <input
                            type="text"
                            id="copyright-holder"
                            class="license-input"
                            placeholder="Leave blank if same as photographer"
                            value="${this.escapeHtml(this.state.copyrightHolder)}"
                        />
                        <span class="license-help">Organization or individual who owns the copyright</span>
                    </div>

                    <div class="license-field">
                        <label for="license-type" class="license-label">
                            License Type <span class="required">*</span>
                        </label>
                        <select id="license-type" class="license-select">
                            ${this.licenseTypes.map(lt => `
                                <option value="${lt.value}" ${this.state.licenseType === lt.value ? 'selected' : ''}>
                                    ${lt.label}
                                </option>
                            `).join('')}
                        </select>
                        <span class="license-help license-type-description">
                            ${this.getLicenseDescription(this.state.licenseType)}
                        </span>
                    </div>
                </div>

                <div class="license-section license-consent-section">
                    <h4 class="license-section-title">Legal Agreement</h4>

                    <div class="license-checkbox-group">
                        <label class="license-checkbox-label">
                            <input
                                type="checkbox"
                                id="usage-rights-agreed"
                                class="license-checkbox"
                                ${this.state.usageRightsAgreed ? 'checked' : ''}
                            />
                            <span class="license-checkbox-text">
                                <strong>Usage Rights Agreement</strong> <span class="required">*</span><br/>
                                I certify that I own or have permission to share this content, and I grant
                                ICSR/ISRS the right to display it on their websites, social media, and
                                promotional materials in accordance with the license type selected above.
                            </span>
                        </label>
                    </div>

                    <div class="license-checkbox-group">
                        <label class="license-checkbox-label">
                            <input
                                type="checkbox"
                                id="liability-waiver-agreed"
                                class="license-checkbox"
                                ${this.state.liabilityWaiverAgreed ? 'checked' : ''}
                            />
                            <span class="license-checkbox-text">
                                <strong>Liability Waiver</strong> <span class="required">*</span><br/>
                                I agree that ICSR/ISRS is not liable for any claims, damages, or legal
                                actions arising from this content. I will defend and hold harmless ICSR/ISRS
                                from any such claims, including but not limited to copyright infringement,
                                defamation, or invasion of privacy.
                            </span>
                        </label>
                    </div>
                </div>

                <div class="license-validation-message" id="license-validation-message" style="display: none;">
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Text inputs
        const photographerName = this.container.querySelector('#photographer-name');
        const photographerEmail = this.container.querySelector('#photographer-email');
        const copyrightHolder = this.container.querySelector('#copyright-holder');
        const licenseType = this.container.querySelector('#license-type');
        const usageRightsAgreed = this.container.querySelector('#usage-rights-agreed');
        const liabilityWaiverAgreed = this.container.querySelector('#liability-waiver-agreed');

        photographerName.addEventListener('input', (e) => {
            this.state.photographerName = e.target.value;
            this.validateAndNotify();
        });

        photographerEmail.addEventListener('input', (e) => {
            this.state.photographerEmail = e.target.value;
            this.validateAndNotify();
        });

        copyrightHolder.addEventListener('input', (e) => {
            this.state.copyrightHolder = e.target.value;
            this.validateAndNotify();
        });

        licenseType.addEventListener('change', (e) => {
            this.state.licenseType = e.target.value;
            // Update description
            const descEl = this.container.querySelector('.license-type-description');
            if (descEl) {
                descEl.textContent = this.getLicenseDescription(this.state.licenseType);
            }
            this.validateAndNotify();
        });

        usageRightsAgreed.addEventListener('change', (e) => {
            this.state.usageRightsAgreed = e.target.checked;
            this.validateAndNotify();
        });

        liabilityWaiverAgreed.addEventListener('change', (e) => {
            this.state.liabilityWaiverAgreed = e.target.checked;
            this.validateAndNotify();
        });
    }

    getLicenseDescription(licenseValue) {
        const license = this.licenseTypes.find(lt => lt.value === licenseValue);
        return license ? license.description : '';
    }

    validate() {
        const errors = [];

        if (!this.state.photographerName.trim()) {
            errors.push('Photographer name is required');
        }

        if (this.state.photographerEmail && !this.isValidEmail(this.state.photographerEmail)) {
            errors.push('Please enter a valid email address');
        }

        if (!this.state.usageRightsAgreed) {
            errors.push('You must agree to the usage rights agreement');
        }

        if (!this.state.liabilityWaiverAgreed) {
            errors.push('You must agree to the liability waiver');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateAndNotify() {
        const validation = this.validate();
        this.showValidationMessage(validation);
        this.options.onValidChange(validation.isValid, this.getData());
    }

    showValidationMessage(validation) {
        const messageEl = this.container.querySelector('#license-validation-message');
        if (!messageEl) return;

        if (validation.isValid) {
            messageEl.style.display = 'none';
        } else {
            messageEl.innerHTML = validation.errors.map(e =>
                `<div class="license-error">${this.escapeHtml(e)}</div>`
            ).join('');
            messageEl.style.display = 'block';
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    getData() {
        return {
            photographer_name: this.state.photographerName.trim(),
            photographer_email: this.state.photographerEmail.trim() || null,
            copyright_holder: this.state.copyrightHolder.trim() || this.state.photographerName.trim(),
            license_type: this.state.licenseType,
            usage_rights_agreed: this.state.usageRightsAgreed,
            liability_waiver_agreed: this.state.liabilityWaiverAgreed,
        };
    }

    isValid() {
        return this.validate().isValid;
    }

    reset() {
        this.state = {
            photographerName: '',
            photographerEmail: '',
            copyrightHolder: '',
            licenseType: 'All Rights Reserved',
            usageRightsAgreed: false,
            liabilityWaiverAgreed: false,
        };
        this.render();
        this.attachEventListeners();
        this.validateAndNotify();
    }

    prefill(data) {
        if (data.photographerName) this.state.photographerName = data.photographerName;
        if (data.photographerEmail) this.state.photographerEmail = data.photographerEmail;
        if (data.copyrightHolder) this.state.copyrightHolder = data.copyrightHolder;
        if (data.licenseType) this.state.licenseType = data.licenseType;
        this.render();
        this.attachEventListeners();
        this.validateAndNotify();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
}

// CSS styles for the component
const licenseAgreementStyles = `
<style>
.license-agreement {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #333;
}

.license-section {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.license-consent-section {
    background: #fff8e6;
    border-color: #ffc107;
}

.license-section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #212529;
}

.license-field {
    margin-bottom: 16px;
}

.license-field:last-child {
    margin-bottom: 0;
}

.license-label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: #495057;
}

.license-label .required {
    color: #dc3545;
}

.license-input,
.license-select {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    background: white;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.license-input:focus,
.license-select:focus {
    border-color: #0d6efd;
    outline: 0;
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

.license-help {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #6c757d;
}

.license-checkbox-group {
    margin-bottom: 16px;
    padding: 12px;
    background: white;
    border-radius: 4px;
    border: 1px solid #e9ecef;
}

.license-checkbox-group:last-child {
    margin-bottom: 0;
}

.license-checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
}

.license-checkbox {
    margin-top: 4px;
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.license-checkbox-text {
    flex: 1;
    line-height: 1.5;
    color: #495057;
}

.license-checkbox-text strong {
    color: #212529;
}

.license-checkbox-text .required {
    color: #dc3545;
}

.license-validation-message {
    margin-top: 16px;
    padding: 12px;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
}

.license-error {
    color: #721c24;
    margin-bottom: 4px;
}

.license-error:last-child {
    margin-bottom: 0;
}

/* Compact mode */
.license-compact .license-section {
    padding: 12px;
    margin-bottom: 16px;
}

.license-compact .license-field {
    margin-bottom: 12px;
}

.license-compact .license-checkbox-group {
    padding: 8px;
}
</style>
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleContainer = document.createElement('div');
    styleContainer.innerHTML = licenseAgreementStyles;
    document.head.appendChild(styleContainer.firstElementChild);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.LicenseAgreement = LicenseAgreement;
}
