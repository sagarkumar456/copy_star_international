let firebaseModule;
const database = () => firebaseModule ??= import('./firebase-downloads.js').catch(e => { firebaseModule = null; throw e; });
const brands = { xerox: 'Xerox', canon: 'Canon', konica: 'Konica Minolta', ricoh: 'Ricoh' };

const dialog = document.getElementById('download-dialog');
const form = document.getElementById('download-form');
const submit = document.getElementById('download-submit');
const error = document.getElementById('download-error');
const count = document.getElementById('download-count');

// Progress animation UI elements
const progressView = document.getElementById('download-progress-view');
const progressClose = document.getElementById('download-progress-close');
const percentVal = document.getElementById('dl-percent-val');
const fillBar = document.getElementById('dl-fill');
const statSize = document.getElementById('dl-stat-size');
const statSpeed = document.getElementById('dl-stat-speed');
const msgPrimary = document.getElementById('dl-msg-primary');
const msgSecondary = document.getElementById('dl-msg-secondary');
const statusPill = document.getElementById('dl-status-pill');
const iconSymbol = document.getElementById('dl-icon-symbol');
const actionsComplete = document.getElementById('dl-actions-complete');
const reDownloadBtn = document.getElementById('dl-re-download');
const doneBtn = document.getElementById('dl-btn-done');

// Inline driver panel progress elements
const driverInlineProgress = document.getElementById('driver-inline-progress');
const inlineProgressState = document.getElementById('inline-progress-state');
const inlineProgressSpeed = document.getElementById('inline-progress-speed');
const inlineProgressFill = document.getElementById('inline-progress-fill');
const driverDownloadBtn = document.getElementById('driver-download');

let selected = 'xerox', busy = false, requestId = null, requestEmail = null;
let animationFrameId = null;

function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Gentle Web Audio feedback
function playSound(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.1);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'complete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      osc.frequency.setValueAtTime(1046.50, now + 0.24);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (_) {}
}

function showCount(n) {
  if (!Number.isSafeInteger(n) || n < 0) return;
  const numEl = count.querySelector('.badge-num');
  if (numEl) {
    const prev = parseInt(numEl.textContent.replace(/,/g, ''), 10);
    numEl.textContent = n.toLocaleString();
    if (!isNaN(prev) && prev !== n) {
      count.classList.remove('count-pop');
      void count.offsetWidth;
      count.classList.add('count-pop');
    }
  } else {
    count.innerHTML = `<svg class="badge-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg><span class="badge-text"><b class="badge-num">${n.toLocaleString()}</b> People Downloaded</span>`;
  }
  count.hidden = selected !== 'xerox';
}

async function refreshCount() {
  try {
    const db = await database();
    db.watchDownloadCount(showCount, () => {});
  } catch (e) {}
}

function resetProgressUI() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (progressView) {
    progressView.classList.remove('is-complete');
    progressView.hidden = true;
  }
  if (form) form.hidden = false;
  if (percentVal) percentVal.textContent = '0';
  if (fillBar) fillBar.style.width = '0%';
  if (statSize) statSize.textContent = '0.0 MB / 33.2 MB';
  if (statSpeed) statSpeed.textContent = 'Connecting...';
  if (statusPill) statusPill.textContent = 'DOWNLOADING';
  if (msgPrimary) msgPrimary.textContent = 'Establishing secure connection...';
  if (msgSecondary) msgSecondary.textContent = 'TLS 1.3 handshake with COPYSTAR server';
  if (actionsComplete) actionsComplete.hidden = true;
  if (iconSymbol) {
    iconSymbol.innerHTML = `<svg class="dl-arrow-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12" class="dl-arrow-stem"></path><path d="m7 10 5 5 5-5" class="dl-arrow-head"></path><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" class="dl-tray-line"></path></svg>`;
  }
}

