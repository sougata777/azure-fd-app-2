/**
 * HFG-N Premium E-Commerce JS Handler
 * Theme toggling, Shopping Cart, Filtering, and Modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCart();
    initCatalogFilters();
    initQuickViewModal();
});

/* ==========================================================================
   Theme Management
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('hfgn_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }

    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('hfgn_theme', 'light');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            document.body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('hfgn_theme', 'dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    });
}

/* ==========================================================================
   Shopping Cart (Local Storage Sync)
   ========================================================================== */
let cart = [];

function initCart() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartClose = document.getElementById('cart-close');
    const cartBackdrop = document.getElementById('cart-backdrop');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Load cart from Local Storage
    try {
        const storedCart = localStorage.getItem('hfgn_cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    } catch (e) {
        console.error("Failed to parse cart localstorage", e);
        cart = [];
    }

    // Toggle Drawer Open/Close
    if (cartToggle && cartDrawer) {
        cartToggle.addEventListener('click', () => {
            cartDrawer.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock background scrolling
        });
    }

    const closeCartFn = () => {
        if (cartDrawer) {
            cartDrawer.classList.remove('active');
            document.body.style.overflow = ''; // Unlock scrolling
        }
    };

    if (cartClose) cartClose.addEventListener('click', closeCartFn);
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartFn);

    // Initial render
    renderCart();

    // Event Delegation: Add to Cart Buttons
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn) {
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const image = btn.dataset.image;
            
            addToCart(id, name, price, image);
        }
    });

    // Event Delegation: Cart drawer actions (qty change, delete)
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        cartContainer.addEventListener('click', (e) => {
            const qtyBtn = e.target.closest('.qty-btn');
            if (qtyBtn) {
                const id = parseInt(qtyBtn.dataset.id);
                const change = parseInt(qtyBtn.dataset.change);
                updateCartQuantity(id, change);
                return;
            }

            const removeBtn = e.target.closest('.remove-item-btn');
            if (removeBtn) {
                const id = parseInt(removeBtn.dataset.id);
                removeFromCart(id);
            }
        });
    }

    // Checkout Action Sim
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast("Your cart is empty.");
                return;
            }
            showToast("Thank you for your order! Simulated checkout successful.");
            cart = [];
            saveCart();
            closeCartFn();
        });
    }
}

function saveCart() {
    localStorage.setItem('hfgn_cart', JSON.stringify(cart));
    renderCart();
}

function addToCart(id, name, price, image) {
    const existingIndex = cart.findIndex(item => item.id === id);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ id, name, price, image, qty: 1 });
    }
    saveCart();
    showToast(`Added ${name} to cart.`);
}

function updateCartQuantity(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].qty += change;
        if (cart[itemIndex].qty <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    showToast("Item removed from cart.");
}

function renderCart() {
    const badge = document.getElementById('cart-badge');
    const container = document.getElementById('cart-items-container');
    const subtotalText = document.getElementById('cart-subtotal');

    if (!badge || !container) return;

    // Total Qty badge
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.innerText = totalQty;
    badge.style.display = totalQty > 0 ? 'flex' : 'none';

    // Render items list
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-cart-icon">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Your cart is empty.</p>
                <a href="/Home/Products" class="btn btn-primary btn-sm">Browse Products</a>
            </div>
        `;
        if (subtotalText) subtotalText.innerText = "$0.00";
        return;
    }

    let subtotal = 0;
    let htmlContent = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        htmlContent += `
            <div class="cart-item">
                <img class="cart-item-image" src="${item.image}" alt="${item.name}" />
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-qty">
                        <span class="qty-btn" data-id="${item.id}" data-change="-1">-</span>
                        <span class="qty-val">${item.qty}</span>
                        <span class="qty-btn" data-id="${item.id}" data-change="1">+</span>
                    </div>
                </div>
                <button class="remove-item-btn" data-id="${item.id}" aria-label="Remove item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
    if (subtotalText) {
        subtotalText.innerText = `$${subtotal.toFixed(2)}`;
    }
}

/* ==========================================================================
   Catalog Search & Filtering (Products Page)
   ========================================================================== */
