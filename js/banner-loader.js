(function(){
  function getConfig() {
    const node = document.getElementById('page-banner-config');
    if (!node) return null;
    try { return JSON.parse(node.textContent); } catch { return null; }
  }

  function applyBannerConfig(cfg) {
    const banner = document.getElementById('page-banner');
    if (!banner || !cfg) return;

    if (cfg.variant === 'hero' && cfg.background) {
      if (cfg.background.endsWith('.mp4')) {
        // Video background - insert before overlay
        const overlay = banner.querySelector('.page-banner__overlay');
        const video = document.createElement('video');
        video.src = cfg.background;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.poster = 'public/images/hero/front_porch_hero.webp';
        video.className = 'absolute inset-0 w-full h-full object-cover pointer-events-none';
        if (overlay) {
          banner.insertBefore(video, overlay);
        } else {
          banner.prepend(video);
        }

        const fallbackToImage = () => {
          console.error('Hero video fallback to image');
          banner.style.backgroundImage = `url("public/images/hero/front_porch_hero.webp")`;
          banner.style.backgroundSize = 'cover';
          banner.style.backgroundPosition = 'center';
          banner.style.backgroundRepeat = 'no-repeat';
          if (video.parentNode) video.remove();
        };

        video.addEventListener('error', fallbackToImage);
        video.addEventListener('loadedmetadata', () => {
          console.log('Hero video metadata loaded, attempting play');
          video.play().catch(e => console.warn('Video play rejected:', e));
        });

        // Conditional timeout fallback
        setTimeout(() => {
          if (video.readyState < 2) {
            fallbackToImage();
          }
        }, 5000);
      } else {
        // Image background
        banner.style.backgroundImage = `url("${cfg.background}")`;
      }
      banner.classList.add('page-banner--hero');
    }

    const eyebrow = banner.querySelector('.page-banner__eyebrow');
    const title = banner.querySelector('.page-banner__title');
    const subtitle = banner.querySelector('.page-banner__subtitle');
    const ctaBtn = banner.querySelector('.page-banner__cta-btn');
    const status = banner.querySelector('.page-banner__status');

    if (eyebrow && cfg.eyebrow) eyebrow.textContent = cfg.eyebrow;
    if (title && cfg.title) title.textContent = cfg.title;
    if (subtitle) subtitle.textContent = cfg.subtitle || '';
    if (ctaBtn) {
      ctaBtn.textContent = cfg.ctaText || 'Get Started';
      ctaBtn.setAttribute('href', cfg.ctaHref || 'get-started.html');
    }
    if (status) status.style.display = cfg.showVoucherBadge ? 'block' : 'none';
  }

  function injectBanner() {
    // Fetch component and inject into a target container
    const target = document.getElementById('page-banner-container');
    if (!target) return;

    fetch('components/page-banner.html')
      .then(res => res.text())
      .then(html => {
        target.innerHTML = html;
        document.body.classList.add('has-sticky-header');
        applyBannerConfig(getConfig());
      })
      .catch(() => { /* no-op to avoid hard failures */ });
  }

  document.addEventListener('DOMContentLoaded', injectBanner);
})();