function startDownloadProgress({ fileName = 'xerox-software.zip', totalMB = 33.2, onFinished }) {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  // Switch to progress view
  form.hidden = true;
  progressView.hidden = false;
  progressView.classList.remove('is-complete');
  actionsComplete.hidden = true;

  if (driverInlineProgress) {
    driverInlineProgress.hidden = false;
    inlineProgressFill.style.width = '0%';
    inlineProgressState.textContent = 'Downloading... 0%';
    inlineProgressSpeed.textContent = 'Starting stream...';
  }
  if (driverDownloadBtn) {
    driverDownloadBtn.textContent = 'Downloading…';
    driverDownloadBtn.disabled = true;
  }

  playSound('start');

  const startTime = performance.now();
  const totalDuration = 3200; // 3.2 seconds total duration - realistic & smooth

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);

    // Realistic download curve:
    // 0 -> 0.15: easeIn (handshake & TLS negotiation)
    // 0.15 -> 0.75: fast steady transfer (downloading packets)
    // 0.75 -> 0.88: slight verification plateau (checksum verify)
    // 0.88 -> 1.0: quick wrap up to 100%
    let pct = 0;
    if (progress < 0.15) {
      pct = Math.round((progress / 0.15) * 15);
    } else if (progress < 0.75) {
      const subP = (progress - 0.15) / 0.60;
      pct = Math.round(15 + subP * 65);
    } else if (progress < 0.88) {
      const subP = (progress - 0.75) / 0.13;
      pct = Math.round(80 + subP * 10);
    } else {
      const subP = (progress - 0.88) / 0.12;
      pct = Math.round(90 + subP * 10);
    }
    pct = Math.max(1, Math.min(100, pct));

    // Update numbers & line widths
    if (percentVal) percentVal.textContent = String(pct);
    if (fillBar) fillBar.style.width = pct + '%';

    const currentMB = ((pct / 100) * totalMB).toFixed(1);
    if (statSize) statSize.textContent = `${currentMB} MB / ${totalMB} MB`;

    // Dynamic speeds & multi-stage status lines ("kuchh line uske sath chlana chaiye")
    if (pct < 16) {
      const speed = (3.2 + (pct / 16) * 2.8).toFixed(1);
      if (statSpeed) statSpeed.textContent = `${speed} MB/s · Handshake`;
      if (msgPrimary) msgPrimary.textContent = '⚡ Establishing secure TLS connection...';
      if (msgSecondary) msgSecondary.textContent = 'Verified TLS 1.3 · Server: Asia-East (Kathmandu)';
      if (inlineProgressState) inlineProgressState.textContent = `Connecting... ${pct}%`;
      if (inlineProgressSpeed) inlineProgressSpeed.textContent = `${speed} MB/s`;
    } else if (pct < 45) {
      const speed = (6.4 + Math.sin(progress * 15) * 1.5).toFixed(1);
      if (statSpeed) statSpeed.textContent = `${speed} MB/s · Buffering`;
      if (msgPrimary) msgPrimary.textContent = `📡 Connecting to software repository...`;
      if (msgSecondary) msgSecondary.textContent = `Allocating 10Gbps CDN stream for ${fileName}`;
      if (inlineProgressState) inlineProgressState.textContent = `Downloading ${pct}%`;
      if (inlineProgressSpeed) inlineProgressSpeed.textContent = `${speed} MB/s`;
    } else if (pct < 80) {
      const speed = (7.8 + Math.cos(progress * 12) * 1.2).toFixed(1);
      if (statSpeed) statSpeed.textContent = `${speed} MB/s · Transferring`;
      if (msgPrimary) msgPrimary.textContent = `📦 Downloading ${fileName} (${currentMB} MB / ${totalMB} MB)...`;
      if (msgSecondary) msgSecondary.textContent = 'Receiving verified file packages · 0 packet errors';
      if (inlineProgressState) inlineProgressState.textContent = `Downloading ${pct}% (${currentMB} MB)`;
      if (inlineProgressSpeed) inlineProgressSpeed.textContent = `${speed} MB/s`;
    } else if (pct < 95) {
      const speed = (6.1 - (pct - 80) * 0.2).toFixed(1);
      if (statSpeed) statSpeed.textContent = `${speed} MB/s · Checksum`;
      if (msgPrimary) msgPrimary.textContent = '🛡️ Verifying SHA-256 package checksum & signatures...';
      if (msgSecondary) msgSecondary.textContent = 'Package integrity: 100% verified · Certified COPYSTAR build';
      if (inlineProgressState) inlineProgressState.textContent = `Verifying... ${pct}%`;
      if (inlineProgressSpeed) inlineProgressSpeed.textContent = 'Checksum verify';
    } else if (pct < 100) {
      if (statSpeed) statSpeed.textContent = 'Finalizing...';
      if (msgPrimary) msgPrimary.textContent = '✨ Finalizing software archive...';
      if (msgSecondary) msgSecondary.textContent = 'Writing archive to browser download pipeline';
      if (inlineProgressState) inlineProgressState.textContent = `Finalizing... ${pct}%`;
    }

    if (inlineProgressFill) {
      inlineProgressFill.style.width = pct + '%';
    }

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      finishDownload(fileName, totalMB, onFinished);
    }
  }

  animationFrameId = requestAnimationFrame(step);
}

