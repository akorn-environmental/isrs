/**
 * ISRS Tour Manager - Guided walkthrough system for portals
 *
 * Features:
 * - Spotlight highlighting with dimmed overlay
 * - Tooltip popups with navigation
 * - Progress indicator
 * - localStorage persistence
 * - Theme-aware (respects dark mode)
 * - Keyboard navigation (Esc to close, arrows to navigate)
 * - Dismissal options: "Hide forever" or "Hide until next login"
 */

const TourManager = (() => {
    // State
    let currentTour = null;
    let currentStepIndex = 0;
    let tourElements = {};

    // Storage keys
    const STORAGE_KEY_COMPLETED = 'isrs_tours_completed';
    const STORAGE_KEY_SESSION_DISMISSED = 'isrs_tours_session_dismissed';

    /**
     * Initialize the tour manager
     */
    function init() {
        // Create tour DOM elements
        createTourElements();

        // Add keyboard listeners
        document.addEventListener('keydown', handleKeydown);

        // Listen for window resize to reposition
        window.addEventListener('resize', debounce(repositionTour, 100));
    }

    /**
     * Create the tour overlay and tooltip elements
     */
    function createTourElements() {
        // Check if already created
        if (document.getElementById('tour-overlay')) return;

        // Overlay (4 pieces for spotlight effect)
        const overlayHTML = `
            <div id="tour-overlay" class="tour-overlay hidden">
                <div class="tour-overlay-top"></div>
                <div class="tour-overlay-left"></div>
                <div class="tour-overlay-right"></div>
                <div class="tour-overlay-bottom"></div>
            </div>
        `;

        // Tooltip
        const tooltipHTML = `
            <div id="tour-tooltip" class="tour-tooltip hidden" role="dialog" aria-modal="true">
                <div class="tour-tooltip-arrow"></div>
                <div class="tour-tooltip-content">
                    <div class="tour-tooltip-header">
                        <span class="tour-tooltip-step"></span>
                        <button class="tour-tooltip-close" aria-label="Close tour">&times;</button>
                    </div>
                    <h3 class="tour-tooltip-title"></h3>
                    <p class="tour-tooltip-text"></p>
                    <div class="tour-tooltip-actions">
                        <button class="tour-btn tour-btn-secondary tour-btn-prev">Back</button>
                        <button class="tour-btn tour-btn-primary tour-btn-next">Next</button>
                    </div>
                    <div class="tour-tooltip-dismiss">
                        <button class="tour-btn-link tour-btn-dismiss-session">Hide until next login</button>
                        <button class="tour-btn-link tour-btn-dismiss-forever">Don't show again</button>
                    </div>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        document.body.insertAdjacentHTML('beforeend', tooltipHTML);

        // Cache element references
        tourElements = {
            overlay: document.getElementById('tour-overlay'),
            tooltip: document.getElementById('tour-tooltip'),
            stepIndicator: document.querySelector('.tour-tooltip-step'),
            title: document.querySelector('.tour-tooltip-title'),
            text: document.querySelector('.tour-tooltip-text'),
            prevBtn: document.querySelector('.tour-btn-prev'),
            nextBtn: document.querySelector('.tour-btn-next'),
            closeBtn: document.querySelector('.tour-tooltip-close'),
            dismissSessionBtn: document.querySelector('.tour-btn-dismiss-session'),
            dismissForeverBtn: document.querySelector('.tour-btn-dismiss-forever')
        };

        // Attach event listeners
        tourElements.prevBtn.addEventListener('click', prevStep);
        tourElements.nextBtn.addEventListener('click', nextStep);
        tourElements.closeBtn.addEventListener('click', closeTour);
        tourElements.dismissSessionBtn.addEventListener('click', () => dismissTour('session'));
        tourElements.dismissForeverBtn.addEventListener('click', () => dismissTour('forever'));

        // Click outside to close
        tourElements.overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('tour-overlay') ||
                e.target.classList.contains('tour-overlay-top') ||
                e.target.classList.contains('tour-overlay-left') ||
                e.target.classList.contains('tour-overlay-right') ||
                e.target.classList.contains('tour-overlay-bottom')) {
                closeTour();
            }
        });
    }

    /**
     * Start a tour by ID
     * @param {string} tourId - The tour identifier
     * @param {boolean} force - Force start even if previously completed
     */
    function startTour(tourId, force = false) {
        // Check if tour exists
        if (!window.TourDefinitions || !window.TourDefinitions[tourId]) {
            console.warn(`Tour "${tourId}" not found`);
            return false;
        }

        // Check if already completed (unless forced)
        if (!force && isTourCompleted(tourId)) {
            console.log(`Tour "${tourId}" already completed`);
            return false;
        }

        // Check if dismissed for this session
        if (!force && isTourDismissedForSession(tourId)) {
            console.log(`Tour "${tourId}" dismissed for this session`);
            return false;
        }

        currentTour = window.TourDefinitions[tourId];
        currentStepIndex = 0;

        // Show tour UI
        tourElements.overlay.classList.remove('hidden');
        tourElements.tooltip.classList.remove('hidden');
        document.body.classList.add('tour-active');

        // Show first step
        showStep(0);

        return true;
    }

    /**
     * Show a specific step
     * @param {number} index - Step index
     */
    function showStep(index) {
        if (!currentTour || index < 0 || index >= currentTour.steps.length) return;

        currentStepIndex = index;
        const step = currentTour.steps[index];
        const totalSteps = currentTour.steps.length;

        // Update content
        tourElements.stepIndicator.textContent = `Step ${index + 1} of ${totalSteps}`;
        tourElements.title.textContent = step.title;
        tourElements.text.textContent = step.text;

        // Update buttons
        tourElements.prevBtn.style.display = index === 0 ? 'none' : 'inline-flex';
        tourElements.nextBtn.textContent = index === totalSteps - 1 ? 'Finish' : 'Next';

        // Find and highlight target element
        const targetEl = step.target ? document.querySelector(step.target) : null;

        if (targetEl) {
            highlightElement(targetEl);
            positionTooltip(targetEl, step.position || 'bottom');

            // Scroll element into view if needed
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // No target - center the tooltip
            clearHighlight();
            centerTooltip();
        }

        // Focus the tooltip for accessibility
        tourElements.tooltip.focus();
    }

    /**
     * Highlight a target element with spotlight effect
     * @param {HTMLElement} element - Element to highlight
     */
    function highlightElement(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        const padding = 8; // Padding around highlighted element

        const top = rect.top + scrollTop - padding;
        const left = rect.left + scrollLeft - padding;
        const width = rect.width + (padding * 2);
        const height = rect.height + (padding * 2);

        // Position the 4 overlay pieces around the spotlight
        const overlayTop = tourElements.overlay.querySelector('.tour-overlay-top');
        const overlayLeft = tourElements.overlay.querySelector('.tour-overlay-left');
        const overlayRight = tourElements.overlay.querySelector('.tour-overlay-right');
        const overlayBottom = tourElements.overlay.querySelector('.tour-overlay-bottom');

        overlayTop.style.cssText = `
            top: 0; left: 0; right: 0;
            height: ${top}px;
        `;

        overlayLeft.style.cssText = `
            top: ${top}px; left: 0;
            width: ${left}px;
            height: ${height}px;
        `;

        overlayRight.style.cssText = `
            top: ${top}px; right: 0;
            left: ${left + width}px;
            height: ${height}px;
        `;

        overlayBottom.style.cssText = `
            top: ${top + height}px; left: 0; right: 0;
            bottom: 0;
        `;

        // Add highlight ring to element
        element.classList.add('tour-highlighted');
    }

    /**
     * Clear highlight from all elements
     */
    function clearHighlight() {
        document.querySelectorAll('.tour-highlighted').forEach(el => {
            el.classList.remove('tour-highlighted');
        });
    }

    /**
     * Position tooltip relative to target element
     * @param {HTMLElement} targetEl - Target element
     * @param {string} position - 'top', 'bottom', 'left', 'right'
     */
    function positionTooltip(targetEl, position) {
        const rect = targetEl.getBoundingClientRect();
        const tooltipRect = tourElements.tooltip.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        const gap = 16; // Gap between element and tooltip
        let top, left;

        // Remove all position classes
        tourElements.tooltip.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');

        switch (position) {
            case 'top':
                top = rect.top + scrollTop - tooltipRect.height - gap;
                left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + scrollTop + gap;
                left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + scrollTop + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left + scrollLeft - tooltipRect.width - gap;
                break;
            case 'right':
                top = rect.top + scrollTop + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + scrollLeft + gap;
                break;
            default:
                top = rect.bottom + scrollTop + gap;
                left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
        }

        // Keep tooltip within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 10) left = 10;
        if (left + tooltipRect.width > viewportWidth - 10) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        if (top < scrollTop + 10) top = scrollTop + 10;

        tourElements.tooltip.style.top = `${top}px`;
        tourElements.tooltip.style.left = `${left}px`;
        tourElements.tooltip.classList.add(`position-${position}`);
    }

    /**
     * Center tooltip on screen (for steps without target)
     */
    function centerTooltip() {
        const tooltipRect = tourElements.tooltip.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        tourElements.tooltip.style.top = `${scrollTop + (window.innerHeight / 2) - (tooltipRect.height / 2)}px`;
        tourElements.tooltip.style.left = `${(window.innerWidth / 2) - (tooltipRect.width / 2)}px`;
        tourElements.tooltip.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');

        // Hide spotlight overlay pieces
        const overlays = tourElements.overlay.querySelectorAll('[class^="tour-overlay-"]');
        overlays.forEach(el => el.style.cssText = '');
    }

    /**
     * Go to next step
     */
    function nextStep() {
        if (!currentTour) return;

        if (currentStepIndex < currentTour.steps.length - 1) {
            clearHighlight();
            showStep(currentStepIndex + 1);
        } else {
            // Tour complete
            completeTour();
        }
    }

    /**
     * Go to previous step
     */
    function prevStep() {
        if (!currentTour || currentStepIndex <= 0) return;
        clearHighlight();
        showStep(currentStepIndex - 1);
    }

    /**
     * Close tour without completing
     */
    function closeTour() {
        if (!currentTour) return;

        clearHighlight();
        tourElements.overlay.classList.add('hidden');
        tourElements.tooltip.classList.add('hidden');
        document.body.classList.remove('tour-active');

        currentTour = null;
        currentStepIndex = 0;
    }

    /**
     * Complete the tour and mark as done
     */
    function completeTour() {
        if (!currentTour) return;

        // Mark as completed
        markTourCompleted(currentTour.id);

        closeTour();
    }

    /**
     * Dismiss tour (session or forever)
     * @param {string} type - 'session' or 'forever'
     */
    function dismissTour(type) {
        if (!currentTour) return;

        if (type === 'forever') {
            markTourCompleted(currentTour.id);
        } else {
            markTourDismissedForSession(currentTour.id);
        }

        closeTour();
    }

    /**
     * Check if tour is completed
     * @param {string} tourId
     * @returns {boolean}
     */
    function isTourCompleted(tourId) {
        const completed = JSON.parse(localStorage.getItem(STORAGE_KEY_COMPLETED) || '[]');
        return completed.includes(tourId);
    }

    /**
     * Mark tour as completed
     * @param {string} tourId
     */
    function markTourCompleted(tourId) {
        const completed = JSON.parse(localStorage.getItem(STORAGE_KEY_COMPLETED) || '[]');
        if (!completed.includes(tourId)) {
            completed.push(tourId);
            localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completed));
        }
    }

    /**
     * Check if tour is dismissed for this session
     * @param {string} tourId
     * @returns {boolean}
     */
    function isTourDismissedForSession(tourId) {
        const dismissed = JSON.parse(sessionStorage.getItem(STORAGE_KEY_SESSION_DISMISSED) || '[]');
        return dismissed.includes(tourId);
    }

    /**
     * Mark tour as dismissed for this session
     * @param {string} tourId
     */
    function markTourDismissedForSession(tourId) {
        const dismissed = JSON.parse(sessionStorage.getItem(STORAGE_KEY_SESSION_DISMISSED) || '[]');
        if (!dismissed.includes(tourId)) {
            dismissed.push(tourId);
            sessionStorage.setItem(STORAGE_KEY_SESSION_DISMISSED, JSON.stringify(dismissed));
        }
    }

    /**
     * Reset tour completion status
     * @param {string} tourId - Specific tour or null for all
     */
    function resetTour(tourId = null) {
        if (tourId) {
            const completed = JSON.parse(localStorage.getItem(STORAGE_KEY_COMPLETED) || '[]');
            const index = completed.indexOf(tourId);
            if (index > -1) {
                completed.splice(index, 1);
                localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completed));
            }
        } else {
            localStorage.removeItem(STORAGE_KEY_COMPLETED);
        }
        sessionStorage.removeItem(STORAGE_KEY_SESSION_DISMISSED);
    }

    /**
     * Reposition tour on resize
     */
    function repositionTour() {
        if (!currentTour) return;
        showStep(currentStepIndex);
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e
     */
    function handleKeydown(e) {
        if (!currentTour) return;

        switch (e.key) {
            case 'Escape':
                closeTour();
                break;
            case 'ArrowRight':
            case 'Enter':
                nextStep();
                break;
            case 'ArrowLeft':
                prevStep();
                break;
        }
    }

    /**
     * Debounce helper
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        start: startTour,
        next: nextStep,
        prev: prevStep,
        close: closeTour,
        reset: resetTour,
        isCompleted: isTourCompleted
    };
})();

// Make globally available
window.TourManager = TourManager;
