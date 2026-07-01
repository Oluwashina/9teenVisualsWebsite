import './style.css';

const CATEGORIES = [
  { key: 'portrait', label: 'Portraits' },
  { key: 'event', label: 'Events' },
  { key: 'baby', label: 'Baby Pictures' },
];

const app = {
  routes: {
    home: renderHome,
    portraits: renderPortraits,
    events: renderEvents,
    babies: renderBabies,
    booking: renderBooking,
    admin: renderAdmin
  },

  state: {
    images: [],
    portfolioLoading: true,
    portfolioError: null,
    authenticated: sessionStorage.getItem('9teen_admin_auth') === 'true'
  },

  async init() {
    this.container = document.getElementById('app');
    this.navLinks = document.querySelector('.nav-links');
    this.menuToggle = document.getElementById('menu-toggle');

    this.bindEvents();
    this.container.innerHTML = '<div class="portfolio-loading"><span>Loading portfolio...</span></div>';

    await this.loadPortfolio();

    const initialRoute = window.location.pathname.replace('/', '') || 'home';
    this.renderRoute(initialRoute);
    this.initNavbarEffect();
  },

  async loadPortfolio() {
    this.state.portfolioLoading = true;
    this.state.portfolioError = null;
    try {
      this.state.images = await fetchPortfolio();
    } catch (err) {
      console.error('Failed to load portfolio:', err);
      this.state.portfolioError = err.message;
      this.state.images = [];
    } finally {
      this.state.portfolioLoading = false;
    }
  },

  bindEvents() {
    // Mobile menu toggle
    if (this.menuToggle) {
      this.menuToggle.addEventListener('click', () => {
        this.navLinks.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
        document.body.style.overflow = this.navLinks.classList.contains('active') ? 'hidden' : '';
      });
    }

    // Global click listener for dynamic elements and nav links
    document.body.addEventListener('click', (e) => {
      const routeAttr = e.target.closest('[data-route]');
      if (routeAttr) {
        e.preventDefault();
        const route = routeAttr.getAttribute('data-route');

        // Close mobile menu on navigate
        if (this.navLinks) {
          this.navLinks.classList.remove('active');
          this.menuToggle.classList.remove('active');
          document.body.style.overflow = '';
        }

        this.navigateTo(route);
      }
    });

    window.addEventListener('popstate', (e) => {
      const route = window.location.pathname.replace('/', '') || 'home';
      this.renderRoute(route);
    });
  },

  navigateTo(route) {
    const path = route === 'home' ? '/' : `/${route}`;
    history.pushState({ route }, '', path);
    this.renderRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderRoute(route) {
    const renderFunc = this.routes[route] || this.routes.home;
    this.container.innerHTML = ''; // Clear container
    renderFunc(this.container);
    this.updateActiveLink(route);
  },

  updateActiveLink(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-route') === route);
    });
  },

  initNavbarEffect() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      }
    });
  }
};
const PRICING_DATA = {
  portrait: [
    { name: 'Basic', price: '45,000', features: ['1 look/outfit', '1 backdrop', '4 edited soft copies'], popular: false },
    { name: 'Standard', price: '60,000', features: ['2-3 looks/outfit', '2 backdrops', '8 edited soft copies'], popular: false },
    { name: 'Premium', price: '150,000', features: ['5 looks/outfit', '20 edited soft copies'], popular: false },
  ],
  event: [
    { name: 'Pure Moments', price: '500,000', features: ['2 photographers', 'A medium size synthetic photobook', 'A medium size frame', 'High resolution image of the events'], popular: false },
    { name: 'Sweet Love', price: '700,000', features: ['2 photographers', 'A large size synthetic photobook', 'A big size frame','High resolution image of the events', 'Complimentary pre-wedding (3 outfits)'], popular: true },
    { name: 'Sweet Beginnings', price: '900,000', features: ['3 photographers', 'A very large size synthetic photobook', 'A large size frame', 'High resolution image of the events', 'Complimentary pre-wedding (4 outfits)'], popular: false },
  ],
  baby: [
    { name: 'Newborn Basic', price: '45,000', features: ['Mini session', '5 edited soft copies', 'Family posing included'], popular: false },
    { name: 'Essential Pack', price: '75,000', features: ['Full session', '12 edited soft copies', 'Custom theme'], popular: true },
    { name: 'Grow with Me', price: '150,000', features: ['3 sessions (Newborn, 6mo, 1yr)', '30 total copies', 'Photo album'], popular: false }
  ]
};