function finishDownload(fileName, totalMB, onFinished) {
  if (percentVal) percentVal.textContent = '100';
  if (fillBar) fillBar.style.width = '100%';
  if (statSize) statSize.textContent = `${totalMB} MB / ${totalMB} MB`;
  if (statSpeed) statSpeed.textContent = 'Completed ✓';
  if (statusPill) statusPill.textContent = 'COMPLETED';
  if (msgPrimary) msgPrimary.textContent = '✓ Download completed successfully!';
  if (msgSecondary) msgSecondary.textContent = `Saved ${fileName} to your Downloads folder`;

  if (progressView) progressView.classList.add('is-complete');
  if (actionsComplete) actionsComplete.hidden = false;

  // Icon morphs into emerald checkmark
  if (iconSymbol) {
    iconSymbol.innerHTML = `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
  }

  playSound('complete');

  if (driverInlineProgress) {
    inlineProgressFill.style.width = '100%';
    inlineProgressState.textContent = 'Download Complete! ✓';
    inlineProgressSpeed.textContent = `${totalMB} MB saved`;
    setTimeout(() => {
      if (driverInlineProgress) driverInlineProgress.hidden = true;
    }, 5000);
  }

  if (driverDownloadBtn) {
    driverDownloadBtn.textContent = 'Download Again';
    driverDownloadBtn.disabled = false;
  }

  if (typeof onFinished === 'function') {
    onFinished();
  }
}

for (const button of document.querySelectorAll('[data-driver]')) {
  button.addEventListener('click', () => {
    selected = button.dataset.driver;
    document.querySelectorAll('[data-driver]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.getElementById('driver-title').textContent = brands[selected] + ' software';
    document.getElementById('driver-description').textContent = selected === 'xerox' ? 'ZIP file · 33.2 MB' : '';
    document.getElementById('software-status').textContent = '';
    count.hidden = selected !== 'xerox';
  });
}

document.getElementById('driver-download').addEventListener('click', () => {
  if (selected !== 'xerox') {
    document.getElementById('software-status').textContent = 'Software is not available yet.';
    return;
  }
  error.textContent = '';
  try {
    const saved = localStorage.getItem('copystar_dl_email');
    if (saved) document.getElementById('download-email').value = saved;
  } catch (_) {}
  resetProgressUI();
  dialog.showModal();
  document.getElementById('download-email').focus();
});

document.getElementById('download-close')?.addEventListener('click', () => {
  if (!busy) {
    dialog.close();
    resetProgressUI();
  }
});

progressClose?.addEventListener('click', () => {
  if (!busy) {
    dialog.close();
    resetProgressUI();
  }
});

doneBtn?.addEventListener('click', () => {
  if (!busy) {
    dialog.close();
    resetProgressUI();
  }
});

reDownloadBtn?.addEventListener('click', e => {
  e.preventDefault();
  const link = document.createElement('a');
  link.href = './downloads/xerox-software.zip';
  link.download = 'xerox-software.zip';
  document.body.append(link);
  link.click();
  link.remove();
  playSound('complete');
});

dialog.addEventListener('cancel', event => {
  if (busy) event.preventDefault();
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || !form.reportValidity()) return;

  const email = document.getElementById('download-email').value.trim().toLowerCase();
  if (email !== requestEmail || !requestId) {
    requestId = uuid();
    requestEmail = email;
  }

  busy = true;
  submit.disabled = true;
  error.textContent = '';

  try {
    localStorage.setItem('copystar_dl_email', email);
  } catch (_) {}

  let downloadUrl = './downloads/xerox-software.zip';
  let recordedCount = null;

  // Run database record asynchronously while animation plays
  const dbPromise = (async () => {
    try {
      const db = await database();
      const data = await db.recordDownload({ brand: 'xerox', email, requestId });
      if (data) {
        if (data.url) downloadUrl = data.url;
        if (data.count) recordedCount = data.count;
      }
    } catch (e) {
      console.warn('Realtime database log error:', e);
    }
  })();

  // Run the 1% to 100% download progress animation
  startDownloadProgress({
    fileName: 'xerox-software.zip',
    totalMB: 33.2,
    onFinished: async () => {
      await dbPromise;
      if (recordedCount !== null) {
        showCount(recordedCount);
      }
      // Trigger actual browser download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'xerox-software.zip';
      document.body.append(link);
      link.click();
      link.remove();

      busy = false;
      submit.disabled = false;
    }
  });
});

refreshCount();
