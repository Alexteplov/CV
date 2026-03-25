/**
 * Profile CV - Optimized JavaScript
 * Modern vanilla JS replacement for jQuery dependencies
 */

(function() {
  'use strict';

  // Utility: Debounce function for performance
  function debounce(func, wait = 100) {
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

  // Utility: Throttle function
  function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Check if element exists
  const exists = (selector) => document.querySelector(selector) !== null;

  // Full height sections (for non-mobile)
  const fullHeight = function() {
    if (window.innerWidth > 768) {
      const elements = document.querySelectorAll('.js-fullheight');
      const setHeight = () => {
        const winHeight = window.innerHeight;
        elements.forEach(el => {
          el.style.height = winHeight + 'px';
        });
      };
      setHeight();
      window.addEventListener('resize', debounce(setHeight, 100));
    }
  };

  // Intersection Observer for scroll animations
  const initScrollAnimations = function() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers - show everything
      document.querySelectorAll('.animate-box').forEach(el => {
        el.style.opacity = '1';
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -15% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const effect = el.dataset.animateEffect || 'fadeInUp';

          // Stagger animation
          setTimeout(() => {
            el.style.opacity = '1';

            // Add animation class
            const animations = {
              'fadeIn': 'fadeIn',
              'fadeInLeft': 'fadeInLeft',
              'fadeInRight': 'fadeInRight',
              'fadeInUp': 'fadeInUp'
            };

            const animClass = animations[effect] || 'fadeInUp';
            el.classList.add(animClass, 'animated-fast');
            el.classList.remove('item-animate');
          }, index * 100);

          observer.unobserve(el);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-box.item-animate').forEach(el => {
      observer.observe(el);
    });
  };

  // Skill charts animation with IntersectionObserver
  const initSkillCharts = function() {
    const skillsSection = document.getElementById('fh5co-skills');
    if (!skillsSection) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback
      initCharts();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(initCharts, 400);
          skillsSection.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(skillsSection);
  };

  // Initialize Easy Pie Charts
  const initCharts = function() {
    const charts = document.querySelectorAll('.chart');
    if (charts.length === 0) return;

    // Simple circle animation using canvas
    charts.forEach(chart => {
      const percent = parseInt(chart.dataset.percent) || 0;
      const size = 160;
      const lineWidth = 4;

      // Create canvas if doesn't exist
      let canvas = chart.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        chart.appendChild(canvas);
      }

      const ctx = canvas.getContext('2d');
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = (size - lineWidth * 2) / 2;

      // Animate
      let currentPercent = 0;
      const increment = percent / 50;
      const animate = () => {
        currentPercent += increment;
        if (currentPercent > percent) currentPercent = percent;

        // Clear
        ctx.clearRect(0, 0, size, size);

        // Background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#f5f5f5';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'butt';
        ctx.stroke();

        // Foreground arc
        const angle = (currentPercent / 100) * 2 * Math.PI - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, angle);
        ctx.strokeStyle = '#FF9000';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'butt';
        ctx.stroke();

        if (currentPercent < percent) {
          requestAnimationFrame(animate);
        }
      };

      setTimeout(animate, 100);
    });
  };

  // Smooth scroll to top
  const initGoToTop = function() {
    const gototopLink = document.querySelector('.js-gotop');
    const topButton = document.querySelector('.js-top');

    if (!gototopLink) return;

    gototopLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Show/hide button on scroll
    const handleScroll = throttle(() => {
      if (window.pageYOffset > 200) {
        if (topButton) topButton.classList.add('active');
      } else {
        if (topButton) topButton.classList.remove('active');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);
  };

  // Page loader - fix for file:// protocol and edge cases
  const initLoader = function() {
    const loader = document.querySelector('.fh5co-loader');
    if (!loader) return;

    const hideLoader = () => {
      loader.classList.add('js-hide');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    };

    // If page already loaded (file:// or cached), hide immediately
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
    }

    // Fallback: hide after 2 seconds max
    setTimeout(hideLoader, 2000);
  };

  // Parallax effect (simplified - using CSS where possible)
  const initParallax = function() {
    if (window.innerWidth <= 768) return; // Disable on mobile

    const parallaxElements = document.querySelectorAll('[data-stellar-background-ratio]');

    if (parallaxElements.length === 0) return;

    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach(el => {
        const ratio = parseFloat(el.dataset.stellarBackgroundRatio) || 0.5;
        const speed = ratio * scrolled;
        el.style.backgroundPosition = `center ${speed}px`;
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  };

  // Contact form validation (basic client-side)
  const initContactForm = function() {
    const form = document.querySelector('#fh5co-consult form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fname = document.getElementById('fname');
      const lname = document.getElementById('lname');
      const email = document.getElementById('email');
      const subject = document.getElementById('subject');
      const message = document.getElementById('message');

      // Basic validation
      let isValid = true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      [fname, lname, email, subject, message].forEach(field => {
        if (field && !field.value.trim()) {
          field.style.borderColor = '#e74c3c';
          isValid = false;
        } else if (field === email && email.value && !emailRegex.test(email.value)) {
          field.style.borderColor = '#e74c3c';
          isValid = false;
        } else if (field) {
          field.style.borderColor = '';
        }
      });

      if (isValid) {
        // In a real implementation, this would send to a server
        alert('Thank you for your message! This is a demo - no email was sent.');
        form.reset();
      } else {
        alert('Please fill in all required fields correctly.');
      }
    });
  };

  // Image lazy loading with native loading="lazy"
  const initLazyLoading = function() {
    // Modern browsers support native lazy loading
    // This ensures all images that support it have the attribute
    const images = document.querySelectorAll('img[src^="images/"]');
    images.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }
    });
  };

  // Initialize all modules when DOM is ready
  const init = function() {
    fullHeight();
    initLoader();
    initScrollAnimations();
    initSkillCharts();
    initGoToTop();
    initParallax();
    initContactForm();
    initLazyLoading();
  };

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