function renderPricingCards(category) {
  const packs = PRICING_DATA[category] || [];
  return `
    <div class="pricing-container container">
      <div class="section-header text-center" style="margin-top: var(--spacing-xl)">
        <span class="section-tagline">Packages</span>
        <h2>Investment & Plans</h2>
      </div>
      <div class="pricing-grid">
        ${packs.map(pkg => `
          <div class="pricing-card ${pkg.popular ? 'popular' : ''}">
            ${pkg.popular ? '<div class="popular-badge">Most Popular</div>' : ''}
            <div class="pricing-header">
              <h3>${pkg.name}</h3>
              <div class="price">
                <span class="currency">₦</span>
                <span class="amount">${pkg.price}</span>
              </div>
            </div>
            <ul class="pricing-features">
              ${pkg.features.map(f => `<li><span class="check">✓</span> ${f}</li>`).join('')}
            </ul>
            <button class="btn-primary select-pkg" data-route="booking" data-pkg="${pkg.name}">Select Package</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

window.app = app;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

async function fetchPortfolio() {
  const response = await fetch('/api/portfolio');
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(
      'Portfolio API is unavailable. Run npm run dev locally, or check Netlify env vars on your deployed site.'
    );
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to load portfolio');
  return data.images || [];
}

async function deletePortfolioImage(publicId) {
  const response = await fetch('/api/portfolio', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to delete image');
}

async function uploadToCloudinary(file, category) {
  const dataUrl = await readFileAsDataUrl(file);

  const response = await fetch('/api/portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, file: dataUrl }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.image;
}

function renderAdminStats(images) {
  const counts = CATEGORIES.map((cat) => ({
    ...cat,
    count: images.filter((img) => img.category === cat.key).length,
  }));

  return `
    <div class="admin-stats">
      ${counts.map((cat) => `
        <div class="admin-stat-pill">
          <span class="admin-stat-label">${cat.label}</span>
          <span class="admin-stat-value">${cat.count}</span>
        </div>
      `).join('')}
      <div class="admin-stat-pill admin-stat-total">
        <span class="admin-stat-label">Total</span>
        <span class="admin-stat-value">${images.length}</span>
      </div>
    </div>
  `;
}

function renderAdminCategorySection(categoryKey, label, images) {
  const items = images.filter((img) => img.category === categoryKey);

  return `
    <section class="admin-category-section">
      <div class="admin-category-header">
        <h3>${label}</h3>
        <span class="admin-category-count">${items.length} image${items.length !== 1 ? 's' : ''}</span>
      </div>
      ${items.length === 0 ? `
        <p class="admin-empty-category">No ${label.toLowerCase()} uploaded yet.</p>
      ` : `
        <div class="admin-assets-list">
          ${items.map((img) => `
            <div class="admin-asset-item">
              <img src="${img.url}" alt="${label}">
              <div class="asset-info">
                <button class="btn-delete" data-public-id="${img.publicId}">Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </section>
  `;
}

function bindAdminEvents(container) {
  const dropZone = container.querySelector('#admin-drop-zone');
  const fileInput = container.querySelector('#admin-file-input');
  const categorySelect = container.querySelector('#upload-category');
  const statusDiv = container.querySelector('#upload-status');
  const refreshBtn = container.querySelector('#refresh-portfolio-btn');

  dropZone.onclick = () => fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    statusDiv.textContent = 'Uploading to Cloudinary...';
    statusDiv.style.color = 'var(--text-muted)';

    try {
      await uploadToCloudinary(file, categorySelect.value);
      await app.loadPortfolio();
      renderAdmin(container);

      const status = container.querySelector('#upload-status');
      if (status) {
        status.textContent = `Success! Image added to ${categorySelect.value} gallery.`;
        status.style.color = '#44ff44';
      }
      fileInput.value = '';
    } catch (err) {
      statusDiv.textContent = 'Upload failed: ' + err.message;
      statusDiv.style.color = '#ff4444';
    }

    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.style.color = 'var(--text-muted)';
    }, 5000);
  };

  container.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.onclick = async () => {
      const publicId = btn.getAttribute('data-public-id');
      if (!publicId || !confirm('Remove this image from Cloudinary and the live site?')) return;

      btn.textContent = 'Removing...';
      btn.disabled = true;

      try {
        await deletePortfolioImage(publicId);
        await app.loadPortfolio();
        renderAdmin(container);
      } catch (err) {
        btn.textContent = 'Remove';
        btn.disabled = false;
        alert('Delete failed: ' + err.message);
      }
    };
  });

  if (refreshBtn) {
    refreshBtn.onclick = async () => {
      refreshBtn.textContent = 'Refreshing...';
      refreshBtn.disabled = true;
      await app.loadPortfolio();
      renderAdmin(container);
    };
  }

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      app.state.authenticated = false;
      sessionStorage.removeItem('9teen_admin_auth');
      renderAdmin(container);
    };
  }
}

