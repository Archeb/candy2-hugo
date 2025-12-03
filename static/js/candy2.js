/**
 * Candy2 Hugo Theme - Interactive JavaScript
 * Implements the original Vue.js behaviors using vanilla JavaScript and View Transitions API
 */

// State management
const state = {
    isBeanMini: false,
    mobileMode: false,
    currentModal: null,
    scrollThreshold: 0,
    eventHandlersSetup: false,
    activeProgrammaticScrolls: 0,
};

/**
 * Update navigation link-item-selected state based on current URL
 */
function updateNavigationState(url) {
    const currentPath = new URL(url, window.location.origin).pathname;
    const linkItems = document.querySelectorAll(".bean-main .link-item");

    linkItems.forEach((link) => {
        link.classList.remove("link-item-selected");
        const linkPath = new URL(link.href, window.location.origin).pathname;

        // Exact match only (ignoring search params)
        if (currentPath === linkPath) {
            link.classList.add("link-item-selected");
        }
    });
}

/**
 * Collapse bean-main to mini state
 */
function collapseBeanMain() {
    const beanMain = document.querySelector(".bean-main");
    if (beanMain && !state.mobileMode) {
        state.isBeanMini = true;
        beanMain.classList.add("bean-main-mini");
    }
}

// Initialize on DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

function init() {
    setupBeanMainScroll();
    setupArticleModal();
    setupResponsive();
    setupHorizontalWheel();
    setupMobileScrollBehavior();
    setupTocHighlight();
    setupProgressBar();
    setupPagination(); // Setup automatic pagination

    // Initial state
    checkMobileMode();

    // Update navigation state on initial load
    updateNavigationState(window.location.href);
}

/**
 * Setup Table of Contents highlighting based on scroll position
 * Highlights the TOC link corresponding to the currently visible section
 */
function setupTocHighlight() {
    const beanRead = document.querySelector(".bean-read");
    const articleToc = document.querySelector(".article-toc");

    if (!beanRead || !articleToc) return;

    // Get all TOC links
    const tocLinks = articleToc.querySelectorAll('a[href^="#"]');
    if (tocLinks.length === 0) return;

    // Get all heading elements that have IDs
    const headings = [];
    tocLinks.forEach((link) => {
        const id = link.getAttribute("href").substring(1);
        const heading = document.getElementById(id);
        if (heading) {
            headings.push({
                id: id,
                element: heading,
                link: link,
            });
        }
    });

    if (headings.length === 0) return;

    // Scroll handler to update active TOC item
    function updateActiveToc() {
        const scrollTop = beanRead.scrollTop;
        const scrollHeight = beanRead.scrollHeight;
        const clientHeight = beanRead.clientHeight;

        // If we're at the bottom, highlight the last item
        if (scrollTop + clientHeight >= scrollHeight - 10) {
            tocLinks.forEach((link) => link.classList.remove("active"));
            headings[headings.length - 1].link.classList.add("active");
            return;
        }

        // Find the current active section
        // A section is considered active if it's in the top 30% of the viewport
        const threshold = scrollTop + clientHeight * 0.3;

        let activeHeading = null;
        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            const headingTop = heading.element.offsetTop;

            if (headingTop <= threshold) {
                activeHeading = heading;
                break;
            }
        }

        // Update active class
        tocLinks.forEach((link) => link.classList.remove("active"));
        if (activeHeading) {
            activeHeading.link.classList.add("active");
        }
    }

    // Add scroll listener
    beanRead.addEventListener("scroll", updateActiveToc);

    // Initial update
    updateActiveToc();

    // Add click handlers for smooth scrolling
    tocLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const id = this.getAttribute("href").substring(1);
            const target = document.getElementById(id);
            if (target) {
                const targetTop = target.offsetTop - 100; // Offset for banner
                smoothScrollTo(beanRead, targetTop, 600, "top");
            }
        });
    });
}

