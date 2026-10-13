/* Night Sky: responsive, on-demand adaptation of Arya Singh's original scene.js.
 * Source: https://github.com/AryaDSingh/NightSky/blob/main/scene.js
 * Retains random stars, three clusters, dust and radial haze. No animation loop:
 * a new view is drawn only on request, and resizing keeps the same composition.
 */
(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const preview = document.getElementById('barrowlight-preview');
  const previewToggle = document.getElementById('barrowlight-toggle');
  if (preview && previewToggle) {
    const still = preview.getAttribute('src');
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let playing = !motionPreference.matches;
    const updatePreview = () => {
      preview.src = playing ? preview.dataset.animation : still;
      previewToggle.textContent = playing ? 'Pause preview' : 'Play preview';
    };
    previewToggle.hidden = false;
    previewToggle.addEventListener('click', () => { playing = !playing; updatePreview(); });
    motionPreference.addEventListener('change', () => { playing = !motionPreference.matches; updatePreview(); });
    updatePreview();
  }
  const canvas = document.getElementById('night-sky');
  const button = document.getElementById('new-sky');
  if (!canvas || !button) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const status = document.getElementById('sky-status');
  let stars = [], dust = [], clusters = [], view = 0;
  const star = (x = Math.random(), y = Math.random()) => ({
    x, y, radius: Math.random() * 1.2 + .3, opacity: Math.random() * .8 + .2
  });
  function generate() {
    stars = Array.from({length: 1500}, () => star());
    dust = Array.from({length: 500}, () => ({...star(), radius: Math.random() + .2, opacity: Math.random() * .3 + .05}));
    clusters = [];
    for (let i = 0; i < 3; i++) {
      const x = .15 + Math.random() * .7, y = .15 + Math.random() * .7;
      const size = Math.random() * .16 + .1;
      for (let j = 0, count = Math.floor(Math.random() * 50) + 50; j < count; j++) {
        clusters.push(star(x + (Math.random() - .5) * size, y + (Math.random() - .5) * size));
      }
    }
    view++;
    status.textContent = `View ${String(view).padStart(2, '0')} / 1,500 stars`;
    draw();
  }
  function draw() {
    const bounds = canvas.parentElement.getBoundingClientRect();
    const width = bounds.width, height = bounds.height;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#070a10';
    context.fillRect(0, 0, width, height);
    const haze = context.createRadialGradient(width * .5, height * .5, 0, width * .5, height * .5, width * .65);
    haze.addColorStop(0, 'rgba(128,145,177,.12)');
    haze.addColorStop(1, 'rgba(128,145,177,0)');
    context.fillStyle = haze;
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#edf0ff';
    for (const point of [...stars, ...dust, ...clusters]) {
      context.globalAlpha = point.opacity;
      context.beginPath();
      context.arc(point.x * width, point.y * height, point.radius * Math.min(width / 650, 1), 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }
  canvas.hidden = false;
  button.hidden = false;
  document.getElementById('sky-fallback').hidden = true;
  button.addEventListener('click', generate);
  generate();
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(canvas.parentElement);
  else window.addEventListener('resize', draw);
})();
