document.addEventListener('DOMContentLoaded', function () {
  
  // 1. HOW IT WORKS - Track Tabs Toggle
  const tabs = document.querySelectorAll('.track-tab');
  const tracks = document.querySelectorAll('.how-track');

  if (tabs.length && tracks.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');

        // Hide all tracks
        tracks.forEach(track => track.classList.remove('active'));
        
        // Show correct track
        const targetTrackId = tab.getAttribute('data-track');
        const targetTrack = document.getElementById(targetTrackId);
        if (targetTrack) {
          targetTrack.classList.add('active');
        }
      });
    });
  }

  // 2. CLIENT-SIDE SEARCH & FILTER
  const searchInput = document.getElementById('search-input');
  const listingCards = document.querySelectorAll('.listing-card');
  const chips = document.querySelectorAll('.chip');

  function filterListings(query) {
    const cleanQuery = query.toLowerCase().trim();
    
    listingCards.forEach(card => {
      // Get text content to match
      const title = card.querySelector('h3').textContent.toLowerCase();
      const tag = card.querySelector('.listing-tag').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      
      const isMatch = title.includes(cleanQuery) || 
                      tag.includes(cleanQuery) || 
                      desc.includes(cleanQuery);
      
      if (isMatch) {
        card.style.display = 'flex';
        // Add a subtle fade-in animation
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });
  }

  // Handle Search Input Typing
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      filterListings(val);

      // Align active chips with the search text
      chips.forEach(chip => {
        if (chip.textContent.toLowerCase() === val.toLowerCase()) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    });
  }

  // Handle Category Chips Clicks
  if (chips.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const isActive = chip.classList.contains('active');
        
        // Clear all active classes
        chips.forEach(c => c.classList.remove('active'));

        if (isActive) {
          // If was already active, we reset search
          if (searchInput) searchInput.value = '';
          filterListings('');
        } else {
          // Make this chip active
          chip.classList.add('active');
          const categoryText = chip.textContent;
          if (searchInput) searchInput.value = categoryText;
          filterListings(categoryText);
        }
      });
    });
  }

  // 3. MOBILE MENU DRAWER TOGGLE
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const body = document.body;

  // Create backdrop element dynamically
  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-backdrop';
  document.body.appendChild(backdrop);

  function openMenu() {
    mobileMenu.classList.add('active');
    backdrop.classList.add('active');
    body.style.overflow = 'hidden'; // Disable page scrolling while open
  }

  function closeMenu() {
    mobileMenu.classList.remove('active');
    backdrop.classList.remove('active');
    body.style.overflow = '';
  }

  if (menuToggle && menuClose && mobileMenu) {
    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);

    // Close menu when clicking on any mobile links
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // 4. GLOBAL CURRENCY SELECTOR & CONVERTER
  const currencySelects = document.querySelectorAll('.currency-select');
  const priceDisplays = document.querySelectorAll('.price-display');

  // Exchange rates relative to 1 USD
  const exchangeRates = {
    USD: 1.0,
    INR: 83.50,
    EUR: 0.92,
    GBP: 0.78
  };

  const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£'
  };

  function updateCurrency(targetCurrency) {
    // Sync all dropdown selectors on the page
    currencySelects.forEach(select => {
      select.value = targetCurrency;
    });

    // Update all price tags with the calculated currency amount
    priceDisplays.forEach(display => {
      const baseCurrency = display.getAttribute('data-base-currency') || 'USD';
      const baseAmount = parseFloat(display.getAttribute('data-base-amount')) || 0;

      if (baseAmount > 0) {
        // Convert to USD standard base, then convert to target currency
        const amountInUSD = baseAmount / (exchangeRates[baseCurrency] || 1.0);
        const convertedAmount = amountInUSD * (exchangeRates[targetCurrency] || 1.0);
        const symbol = currencySymbols[targetCurrency] || '$';
        display.textContent = `${symbol}${convertedAmount.toFixed(2)}`;
      }
    });

    // Persist choice across page navigation
    localStorage.setItem('selectedCurrency', targetCurrency);
  }

  if (currencySelects.length) {
    currencySelects.forEach(select => {
      select.addEventListener('change', (e) => {
        updateCurrency(e.target.value);
      });
    });

    // Load saved preference or fallback to USD
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
    updateCurrency(savedCurrency);
  }
  
});