/**
 * Setup progress bar based on scroll position
 * Updates the width of #banner-progressbar based on reading progress
 */
function setupProgressBar() {
    const beanRead = document.querySelector(".bean-read");
    const progressBar = document.getElementById("banner-progressbar");

    if (!beanRead || !progressBar) return;

    function updateProgressBar() {
        const scrollTop = beanRead.scrollTop;
        const scrollHeight = beanRead.scrollHeight;
        const clientHeight = beanRead.clientHeight;

        // Calculate scroll percentage
        const scrollableHeight = scrollHeight - clientHeight;
        const scrollPercentage =
            scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

        // Update progress bar width
        progressBar.style.width = `${Math.min(
            100,
            Math.max(0, scrollPercentage)
        )}%`;
    }

    // Add scroll listener
    beanRead.addEventListener("scroll", updateProgressBar);

    // Initial update
    updateProgressBar();
}

/**
 * Setup bean-main scroll behavior
 * The navigation sidebar should shrink when scrolling horizontally
 */
function setupBeanMainScroll() {
    const container = document.getElementById("container");

    if (!container) return;

    // Calculate threshold: 45% of viewport width - 99px (as in original)
    state.scrollThreshold = Math.floor(window.innerWidth * 0.45 - 100);

    // Track if posts have been revealed
    let postsRevealed = false;

    container.addEventListener("scroll", function (e) {
        if (state.mobileMode) return;

        const scrollLeft = e.target.scrollLeft;

        // Handle posts slide-in animation
        const containedContainers = document.querySelector(".contained-containers");
        if (containedContainers) {
            // If user starts scrolling, immediately slide in posts from the right
            if (scrollLeft > 10 && !postsRevealed) {
                postsRevealed = true;
                containedContainers.style.opacity = "1";
                containedContainers.style.visibility = "visible";
                containedContainers.style.transform = "translateX(0)";
                containedContainers.style.transition =
                    "transform 0.5s cubic-bezier(0.68, 0, 0.33, 1), opacity 0.5s";
            }

            // Keep posts visible once revealed (don't hide when scrolling back)
            if (postsRevealed) {
                containedContainers.style.opacity = "1";
                containedContainers.style.visibility = "visible";
            }
        }

        // Toggle bean-main-mini class based on scroll position
        if (scrollLeft >= state.scrollThreshold) {
            if (!state.isBeanMini) {
                state.isBeanMini = true;
                document.querySelector(".bean-main").classList.add("bean-main-mini");
            }
        } else {
            if (state.isBeanMini) {
                state.isBeanMini = false;
                document.querySelector(".bean-main").classList.remove("bean-main-mini");
            }
        }
    });
}

/**
 * Setup horizontal wheel scrolling
 * Convert vertical wheel scrolling to horizontal in desktop mode
 */
/**
 * Setup horizontal wheel scrolling
 * Convert vertical wheel scrolling to horizontal in desktop mode
 * Implements smooth scrolling with inertia for a "Chrome-like" feel
 */