function renderHome(container) {
  // Use a mix of portraits and events for the hero and preview
  const portraits = app.state.images.filter(img => img.category === 'portrait');
  const events = app.state.images.filter(img => img.category === 'event');

  container.innerHTML = `
    <section class="hero">
      <div class="hero-slider" id="hero-slider">
        <div class="slide active" style="background-image: url('${portraits[0]?.url || '/hero_bg.png'}')"></div>
        <div class="slide" style="background-image: url('${portraits[1]?.url || '/portrait_2.png'}')"></div>
        <div class="slide" style="background-image: url('${events[0]?.url || '/event_2.png'}')"></div>
      </div>
      <div class="hero-overlay"></div>
      <div class="container heroContent">
        <h1 class="reveal-text">Elevating <br> <span class="text-accent">Visual Perspective</span></h1>
        <p class="reveal-text-sub">Bespoke photography for discerning clients and high-end brands.</p>
        <div class="hero-btns">
          <button class="btn-primary" data-route="booking">Inquire Now</button>
          <button class="btn-outline" data-route="portraits">Explore Gallery</button>
        </div>
      </div>
      <div class="scroll-indicator">
        <span>SCROLL</span>
        <div class="line"></div>
      </div>
    </section>

    <section class="about-section container">
      <div class="about-grid">
        <div class="about-text">
          <span class="section-tagline">Our Vision</span>
          <h2 class="text-accent">The Art of the Moment</h2>
          <p>
            At 9teen visuals, we don't just take pictures; we craft visual legacies. Our approach blends technical precision with a cinematic eye, ensuring every frame resonates with emotion and sophistication.
          </p>
          <p>
            From high-profile events to intimate studio sessions, we bring an uncompromising standard of excellence to every project.
          </p>
          <button class="btn-text" data-route="portraits">Learn About Our Process →</button>
        </div>
        <div class="about-image">
          <div class="image-wrapper">
            <img src="${portraits[2]?.url || '/portrait_3.png'}" alt="Behind the lens">
          </div>
        </div>
      </div>
    </section>

    <section class="services-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-tagline">Excellence in Everything</span>
          <h2>Bespoke Services</h2>
        </div>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">✦</div>
            <h3>Baby Pictures</h3>
            <p>Capturing the earliest, most precious moments of your little one with tenderness and care.</p>
            <ul class="service-features">
              <li>Newborn Sessions</li>
              <li>Milestone Portraits</li>
              <li>Candid Family Moments</li>
            </ul>
          </div>
          <div class="service-card active">
            <div class="service-icon">✦</div>
            <h3>Portraits</h3>
            <p>Cinematic character studies and corporate portraits that capture the essence of the individual.</p>
            <ul class="service-features">
              <li>Studio & Location</li>
              <li>Creative Direction</li>
              <li>Artistic Retouching</li>
            </ul>
          </div>
          <div class="service-card">
            <div class="service-icon">✦</div>
            <h3>Events</h3>
            <p>Comprehensive coverage for high-stakes corporate gallas, launches, and private celebrations.</p>
            <ul class="service-features">
              <li>Full Event Narrative</li>
              <li>Rapid Delivery</li>
              <li>Discreet Presence</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="preview-section container">
      <div class="preview-header">
        <div>
          <span class="section-tagline">Portfolios</span>
          <h2 class="text-accent">Portraits</h2>
          <p style="color: var(--text-muted)">Elegance and character, captured in every frame.</p>
        </div>
        <button class="btn-outline" data-route="portraits" style="margin-top: 20px; margin-bottom: 20px">Full Gallery</button>
      </div>
      <div class="gallery-grid">
        ${portraits.slice(0, 3).map((img, i) => `
          <div class="gallery-item">
            <img src="${img.url}" alt="Portrait">
            <div class="gallery-overlay"><h3>${['Fine Art', 'Editorial', 'Cinema'][i] || 'Portrait'}</h3></div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <h2>Ready to create <br> your visual legacy?</h2>
        <p>Currently accepting bookings for Q2 2026.</p>
        <button class="btn-primary" data-route="booking">Secure Your Date</button>
      </div>
    </section>
  `;

  // Slider logic
  let currentSlide = 0;
  const slides = container.querySelectorAll('.slide');
  if (slides.length > 1) {
    const sliderInterval = setInterval(() => {
      if (!document.contains(container)) {
        clearInterval(sliderInterval);
        return;
      }
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }
}

function renderPortraits(container) {
  const portraits = app.state.images.filter(img => img.category === 'portrait');
  container.innerHTML = `
    <section class="section container gallery-page">
      <div class="gallery-page-header">
        <span class="section-tagline">The Gallery</span>
        <h1>Portraits</h1>
        <p>A collection of character studies and cinematic moments.</p>
      </div>
      <div class="gallery-grid">
        ${portraits.map(img => `
          <div class="gallery-item"><img src="${img.url}" alt="Portrait"></div>
        `).join('')}
      </div>
      ${renderPricingCards('portrait')}
    </section>
  `;
}

function renderBabies(container) {
  const babies = app.state.images.filter(img => img.category === 'baby');
  container.innerHTML = `
    <section class="section container gallery-page">
      <div class="gallery-page-header">
        <span class="section-tagline">The Gallery</span>
        <h1>Baby Pictures</h1>
        <p>Precious beginnings and heartfelt stories, captured forever.</p>
      </div>
      <div class="gallery-grid">
        ${babies.length > 0 ? babies.map(img => `
          <div class="gallery-item"><img src="${img.url}" alt="Baby Picture"></div>
        `).join('') : '<p style="grid-column: 1/-1; text-align: center; opacity: 0.5;">No baby pictures in the gallery yet. Check back soon!</p>'}
      </div>
      ${renderPricingCards('baby')}
    </section>
  `;
}

function renderEvents(container) {
  const events = app.state.images.filter(img => img.category === 'event');
  container.innerHTML = `
    <section class="section container gallery-page">
      <div class="gallery-page-header">
        <span class="section-tagline">The Gallery</span>
        <h1>Events</h1>
        <p>Capturing the energy and atmosphere of world-class occasions.</p>
      </div>
      <div class="gallery-grid">
        ${events.map(img => `
          <div class="gallery-item"><img src="${img.url}" alt="Event"></div>
        `).join('')}
      </div>
      ${renderPricingCards('event')}
    </section>
  `;
}

function renderBooking(container) {
  container.innerHTML = `
    <section class="section container booking-page">
      <div class="booking-grid">
        <div class="booking-info">
          <span class="section-tagline">Inquire</span>
          <h1>Let's Create Together</h1>
          <p>Please provide some details about your project, and we will get back to you within 24 hours.</p>
          <div class="contact-details">
            <div class="contact-item">
              <strong>Email</strong>
              <span>9teenvisuals25@gmail.com</span>
            </div>
          </div>
        </div>
        <div class="booking-form-wrapper">
          <form class="booking-form" id="booking-form">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="booking-name" required placeholder="John Doe">
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="booking-email" required placeholder="john@example.com">
              </div>
            </div>
            <div class="form-group">
              <label>Service Type</label>
              <select id="booking-service">
                <option>Portrait Photography</option>
                <option>Event Photography</option>
                <option>Baby Pictures</option>
              </select>
            </div>
            <div class="form-group">
              <label>Project Details</label>
              <textarea id="booking-details" placeholder="Tell us about your vision..." rows="4"></textarea>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%">Send Inquiry</button>
          </form>
        </div>
      </div>
    </section>
  `;

  const form = container.querySelector('#booking-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = container.querySelector('#booking-name') ? container.querySelector('#booking-name').value : '';
      const email = container.querySelector('#booking-email') ? container.querySelector('#booking-email').value : '';
      const service = container.querySelector('#booking-service') ? container.querySelector('#booking-service').value : '';
      const details = container.querySelector('#booking-details') ? container.querySelector('#booking-details').value : '';

      const message = `Hello 9teen Visuals! My name is ${name}.%0A%0AI'm interested in: ${service}%0A%0AProject Details: ${details}%0A%0AMy Email: ${email}`;
      const whatsappUrl = `https://wa.me/2349068623153?text=${message}`;

      window.open(whatsappUrl, '_blank');
    });
  }
}