function initCatalogFilters() {
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const noResultsClearBtn = document.getElementById('no-results-clear-btn');
    const filterSummary = document.getElementById('filter-summary');
    const currentCategoryLabel = document.getElementById('current-filter-category');
    const currentSearchLabel = document.getElementById('current-filter-search');
    const catalogGrid = document.getElementById('catalog-grid');
    const noResults = document.getElementById('no-results');

    if (!catalogGrid) return; // Not on the products page

    const productCards = catalogGrid.querySelectorAll('.product-card');
    let activeCategory = 'all';
    let activeSearchQuery = '';

    function applyFilters() {
        let visibleCount = 0;

        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardName = card.dataset.name.toLowerCase();

            const matchesCategory = (activeCategory === 'all' || cardCategory.toLowerCase() === activeCategory.toLowerCase());
            const matchesSearch = cardName.includes(activeSearchQuery.toLowerCase());

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Toggle No Results View
        if (visibleCount === 0) {
            catalogGrid.style.display = 'none';
            noResults.style.display = 'block';
        } else {
            catalogGrid.style.display = 'grid';
            noResults.style.display = 'none';
        }

        // Update Filter Summary Bar
        if (activeCategory !== 'all' || activeSearchQuery !== '') {
            filterSummary.style.display = 'flex';
            currentCategoryLabel.innerText = activeCategory.toUpperCase();
            currentSearchLabel.innerText = activeSearchQuery || 'None';
        } else {
            filterSummary.style.display = 'none';
        }
    }

    // Category button clicks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.category;
            applyFilters();
        });
    });

    // Real-time search inputs
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeSearchQuery = e.target.value.trim();
            applyFilters();
        });
    }

    // Clear filters helpers
    const clearAllFilters = () => {
        activeCategory = 'all';
        activeSearchQuery = '';
        if (searchInput) searchInput.value = '';
        
        filterButtons.forEach(b => b.classList.remove('active'));
        const allBtn = document.querySelector('.filter-btn[data-category="all"]');
        if (allBtn) allBtn.classList.add('active');

        applyFilters();
    };

    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);
    if (noResultsClearBtn) noResultsClearBtn.addEventListener('click', clearAllFilters);
}

/* ==========================================================================
   Product Details Quick View Modal
   ========================================================================== */
function initQuickViewModal() {
    const modal = document.getElementById('quickview-modal');
    const closeBtn = document.getElementById('modal-close');
    const backdrop = document.getElementById('modal-backdrop');

    if (!modal) return;

    // Show details
    document.body.addEventListener('click', (e) => {
        const trigger = e.target.closest('.quick-view-overlay-btn');
        if (trigger) {
            const data = trigger.dataset;
            
            // Populate modal contents
            document.getElementById('modal-product-image').src = data.image;
            document.getElementById('modal-product-image').alt = data.name;
            document.getElementById('modal-product-category').innerText = data.category;
            document.getElementById('modal-product-name').innerText = data.name;
            document.getElementById('modal-product-price').innerText = `$${data.price}`;
            document.getElementById('modal-product-desc').innerText = data.longDesc;
            document.getElementById('modal-rating-value').innerText = data.rating;
            
            // Build rating stars
            const starsContainer = document.getElementById('modal-rating-stars');
            const ratingScore = Math.floor(parseFloat(data.rating));
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += `<span class="star ${i <= ratingScore ? 'filled' : ''}">&#9733;</span>`;
            }
            starsContainer.innerHTML = starsHtml;

            // Build specifications list
            const specsContainer = document.getElementById('modal-product-specs');
            const specsArr = data.specs.split('|');
            specsContainer.innerHTML = specsArr.map(spec => `<li>${spec}</li>`).join('');

            // Bind checkout/add-to-cart button datasets
            const modalAddBtn = document.getElementById('modal-add-to-cart-btn');
            modalAddBtn.dataset.id = data.id;
            modalAddBtn.dataset.name = data.name;
            modalAddBtn.dataset.price = data.price;
            modalAddBtn.dataset.image = data.image;

            // Trigger Modal Open
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    const closeModalFn = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModalFn);
    if (backdrop) backdrop.addEventListener('click', closeModalFn);
    
    // Support ESC key close
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModalFn();
        }
    });

    // Close modal if Add to Cart clicked inside modal
    const modalAddBtn = document.getElementById('modal-add-to-cart-btn');
    if (modalAddBtn) {
        modalAddBtn.addEventListener('click', () => {
            closeModalFn();
        });
    }
}

/* ==========================================================================
   Toast Notifications
   ========================================================================== */
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;

    container.appendChild(toast);

    // Auto fadeout after 2.5 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        // Remove from DOM when animation completes
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 2500);
}

// Make globally accessible for custom elements/forms
window.showToast = showToast;