function setupHorizontalWheel() {
    const container = document.getElementById("container");
    if (!container) return;

    // State for smooth scrolling
    let targetScrollLeft = container.scrollLeft;
    let isAnimating = false;
    let lastScrollLeft = container.scrollLeft;
    let isWheelScrolling = false;
    const lerpFactor = 0.15; // Controls the "weight" or "smoothness" (0.1 = heavy/smooth, 0.3 = snappy)

    // Animation loop
    function updateScroll() {
        if (!isAnimating) return;

        // Avoid conflict with smoothScrollTo
        if (state.activeProgrammaticScrolls > 0) {
            isAnimating = false;
            return;
        }

        const current = container.scrollLeft;
        const diff = targetScrollLeft - current;

        // Stop if close enough
        if (Math.abs(diff) < 0.5) {
            container.scrollLeft = targetScrollLeft;
            isAnimating = false;
            isWheelScrolling = false;
            return;
        }

        // Interpolate
        container.scrollLeft = current + diff * lerpFactor;
        requestAnimationFrame(updateScroll);
    }

    // Listen for manual scroll (e.g., dragging scrollbar)
    container.addEventListener("scroll", function() {
        // Skip if this is a programmatic scroll
        if (state.activeProgrammaticScrolls > 0) {
            lastScrollLeft = container.scrollLeft;
            return;
        }

        // Skip if this scroll is caused by our wheel animation
        if (isWheelScrolling) {
            lastScrollLeft = container.scrollLeft;
            return;
        }

        // Detect manual scroll: if scrollLeft changed but we didn't cause it
        if (container.scrollLeft !== lastScrollLeft) {
            // User manually scrolled, sync target position
            targetScrollLeft = container.scrollLeft;
            lastScrollLeft = container.scrollLeft;
            isAnimating = false;
        }
    });

    container.addEventListener(
        "wheel",
        function (e) {
            if (state.mobileMode) return;

            // Only convert vertical scrolling to horizontal on desktop
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();

                isWheelScrolling = true;

                // If animation was stopped, sync target to current position
                if (!isAnimating) {
                    targetScrollLeft = container.scrollLeft;
                }

                // Normalize delta
                let delta = e.deltaY;
                if (e.deltaMode === 1) {
                    // DOM_DELTA_LINE
                    delta *= 40; // Estimate line height
                } else if (e.deltaMode === 2) {
                    // DOM_DELTA_PAGE
                    delta *= container.clientHeight;
                }

                // Accumulate delta
                targetScrollLeft += delta;

                // Clamp target
                const maxScroll = container.scrollWidth - container.clientWidth;
                targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScroll));

                // Start animation if not running
                if (!isAnimating) {
                    isAnimating = true;
                    requestAnimationFrame(updateScroll);
                }
            }
        },
        { passive: false }
    );
}

/**
 * Global click handler for all navigation interactions
 * This handler is registered ONCE to prevent multiple registrations
 * Handles: article links, navigation links, modal close buttons
 */
