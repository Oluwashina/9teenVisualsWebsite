import './style.css';
import { portfolioAssets } from './assets.js';

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
    images: JSON.parse(localStorage.getItem('photography_portfolio_images')) || portfolioAssets
  },

  init() {
    this.container = document.getElementById('app');
    this.navLinks = document.querySelector('.nav-links');
    this.menuToggle = document.getElementById('menu-toggle');

    this.bindEvents();

    // Clean URL routing on init
    const initialRoute = window.location.pathname.replace('/', '') || 'home';
    this.renderRoute(initialRoute);

    this.initNavbarEffect();
  },

  saveState() {
    localStorage.setItem('photography_portfolio_images', JSON.stringify(this.state.images));
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
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
};

window.app = app;

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
          <h2 class="text-accent">Portraiture</h2>
          <p style="color: var(--text-muted)">Elegance and character, captured in every frame.</p>
        </div>
        <button class="btn-outline" data-route="portraits">Full Gallery</button>
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
      <div class="text-center" style="margin-top: var(--spacing-lg)">
        <button class="btn-primary" data-route="booking">Book Portrait Session</button>
      </div>
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
      <div class="text-center" style="margin-top: var(--spacing-lg)">
        <button class="btn-primary" data-route="booking">Book a Baby Session</button>
      </div>
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
      <div class="text-center" style="margin-top: var(--spacing-lg)">
        <button class="btn-primary" data-route="booking">Inquire for Event Coverage</button>
      </div>
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
  container.innerHTML = `
    <section class="section container gallery-page admin-page">
      <div class="gallery-page-header">
        <span class="section-tagline">Internal Use Only</span>
        <h1>Portfolio Manager</h1>
        <p>Update your public galleries and manage visual assets.</p>
      </div>

      <div class="admin-grid">
        <div class="admin-form-card">
          <h3>Add New Image</h3>
          <form id="admin-upload-form" class="booking-form">
            <div class="form-group">
              <label>Category</label>
              <select id="upload-category">
                <option value="portrait">Portrait</option>
                <option value="event">Event</option>
                <option value="baby">Baby Picture</option>
              </select>
            </div>
            <div class="upload-area" id="admin-drop-zone">
              <div class="upload-icon">↑</div>
              <p>Click to upload image</p>
              <input type="file" id="admin-file-input" accept="image/*" style="display: none;">
            </div>
            <div id="upload-status" style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);"></div>
          </form>
          
          <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
            <h4 style="font-size: 0.8rem; letter-spacing: 0.1em; color: var(--primary-color);">PORTFOLIO SYNC</h4>
            <p style="font-size: 0.7rem; color: var(--text-muted); margin: 0.5rem 0;">Click below to save all changes permanently to assets.js.</p>
            <button class="btn-primary" id="auto-sync-btn" style="font-size: 0.7rem; padding: 0.6rem 1.2rem; width: 100%;">Save to Assets.js</button>
            <textarea id="sync-output" readonly style="display:none; width: 100%; margin-top: 1rem; background: #111; color: #fff; font-family: monospace; font-size: 0.6rem; padding: 0.5rem; border: 1px solid var(--glass-border);"></textarea>
          </div>
        </div>

        <div class="admin-assets-card">
          <div class="flex-between">
            <h3>Current Assets</h3>
            <span id="asset-count" class="asset-category"></span>
          </div>
          <div class="admin-assets-list" id="admin-assets-list">
            <!-- Asset items will be rendered here -->
          </div>
        </div>
      </div>
    </section>
  `;

  const dropZone = container.querySelector('#admin-drop-zone');
  const fileInput = container.querySelector('#admin-file-input');
  const categorySelect = container.querySelector('#upload-category');
  const statusDiv = container.querySelector('#upload-status');
  const assetsList = container.querySelector('#admin-assets-list');

  const assetCount = container.querySelector('#asset-count');

  const updateAssetsList = () => {
    assetCount.textContent = `${app.state.images.length} TOTAL ASSETS`;
    assetsList.innerHTML = app.state.images.map(img => `
      <div class="admin-asset-item">
        <img src="${img.url}" alt="Preview">
        <div class="asset-info">
          <span class="asset-category">${img.category}</span>
          <button class="btn-delete" data-id="${img.id}">Remove</button>
        </div>
      </div>
    `).join('');
  };

  updateAssetsList();

  dropZone.onclick = () => fileInput.click();

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    statusDiv.textContent = 'Uploading...';

    const reader = new FileReader();
    reader.onload = (event) => {
      const newImage = {
        id: Date.now().toString(),
        url: event.target.result,
        category: categorySelect.value
      };

      app.state.images.push(newImage);
      app.saveState();
      updateAssetsList();
      statusDiv.textContent = 'Success! Image added to ' + newImage.category + ' gallery.';

      setTimeout(() => { statusDiv.textContent = ''; }, 3000);
    };
    reader.readAsDataURL(file);
  };

  // Automatic Sync to Disk
  const syncBtn = container.querySelector('#auto-sync-btn');
  const syncOutput = container.querySelector('#sync-output');

  if (syncBtn) {
    syncBtn.onclick = async () => {
      syncBtn.textContent = 'Syncing...';
      try {
        // Try to hit the local sync server
        const response = await fetch('http://localhost:3001/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(app.state.images)
        });

        const result = await response.json();
        if (result.success) {
          syncBtn.textContent = '✅ Portfolio Saved Successfully';
          syncBtn.style.background = '#44ff44';
          syncBtn.style.color = '#000';
          setTimeout(() => {
            syncBtn.textContent = 'Save to Assets.js';
            syncBtn.style.background = '';
            syncBtn.style.color = '';
          }, 3000);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.warn('Auto-sync server offline. Falling back to manual code generation.');
        syncBtn.textContent = '⚠️ Server Offline - Manual Sync Ready';
        syncOutput.style.display = 'block';
        syncOutput.value = `export const portfolioAssets = ${JSON.stringify(app.state.images, null, 2)};`;
      }
    };
  }

  assetsList.onclick = (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.getAttribute('data-id');
      app.state.images = app.state.images.filter(img => img.id !== id);
      app.saveState();
      updateAssetsList();
    }
  };
}

document.addEventListener('DOMContentLoaded', () => app.init());