function renderAdmin(container) {
  if (!app.state.authenticated) {
    container.innerHTML = `
      <section class="section container gallery-page">
        <div class="gallery-page-header text-center" style="margin: 4rem auto">
          <span class="section-tagline">Secure Access</span>
          <h1>Admin Login</h1>
          <p>Please enter your credentials to manage visual assets.</p>
        </div>
        <div class="admin-login-card" style="max-width: 400px; margin: 0 auto; background: var(--glass-bg); padding: 2rem; border: 1px solid var(--glass-border); border-radius: 8px;">
          <form id="admin-login-form" class="booking-form">
            <div class="form-group">
              <label>Username</label>
              <input type="text" id="admin-user" placeholder="Enter your username" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="admin-pass" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%">Enter Dashboard</button>
            <div id="login-error" style="color: #ff4444; font-size: 0.8rem; margin-top: 1rem; text-align: center; display: none;">Invalid credentials.</div>
          </form>
        </div>
      </section>
    `;

    const form = container.querySelector('#admin-login-form');
    const errorDiv = container.querySelector('#login-error');

    form.onsubmit = (e) => {
      e.preventDefault();
      const user = container.querySelector('#admin-user').value;
      const pass = container.querySelector('#admin-pass').value;

      if (user === 'ayomide25' && pass === 'Iyanuoluwa25') {
        app.state.authenticated = true;
        sessionStorage.setItem('9teen_admin_auth', 'true');
        renderAdmin(container);
      } else {
        errorDiv.style.display = 'block';
      }
    };
    return;
  }

  if (app.state.portfolioLoading) {
    container.innerHTML = '<div class="portfolio-loading"><span>Loading portfolio from Cloudinary...</span></div>';
    app.loadPortfolio().then(() => renderAdmin(container));
    return;
  }

  const images = app.state.images;

  container.innerHTML = `
    <section class="section container gallery-page admin-page">
      <div class="gallery-page-header">
        <div class="flex-between">
          <div>
            <span class="section-tagline">Internal Use Only</span>
            <h1>Portfolio Manager</h1>
          </div>
          <div class="admin-header-actions">
            <button class="btn-outline" id="refresh-portfolio-btn" style="font-size: 0.7rem; padding: 0.5rem 1rem;">Refresh</button>
            <button class="btn-outline logout-btn" id="logout-btn" style="font-size: 0.7rem; padding: 0.5rem 1rem;">Logout</button>
          </div>
        </div>
        <p>Manage your Cloudinary portfolio. Uploads and removals sync instantly to the live site.</p>
        ${app.state.portfolioError ? `<p class="admin-error-banner">Could not load portfolio: ${app.state.portfolioError}</p>` : ''}
      </div>

      ${renderAdminStats(images)}

      <div class="admin-upload-panel">
        <h3>Upload New Image</h3>
        <form id="admin-upload-form" class="booking-form admin-upload-form">
          <div class="form-group">
            <label>Category</label>
            <select id="upload-category">
              ${CATEGORIES.map((cat) => `<option value="${cat.key}">${cat.label}</option>`).join('')}
            </select>
          </div>
          <div class="upload-area" id="admin-drop-zone">
            <div class="upload-icon">↑</div>
            <p>Click to upload image</p>
            <span class="upload-hint">JPEG, PNG, or WebP · max 10MB on free plan</span>
            <input type="file" id="admin-file-input" accept="image/*" style="display: none;">
          </div>
          <div id="upload-status" class="upload-status"></div>
        </form>
      </div>

      <div class="admin-categories">
        ${CATEGORIES.map((cat) => renderAdminCategorySection(cat.key, cat.label, images)).join('')}
      </div>
    </section>
  `;

  bindAdminEvents(container);
}

document.addEventListener('DOMContentLoaded', () => app.init());