function handleGlobalClick(e) {
    // 1. Intercept article links (.bean-article) for smooth transitions
    const articleLink = e.target.closest(".bean-article");
    if (articleLink && articleLink.href) {
        e.preventDefault();
        navigateToArticle(articleLink.href);
        return;
    }

    // 2. Intercept navigation links (.link-item) for smooth transitions
    const navLink = e.target.closest("a.link-item");
    if (navLink && navLink.href && !navLink.target) {
        const url = new URL(navLink.href);

        // If clicking the same page
        if (url.pathname == window.location.pathname) {
            e.preventDefault();
            return;
        }

        // Only intercept same-origin links (not external or anchor links)
        if (url.origin === window.location.origin && !navLink.href.includes("#")) {
            e.preventDefault();
            navigateWithTransition(navLink.href);
            return;
        }
    }

    // Handle pagination link clicks
    const paginationNext = e.target.closest(".pagination-next");
    if (paginationNext && paginationNext.href && !paginationNext.target) {
        e.preventDefault();
        navigateWithTransition(paginationNext.href);
        return;
    }

    // 3. Close button - navigate back to home
    const closeBtn = e.target.closest(".modal-close");
    if (closeBtn) {
        e.preventDefault();
        closeArticleModal();
        return;
    }

    // 4. Mobile close button in banner-tools (mobile only)
    const mobileCloseBtn = e.target.closest(".mobile-close-btn");
    if (mobileCloseBtn) {
        e.preventDefault();
        closeArticleModal();
        return;
    }

    // 5. Click outside modal to close
    if (e.target.classList.contains("modal") || e.target.classList.contains("modal-visible-container")) {
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
    if (e.key === "Escape" && isArticlePage()) {
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
        document.addEventListener("click", handleGlobalClick);
        document.addEventListener("keyup", handleGlobalKeyup);
        window.addEventListener("popstate", handleModalPopState);
        state.eventHandlersSetup = true;
    }

    // Setup mobile scroll behavior for banner
    setupMobileScrollBehavior();
}

/**
 * Setup scroll behavior for article banner
 */
function setupMobileScrollBehavior() {
    // Only run in mobile mode and if modal exists
    if (state.mobileMode) {
        // Calculate the threshold (height of article-cover which is 72vw in mobile)
        var coverHeight = window.innerWidth * 0.72;
    } else {
        // Calculate the threshold (height of article-cover which is 500px in PC)
        var coverHeight = 500;
    }

    const beanRead = document.querySelector(".bean-read");
    const articleBanner = document.querySelector(".article-banner");
    const articleCover = document.querySelector(".article-cover");

    if (!beanRead || !articleBanner || !articleCover) return;

    // Remove existing scroll listener if any
    if (beanRead._scrollListener) {
        beanRead.removeEventListener("scroll", beanRead._scrollListener);
    }

    // Create and store the scroll listener
    const scrollListener = function () {
        const scrollTop = beanRead.scrollTop;

        // Toggle 'scrolled' class based on scroll position
        if (scrollTop > coverHeight - 50) {
            // 50px offset for smooth transition
            articleBanner.classList.add("scrolled");
        } else {
            articleBanner.classList.remove("scrolled");
        }
    };

    beanRead._scrollListener = scrollListener;
    beanRead.addEventListener("scroll", scrollListener);
}

/**
 * Check if current page is an article page
 */
function isArticlePage() {
    return document.querySelector(".modal") !== null;
}

/**
 * Check if URL is a list page (tags, categories, etc)
 */
function isListPage(url) {
    const path = new URL(url, window.location.origin).pathname;
    return path.includes("/tags/") || path.includes("/categories/") || path.includes("/page/");
}

/**
 * Check if URL is a single page (posts, about, etc)
 * Single pages are those that should be displayed as modals
 */
function isSinglePage(url) {
    const path = new URL(url, window.location.origin).pathname;

    // Root path is not a single page
    if (path === "/" || path === "") {
        return false;
    }

    // List pages are not single pages
    if (isListPage(url)) {
        return false;
    }

    // Everything else is considered a single page
    // This includes /posts/*, /about/, and any custom single pages
    return true;
}

/**
 * Navigate to article page with View Transitions and scale-up animation
 */
async function navigateToArticle(url) {
    if (!document.startViewTransition) {
        // Fallback to normal navigation
        window.location.href = url;
        return;
    }

    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, "text/html");

        // Check page type and handle accordingly
        if (isListPage(url)) {
            // For list pages: replace content in #contained-containers
            await navigateToListPage(url, newDoc);
        } else if (isSinglePage(url)) {
            // For single pages: append modal with animation
            await navigateToSinglePage(url, newDoc);
        } else {
            // Default behavior: replace entire body
            await navigateDefault(url, newDoc);
        }
    } catch (error) {
        console.error("Navigation error:", error);
        window.location.href = url;
    }
}

/**
 * Navigate to list page (tags, categories) - replace content only
 */
async function navigateToListPage(url, newDoc) {
    const newContainer = newDoc.querySelector("#contained-containers");
    const currentContainer = document.querySelector("#contained-containers");
    const container = document.getElementById("container");

    if (!newContainer || !currentContainer) {
        return navigateDefault(url, newDoc);
    }

    // Reset scroll position to threshold
    if (container) {
        if (window.innerWidth < 991) {
            await smoothScrollTo(container, 0, 600, "top");
        } else {
            await smoothScrollTo(container, state.scrollThreshold, 600, "left");
        }
    }

    // Collapse bean-main to mini state
    collapseBeanMain();

    // Use View Transition API - it will automatically apply CSS animations
    const transition = document.startViewTransition(() => {
        // Simply replace the content - View Transition API handles everything
        currentContainer.innerHTML = newContainer.innerHTML;
        document.title = newDoc.title;
    });

    await transition.finished;

    // Update navigation state
    updateNavigationState(url);

    // Update URL
    const historyState = {
        page: "list",
        url: url,
    };
    history.pushState(historyState, "", url);
}

