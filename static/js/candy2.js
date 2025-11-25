/**
 * Candy2 Hugo Theme - Interactive JavaScript
 * Implements the original Vue.js behaviors using vanilla JavaScript and View Transitions API
 */

(function () {
    'use strict';

    // State management
    const state = {
        isBeanMini: false,
        mobileMode: false,
        currentModal: null,
        scrollThreshold: 0,
        eventHandlersSetup: false
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Check for hash-based scroll position first
        checkHashScrollPosition();

        setupBeanMainScroll();
        setupArticleModal();
        setupViewTransitions();
        setupResponsive();
        setupHorizontalWheel();

        // Initial state
        checkMobileMode();

        // Restore scroll position if returning from modal
        restoreScrollPosition();
    }

    /**
     * Setup bean-main scroll behavior
     * The navigation sidebar should shrink when scrolling horizontally
     */
    function setupBeanMainScroll() {
        const container = document.getElementById('container');

        if (!container) return;

        // Calculate threshold: 45% of viewport width - 99px (as in original)
        state.scrollThreshold = Math.floor(window.innerWidth * 0.45 - 99);

        // Track if posts have been revealed
        let postsRevealed = false;

        container.addEventListener('scroll', function (e) {
            if (state.mobileMode) return;

            const scrollLeft = e.target.scrollLeft;

            // Handle posts slide-in animation
            const containedContainers = document.querySelector('.contained-containers');
            if (containedContainers) {
                // If user starts scrolling, immediately slide in posts from the right
                if (scrollLeft > 10 && !postsRevealed) {
                    postsRevealed = true;
                    containedContainers.style.opacity = '1';
                    containedContainers.style.visibility = 'visible';
                    containedContainers.style.transform = 'translateX(0)';
                    containedContainers.style.transition = 'transform 0.5s cubic-bezier(0.68, 0, 0.33, 1), opacity 0.5s';
                }

                // Keep posts visible once revealed (don't hide when scrolling back)
                if (postsRevealed) {
                    containedContainers.style.opacity = '1';
                    containedContainers.style.visibility = 'visible';
                }
            }

            // Toggle bean-main-mini class based on scroll position
            if (scrollLeft >= state.scrollThreshold) {
                if (!state.isBeanMini) {
                    state.isBeanMini = true;
                    document.querySelector('.bean-main').classList.add('bean-main-mini');
                }
            } else {
                if (state.isBeanMini) {
                    state.isBeanMini = false;
                    document.querySelector('.bean-main').classList.remove('bean-main-mini');
                }
            }
        });
    }

    /**
     * Setup horizontal wheel scrolling
     * Convert vertical wheel scrolling to horizontal in desktop mode
     */
    function setupHorizontalWheel() {
        const container = document.getElementById('container');
        if (!container) return;

        container.addEventListener('wheel', function (e) {
            if (state.mobileMode) return;

            // Only convert vertical scrolling to horizontal on desktop
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }

    /**
     * Global click handler for article modal interactions
     * This handler is registered ONCE to prevent multiple registrations
     */
    function handleGlobalClick(e) {
        // Intercept article links for smooth transitions
        const articleLink = e.target.closest('.bean-article');
        if (articleLink && articleLink.href) {
            e.preventDefault();

            // Save current scroll position
            saveScrollPosition();

            // Navigate to article page with View Transitions
            navigateToArticle(articleLink.href);
            return;
        }

        // Close button - navigate back to home
        const closeBtn = e.target.closest('.modal-close');
        if (closeBtn) {
            e.preventDefault();
            closeArticleModal();
            return;
        }

        // Click outside modal to close
        if (e.target.classList.contains('modal')) {
            e.preventDefault();
            closeArticleModal();
            return;
        }
    }

    /**
     * Global keyup handler for ESC key
     * This handler is registered ONCE to prevent multiple registrations
     */
    function handleGlobalKeyup(e) {
        if (e.key === 'Escape' && isArticlePage()) {
            closeArticleModal();
        }
    }

    /**
     * Setup article modal popup using View Transitions API
     * Each post page is rendered as a separate HTML file that appears as a modal
     * This function is safe to call multiple times - it only registers handlers once
     */
    function setupArticleModal() {
        // Only register event handlers once
        if (!state.eventHandlersSetup) {
            document.addEventListener('click', handleGlobalClick);
            document.addEventListener('keyup', handleGlobalKeyup);
            window.addEventListener('popstate', handleModalPopState);
            state.eventHandlersSetup = true;
        }
    }

    /**
     * Check if current page is an article page
     */
    function isArticlePage() {
        return document.querySelector('.modal') !== null;
    }

    /**
     * Save scroll position using history state and hash
     */
    function saveScrollPosition() {
        const container = document.getElementById('container');
        if (container) {
            const scrollData = {
                scrollLeft: container.scrollLeft,
                scrollTop: container.scrollTop
            };
            // Store in both sessionStorage and history state for reliability
            sessionStorage.setItem('scrollPosition', JSON.stringify(scrollData));
            return scrollData;
        }
        return null;
    }

    /**
     * Restore scroll position from history state or sessionStorage
     */
    function restoreScrollPosition() {
        const container = document.getElementById('container');
        if (!container) return;

        // Try to get scroll position from sessionStorage
        const scrollDataStr = sessionStorage.getItem('scrollPosition');
        if (scrollDataStr) {
            try {
                const scrollData = JSON.parse(scrollDataStr);

                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    container.scrollLeft = scrollData.scrollLeft || 0;
                    container.scrollTop = scrollData.scrollTop || 0;
                });

                // Clear after restoring
                sessionStorage.removeItem('scrollPosition');
            } catch (e) {
                console.error('Error restoring scroll position:', e);
            }
        }
    }

    /**
     * Check if URL is a list page (tags, categories, etc)
     */
    function isListPage(url) {
        const path = new URL(url, window.location.origin).pathname;
        return path.includes('/tags/') || path.includes('/categories/');
    }

    /**
     * Check if URL is a single page (posts, about, etc)
     */
    function isSinglePage(url) {
        const path = new URL(url, window.location.origin).pathname;
        return path.includes('/posts/') || path === '/about/' || path === '/about';
    }

    /**
     * Navigate to article page with View Transitions and scale-up animation
     */
    async function navigateToArticle(url) {
        // Save scroll position with history state
        const scrollData = saveScrollPosition();

        if (!document.startViewTransition) {
            // Fallback to normal navigation with hash
            const urlWithHash = url + (scrollData ? `#scroll-${scrollData.scrollLeft}` : '');
            window.location.href = urlWithHash;
            return;
        }

        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');

            // Check page type and handle accordingly
            if (isListPage(url)) {
                // For list pages: replace content in #contained-containers
                await navigateToListPage(url, newDoc, scrollData);
            } else if (isSinglePage(url)) {
                // For single pages: append modal with animation
                await navigateToSinglePage(url, newDoc, scrollData);
            } else {
                // Default behavior: replace entire body
                await navigateDefault(url, newDoc, scrollData);
            }

        } catch (error) {
            console.error('Navigation error:', error);
            const urlWithHash = url + (scrollData ? `#scroll-${scrollData.scrollLeft}` : '');
            window.location.href = urlWithHash;
        }
    }

    /**
     * Navigate to list page (tags, categories) - replace content only
     */
    async function navigateToListPage(url, newDoc, scrollData) {
        const newContainer = newDoc.querySelector('#contained-containers');
        const currentContainer = document.querySelector('#contained-containers');

        if (!newContainer || !currentContainer) {
            return navigateDefault(url, newDoc, scrollData);
        }

        const transition = document.startViewTransition(() => {
            // Fade out animation
            currentContainer.style.opacity = '0';
            currentContainer.style.transform = 'translateY(20px)';

            setTimeout(() => {
                // Replace content
                currentContainer.innerHTML = newContainer.innerHTML;
                document.title = newDoc.title;

                // Fade in animation
                currentContainer.style.opacity = '1';
                currentContainer.style.transform = 'translateY(0)';
                currentContainer.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }, 100);
        });

        await transition.finished;

        // Update URL
        const state = {
            page: 'list',
            url: url,
            scrollPosition: scrollData
        };
        history.pushState(state, '', url);
    }

    /**
     * Navigate to single page (posts, about) - append modal
     */
    async function navigateToSinglePage(url, newDoc, scrollData) {
        const modalContent = newDoc.querySelector('.modal');

        if (!modalContent) {
            return navigateDefault(url, newDoc, scrollData);
        }

        // Create modal element
        const modal = modalContent.cloneNode(true);
        modal.classList.add('appended-modal');
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9) translateY(50px)';
        modal.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';

        const transition = document.startViewTransition(() => {
            // Append modal to document
            document.body.appendChild(modal);
            document.title = newDoc.title;

            // Trigger animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    modal.style.opacity = '1';
                    modal.style.transform = 'scale(1) translateY(0)';
                });
            });
        });

        await transition.finished;

        // Update URL
        const state = {
            page: 'single',
            url: url,
            scrollPosition: scrollData
        };
        history.pushState(state, '', url);
    }

    /**
     * Default navigation - replace entire body
     */
    async function navigateDefault(url, newDoc, scrollData) {
        const newModal = newDoc.querySelector('.bean-read');
        if (newModal) {
            newModal.classList.add('modal-opening');
        }

        const transition = document.startViewTransition(() => {
            // Replace entire body content
            document.body.innerHTML = newDoc.body.innerHTML;
            document.title = newDoc.title;
        });

        await transition.finished;

        // Update URL with history state containing scroll position
        const state = {
            page: 'article',
            url: url,
            scrollPosition: scrollData
        };
        history.pushState(state, '', url);

        // Remove opening animation class after animation completes
        const modal = document.querySelector('.bean-read');
        if (modal) {
            modal.scrollTop = 0;
            setTimeout(() => {
                modal.classList.remove('modal-opening');
            }, 500);
        }
    }

    /**
     * Close article modal with slide-up fade-out animation
     */
    async function closeArticleModal() {
        const modal = document.querySelector('.modal');
        const appendedModal = document.querySelector('.modal.appended-modal');

        // Check if this is an appended modal (single page mode)
        if (appendedModal || (history.state && history.state.page === 'single' && modal)) {
            const targetModal = appendedModal || modal;

            // Add closing animation
            targetModal.style.opacity = '0';
            targetModal.style.transform = 'scale(0.95) translateY(30px)';
            targetModal.style.transition = 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';

            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, 400));

            if (document.startViewTransition) {
                const transition = document.startViewTransition(() => {
                    // Remove modal from document
                    targetModal.remove();
                });

                await transition.finished;
            } else {
                targetModal.remove();
            }

            // Go back in history if applicable
            if (history.state && (history.state.page === 'single' || history.state.page === 'article')) {
                history.back();
            }

            // Restore scroll position
            setTimeout(() => {
                restoreScrollPosition();
            }, 50);

            return;
        }

        // For list pages, just go back
        if (history.state && history.state.page === 'list') {
            history.back();
            return;
        }

        // For default modal pages (bean-read), use original logic
        const beanRead = document.querySelector('.bean-read');
        if (beanRead) {
            beanRead.classList.add('modal-closing');
            await new Promise(resolve => setTimeout(resolve, 400));
        }

        if (!document.startViewTransition) {
            window.history.back();
            return;
        }

        try {
            const response = await fetch('/');
            const html = await response.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');

            const transition = document.startViewTransition(() => {
                // Replace entire body content
                document.body.innerHTML = newDoc.body.innerHTML;
                document.title = newDoc.title;

                // Re-initialize homepage-specific functionality
                setupBeanMainScroll();
                setupViewTransitions();
                setupHorizontalWheel();
            });

            await transition.finished;

            // Get scroll position from history state if available
            let scrollData = null;
            if (history.state && history.state.scrollPosition) {
                scrollData = history.state.scrollPosition;
                // Store in sessionStorage for restoration
                sessionStorage.setItem('scrollPosition', JSON.stringify(scrollData));
            }

            // Update URL
            history.pushState({ page: 'home' }, '', '/');

            // Restore scroll position with delay for smooth pop-in
            setTimeout(() => {
                restoreScrollPosition();
            }, 50);

        } catch (error) {
            console.error('Navigation error:', error);
            window.history.back();
        }
    }

    /**
     * Handle browser back/forward for modal navigation
     */
    function handleModalPopState(event) {
        // If going back to homepage, restore scroll position from history state
        if (event.state && event.state.page === 'home') {
            // Page will reload, scroll position will be restored via sessionStorage
        } else if (event.state && event.state.scrollPosition) {
            // Store scroll position for restoration
            sessionStorage.setItem('scrollPosition', JSON.stringify(event.state.scrollPosition));
        }
    }

    /**
     * Check URL hash for scroll position on page load
     */
    function checkHashScrollPosition() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#scroll-')) {
            const scrollLeft = parseInt(hash.replace('#scroll-', ''), 10);
            if (!isNaN(scrollLeft)) {
                const scrollData = { scrollLeft: scrollLeft, scrollTop: 0 };
                sessionStorage.setItem('scrollPosition', JSON.stringify(scrollData));
                // Remove hash from URL
                history.replaceState(null, '', window.location.pathname);
            }
        }
    }

    /**
     * Setup View Transitions API for navigation
     */
    function setupViewTransitions() {
        // Intercept navigation links for smooth transitions
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a.link-item');
            if (link && link.href && !link.target) {
                const url = new URL(link.href);
                // Only intercept same-origin links
                if (url.origin === window.location.origin && !link.href.includes('#')) {
                    e.preventDefault();
                    navigateWithTransition(link.href);
                }
            }
        });
    }

    /**
     * Navigate with View Transitions API
     */
    async function navigateWithTransition(url) {
        if (!document.startViewTransition) {
            window.location.href = url;
            return;
        }

        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');

            const transition = document.startViewTransition(() => {
                // Replace main content
                const newContent = newDoc.querySelector('#container');
                const oldContent = document.querySelector('#container');

                if (newContent && oldContent) {
                    oldContent.innerHTML = newContent.innerHTML;

                    // Re-initialize after content change
                    setupBeanMainScroll();
                }

                // Update title
                document.title = newDoc.title;
            });

            await transition.finished;

            // Update URL
            history.pushState({}, '', url);

            // Re-setup event listeners on new content
            setupBeanMainScroll();

        } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = url;
        }
    }

    /**
     * Setup responsive behavior
     */
    function setupResponsive() {
        window.addEventListener('resize', checkMobileMode);
        checkMobileMode();
    }

    /**
     * Check if in mobile mode
     */
    function checkMobileMode() {
        const wasMobile = state.mobileMode;
        state.mobileMode = window.innerWidth < 991;

        if (wasMobile !== state.mobileMode) {
            const beanMain = document.querySelector('.bean-main');
            if (state.mobileMode && beanMain) {
                state.isBeanMini = true;
                beanMain.classList.add('bean-main-mini');
            }

            // Recalculate scroll threshold
            state.scrollThreshold = Math.floor(window.innerWidth * 0.45 - 99);
        }
    }

    /**
     * Check for low performance mode (simplified GPU detection)
     */
    function checkLowPerformance() {
        // Check if backdrop-filter is supported
        if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
            return true;
        }

        // Mobile devices generally handle backdrop-filter well
        if (state.mobileMode) {
            return false;
        }

        // For desktop, assume good performance if browser supports backdrop-filter
        return false;
    }

})();
