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
      
      // Stop clicks on the dropdown from bubbling up and triggering mobile menu close listeners
      select.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    // Load saved preference or fallback to USD
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
    updateCurrency(savedCurrency);
  }

  // 5. REAL-TIME LIVE INBOX POLLING (NO REFRESH CHAT)
  const isLoggedIn = document.querySelector('a[href="/inbox/"]') !== null;

  if (isLoggedIn) {
    const isInboxPage = window.location.pathname === '/inbox/';
    const pollInterval = isInboxPage ? 4000 : 10000; // Poll faster on the inbox page

    let lastMessagesCount = null;
    let lastLatestMessageId = null;

    function pollInbox() {
      const url = `/inbox/api/?mark_read=${isInboxPage ? 'true' : 'false'}`;
      
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('Not authenticated');
          return res.json();
        })
        .then(data => {
          // 1. Update unread notification badges in header & mobile drawer
          updateNavBadges(data.unread_count);

          // 2. If on inbox page, dynamically update the messages list
          if (isInboxPage) {
            const currentCount = data.messages.length;
            const currentLatestId = currentCount > 0 ? data.messages[0].id : 0;

            // Check if we received new messages
            if (lastMessagesCount !== null && (currentCount !== lastMessagesCount || currentLatestId !== lastLatestMessageId)) {
              rebuildInboxDOM(data.messages);
            }

            // Save state for next poll comparison
            lastMessagesCount = currentCount;
            lastLatestMessageId = currentLatestId;
          }
        })
        .catch(err => {
          console.log('Inbox polling suspended:', err.message);
        });
    }

    function updateNavBadges(count) {
      // Find all unread-badge containers
      const inboxLinks = [
        document.querySelector('.desktop-only a[href="/inbox/"]'),
        document.querySelector('.mobile-drawer-links a[href="/inbox/"]')
      ];

      inboxLinks.forEach(link => {
        if (!link) return;
        let badge = link.querySelector('.unread-badge');

        if (count > 0) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'unread-badge';
            badge.style.cssText = "background: var(--red); color: var(--white); border-radius: 50%; padding: 2px 7px; font-size: 10px; font-weight: bold; font-family: 'IBM Plex Mono', monospace; line-height: 1;";
            if (link.classList.contains('mobile-link')) {
              link.appendChild(badge);
            } else {
              badge.style.marginLeft = "6px";
              link.appendChild(badge);
            }
          }
          badge.textContent = count;
        } else {
          if (badge) badge.remove();
        }
      });
    }

    function rebuildInboxDOM(messages) {
      const inboxList = document.querySelector('.inbox-list');
      if (!inboxList) return;

      const headerHTML = `
        <div class="inbox-header">
          <h2>Conversations Inbox</h2>
          <span class="mono" style="font-size: 12px; background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 12px;">
            ${messages.length} message${messages.length !== 1 ? 's' : ''} received
          </span>
        </div>
      `;

      if (messages.length === 0) {
        inboxList.innerHTML = headerHTML + `
          <div class="empty-state">
            <p style="font-size: 16px; margin-bottom: 12px;">Your inbox is empty.</p>
            <p style="font-size: 13.5px; color: #7C93A1;">When other users message you about your listed projects, their inquiries will appear here.</p>
          </div>
        `;
        return;
      }

      let itemsHTML = '';
      messages.forEach(msg => {
        itemsHTML += `
          <div class="inbox-item">
            <div class="inbox-item-meta">
              <div class="dev-tag">
                <span class="dev-avatar mono" style="background-color: var(--brass-dark);">${msg.sender.charAt(0)}</span>
                <span>From <strong>${msg.sender}</strong></span>
              </div>
              <span class="mono">${msg.created_at}</span>
            </div>
            
            <div class="inbox-item-title">
              Regarding: <a href="/listing/${msg.listing_pk}/" class="form-footer-link" style="font-weight: bold;">${msg.listing_title}</a>
            </div>

            <div class="inbox-item-message">
              ${msg.message.replace(/\n/g, '<br>')}
            </div>
          </div>
        `;
      });

      inboxList.innerHTML = headerHTML + itemsHTML;
    }

    // Run initial poll and start interval
    pollInbox();
    setInterval(pollInbox, pollInterval);
  }
  
});