/**
 * Navigate to single page (posts, about) - append modal
 */
async function navigateToSinglePage(url, newDoc) {
    const modalContent = newDoc.querySelector(".modal");

    if (!modalContent) {
        return navigateDefault(url, newDoc);
    }

    // Temporarily remove view-transition-name from contained-beans
    // to prevent it from animating during modal open
    const containedBeans = document.querySelector(".contained-beans");
    const originalTransitionName = containedBeans
        ? containedBeans.style.viewTransitionName
        : null;
    if (containedBeans) {
        containedBeans.style.viewTransitionName = "none";
    }

    // Create modal element
    const modal = modalContent.cloneNode(true);
    modal.style.opacity = "0";
    modal.style.transition = "opacity 0.4s ease";

    // Get bean-read element and set initial state for pop-in animation
    const beanRead = modal.querySelector(".bean-read");
    if (beanRead) {
        beanRead.style.transform = "scale(0.9)";
        beanRead.style.opacity = "0";
        beanRead.style.transition =
            "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease";
    }

    const transition = document.startViewTransition(() => {
        // Append modal to document
        document.body.appendChild(modal);
        document.title = newDoc.title;

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Fade in modal background
                modal.style.opacity = "1";

                // Pop in bean-read element
                if (beanRead) {
                    beanRead.style.transform = "scale(1)";
                    beanRead.style.opacity = "1";
                }
            });
        });
    });

    await transition.finished;

    // Restore view-transition-name
    if (containedBeans) {
        containedBeans.style.viewTransitionName = originalTransitionName || "";
    }

    // Setup mobile scroll behavior for the new modal
    setupMobileScrollBehavior();
    setupTocHighlight();
    setupProgressBar();

    // Update URL
    const state = {
        page: "single",
        url: url,
    };
    history.pushState(state, "", url);

    // Execute scripts in the comment section
    const commentSection = modal.querySelector('.article-comment');
    if (commentSection) {
        const scripts = commentSection.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            if (oldScript.src) {
                newScript.src = oldScript.src;
                newScript.async = oldScript.async || false;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }
}

/**
 * Default navigation - replace entire body
 */
async function navigateDefault(url, newDoc) {
    const newModal = newDoc.querySelector(".bean-read");
    if (newModal) {
        newModal.classList.add("modal-opening");
    }

    const transition = document.startViewTransition(() => {
        // Replace entire body content
        document.body.innerHTML = newDoc.body.innerHTML;
        document.title = newDoc.title;
    });

    await transition.finished;

    // Update URL
    const state = {
        page: "article",
        url: url,
    };
    history.pushState(state, "", url);

    // Setup mobile scroll behavior for the new page
    setupMobileScrollBehavior();
    setupTocHighlight();
    setupProgressBar();

    // Remove opening animation class after animation completes
    const modal = document.querySelector(".bean-read");
    if (modal) {
        modal.scrollTop = 0;
        setTimeout(() => {
            modal.classList.remove("modal-opening");
        }, 500);
    }
}

/**
 * Close article modal with slide-up fade-out animation
 */
async function closeArticleModal() {
    const targetModal = document.querySelector(".modal");

    // Add closing animation
    targetModal.style.transition = "opacity 0.4s ease";
    targetModal.style.opacity = "0";

    var modalVisibleContainer = targetModal.querySelector(".modal-visible-container");

    if (modalVisibleContainer) modalVisibleContainer.classList.add("modal-closing");

    // Wait for animation to complete
    await new Promise((resolve) => setTimeout(resolve, 400));

    targetModal.remove();

    // Check if this is an appended modal (single page mode)
    if (history.state && history.state.page === "single") {
        // Go back in history if applicable
        if (
            history.state &&
            (history.state.page === "single" || history.state.page === "article")
        ) {
            history.back();
        }

        return;
    }
    // For default modal pages (bean-read), use original logic
    history.pushState({ page: "home" }, "", "/");
}

/**
 * Handle browser back/forward for modal navigation
 */
function handleModalPopState(event) {
    // Handle popstate events
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
        const newDoc = parser.parseFromString(html, "text/html");

        // Check page type and handle accordingly
        if (
            isListPage(url) ||
            url === window.location.origin + "/" ||
            url === "/"
        ) {
            // List pages (categories, tags, home): replace content
            await navigateToListPage(url, newDoc);
            return;
        } else if (isSinglePage(url)) {
            // Single pages (posts, about, etc): open as modal
            await navigateToSinglePage(url, newDoc);
            return;
        }

        // Default fallback: replace container content
        const transition = document.startViewTransition(() => {
            // Replace main content
            const newContent = newDoc.querySelector("#container");
            const oldContent = document.querySelector("#container");

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
        history.pushState({}, "", url);

        // Re-setup event listeners on new content
        setupBeanMainScroll();
    } catch (error) {
        console.error("Navigation error:", error);
        window.location.href = url;
    }
}

/**
 * Setup responsive behavior
 */
function setupResponsive() {
    window.addEventListener("resize", checkMobileMode);
    checkMobileMode();
}

/**
 * Check if in mobile mode
 */
function checkMobileMode() {
    const wasMobile = state.mobileMode;
    state.mobileMode = window.innerWidth < 991;

    if (wasMobile !== state.mobileMode) {
        const beanMain = document.querySelector(".bean-main");
        if (state.mobileMode && beanMain) {
            state.isBeanMini = true;
            beanMain.classList.add("bean-main-mini");
        }
    }

    // Always recalculate scroll threshold on resize
    state.scrollThreshold = Math.floor(window.innerWidth * 0.45 - 100);
}

/**
 * Smooth scroll to target position over specified duration
 * Supports both horizontal (left) and vertical (top) scrolling
 * Duration is treated as a maximum time limit. Shorter distances will scroll faster.
 * @param {HTMLElement} element - The element to scroll
 * @param {number} target - The target scroll position
 * @param {number} maxDuration - Maximum duration in milliseconds
 * @param {string} direction - Direction to scroll: 'left' or 'top' (default: 'left')
 */
function smoothScrollTo(element, target, maxDuration, direction = "left") {
    const scrollProp = direction === "top" ? "scrollTop" : "scrollLeft";
    const start = element[scrollProp];
    const change = target - start;

    // If change is negligible, finish immediately
    if (Math.abs(change) < 5) {
        element[scrollProp] = target;
        return Promise.resolve();
    }

    state.activeProgrammaticScrolls++;

    const startTime = performance.now();
    // Calculate duration: 2ms per pixel, capped at maxDuration
    // This ensures short distances are instant/fast, while long distances are smooth
    const duration = Math.min(maxDuration, Math.abs(change) * 2);

    return new Promise((resolve) => {
        function animateScroll(currentTime) {
            const elapsed = currentTime - startTime;
            if (elapsed < duration) {
                const t = elapsed / duration;
                // Ease in-out quadratic
                const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                element[scrollProp] = start + change * ease;
                requestAnimationFrame(animateScroll);
            } else {
                element[scrollProp] = target;
                state.activeProgrammaticScrolls--;
                resolve();
            }
        }
        requestAnimationFrame(animateScroll);
    });
}

function toggleComments(){
    const modal = document.querySelector(".modal");
    if (!modal) return;
    
    if (modal.classList.contains("show-comment")) {
        modal.classList.remove("show-comment");
        modal.classList.add("closing-comment");
    } else {
        modal.classList.remove("closing-comment");
        modal.classList.add("show-comment");
    }
}