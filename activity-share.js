import { formatActivityTime } from './activity-timer.js';

const WIDTH = 1080;
const HEIGHT = 1350;
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
const COLORS = {
  blue: '#3155e7',
  ink: '#202638',
  muted: '#626b7d',
  line: '#e4e7ef',
  lavender: '#f1f3ff',
  white: '#ffffff'
};

function roundedBox(context, x, y, width, height, radius, fill, stroke) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
  context.fillStyle = fill;
  context.fill();
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = 2;
    context.stroke();
  }
}

function text(context, value, x, y, size, { color = COLORS.ink, weight = 600, align = 'left', maxWidth = 936, minSize = 18 } = {}) {
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = 'alphabetic';
  context.font = `${weight} ${size}px ${FONT}`;
  // Keep long elapsed times within the card without stretching the type.
  while (context.measureText(value).width > maxWidth && size > minSize) {
    size -= 1;
    context.font = `${weight} ${size}px ${FONT}`;
  }
  context.fillText(value, x, y);
}

function drawModelChips(context, pairs) {
  const columns = 6;
  const rows = Math.ceil(pairs.length / columns);
  const chipWidth = 144;
  const chipHeight = rows > 3 ? 36 : 48;
  const gapX = 12;
  const gapY = 10;
  const top = 1067 - (rows * chipHeight + (rows - 1) * gapY);
  pairs.forEach((pair, index) => {
    const row = Math.floor(index / columns);
    const rowCount = Math.min(columns, pairs.length - row * columns);
    const rowWidth = rowCount * chipWidth + (rowCount - 1) * gapX;
    const x = (WIDTH - rowWidth) / 2 + (index % columns) * (chipWidth + gapX);
    const y = top + row * (chipHeight + gapY);
    roundedBox(context, x, y, chipWidth, chipHeight, 12, COLORS.white, COLORS.line);
    const label = pair.left.label.trim();
    context.font = `600 18px ${FONT}`;
    let lines = [label];
    const words = label.split(/\s+/);
    if (context.measureText(label).width > chipWidth - 20 && words.length > 1) {
      let narrowest = Infinity;
      for (let split = 1; split < words.length; split++) {
        const candidate = [words.slice(0, split).join(' '), words.slice(split).join(' ')];
        const width = Math.max(...candidate.map(line => context.measureText(line).width));
        if (width < narrowest) { lines = candidate; narrowest = width; }
      }
    }
    const lineHeight = rows > 3 ? 15 : 20;
    const baseline = y + chipHeight / 2 + 6 - (lines.length - 1) * lineHeight / 2;
    lines.forEach((line, lineIndex) => text(context, line, x + chipWidth / 2, baseline + lineIndex * lineHeight, rows > 3 ? 16 : 18, {
      align: 'center', maxWidth: chipWidth - 20, minSize: 12
    }));
  });
}

async function loadLogo(pair) {
  const label = pair?.right?.label || 'AI app';
  const loadError = () => new Error(`Could not load the ${label} icon for your share image. Please try again.`);
  if (!pair?.right?.asset) throw loadError();
  let source;
  let svgUrl;
  try {
    source = new URL(pair.right.asset, document.baseURI).href;
    if (new URL(source).pathname.endsWith('.svg')) {
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 15000);
      let svgText;
      try {
        const response = await fetch(source, { signal: controller.signal });
        if (!response.ok) throw loadError();
        svgText = await response.text();
      } finally {
        clearTimeout(fetchTimeout);
      }
      const documentSvg = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      if (documentSvg.querySelector('parsererror')) throw loadError();
      // The official Grok export includes an empty Figma backdrop-filter
      // foreignObject. It is not part of the mark, and makes Canvas exports
      // origin-unclean in some browsers. Preserve the actual vector artwork.
      documentSvg.querySelectorAll('foreignObject').forEach(node => node.remove());
      const svg = documentSvg.documentElement;
      const viewBox = svg.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
      if (viewBox?.length === 4 && viewBox.every(Number.isFinite)) {
        if (!svg.hasAttribute('width')) svg.setAttribute('width', String(viewBox[2]));
        if (!svg.hasAttribute('height')) svg.setAttribute('height', String(viewBox[3]));
      }
      svgUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
      source = svgUrl;
    }
    return await new Promise((resolve, reject) => {
      const image = new Image();
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        image.onload = null;
        image.onerror = null;
        if (error) reject(error);
        else resolve(image);
      };
      const fail = () => finish(loadError());
      const timeout = setTimeout(fail, 15000);
      image.crossOrigin = 'anonymous';
      image.onerror = fail;
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) return fail();
        if (typeof image.decode === 'function') image.decode().then(() => finish(), fail);
        else finish();
      };
      try {
        image.src = source;
      } catch {
        fail();
      }
    });
  } catch {
    throw loadError();
  } finally {
    if (svgUrl) URL.revokeObjectURL(svgUrl);
  }
}

function pngBlob(canvas) {
  return new Promise((resolve, reject) => {
    const fail = () => reject(new Error('Could not create your share image. Please try again.'));
    try {
      canvas.toBlob(blob => blob ? resolve(blob) : fail(), 'image/png');
    } catch (error) {
      if (error?.name === 'SecurityError') reject(new Error('The browser could not include a logo in your share image. Please try again.'));
      else fail();
    }
  });
}

/** Create a finished-round PNG. The caller owns and must revoke the returned object URL. */
export async function createLogoResultImage({ pairs, elapsedMs, timingComplete, firstCorrect = 0, hintsUsed = false, variant = 'logos', title }) {
  const isModels = variant === 'models';
  if (!Array.isArray(pairs) || pairs.length === 0 || pairs.length > (isModels ? 24 : 7)) {
    throw new Error(`Your completed ${isModels ? 'model' : 'logo'} round is unavailable. Please try again.`);
  }
  if (isModels && pairs.some(pair => typeof pair?.left?.label !== 'string' || !pair.left.label.trim())) {
    throw new Error('Your model names are unavailable. Please try again.');
  }
  if (!Number.isInteger(firstCorrect) || firstCorrect < 0 || firstCorrect > pairs.length) {
    throw new Error('Your round results are unavailable. Please try again.');
  }
  if (timingComplete && (!Number.isFinite(elapsedMs) || elapsedMs < 0)) {
    throw new Error('Your round time is unavailable. Please try again.');
  }

  const logos = isModels ? [] : await Promise.all(pairs.map(loadLogo));
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not create the share image. Please try another browser.');

  context.fillStyle = COLORS.lavender;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  roundedBox(context, 32, 32, 1016, 1286, 44, COLORS.white);

  text(context, 'fluent', 72, 112, 43, { color: COLORS.blue, weight: 800 });
  text(context, isModels ? 'THE AI MODEL CHALLENGE' : 'THE AI LOGO CHALLENGE', 72, 186, 23, { color: COLORS.blue, weight: 700 });
  text(context, isModels ? (typeof title === 'string' && title.trim() ? title.trim() : 'Know the model.') : 'Know the logo.', 72, 285, 82, { weight: 800 });
  text(context, isModels ? 'I matched the models.' : 'I made the connections.', 76, 334, 30, { color: COLORS.muted, weight: 500 });

  roundedBox(context, 72, 380, 936, 255, 32, COLORS.blue);
  const time = timingComplete ? formatActivityTime(elapsedMs) : null;
  if (time) {
    text(context, 'MY PLAY TIME', 540, 442, 24, { color: COLORS.white, weight: 700, align: 'center' });
    text(context, time, 540, 576, 128, { color: COLORS.white, weight: 800, align: 'center', maxWidth: 820 });
  } else {
    text(context, 'Round complete', 540, 496, 65, { color: COLORS.white, weight: 800, align: 'center' });
    text(context, 'Full time not recorded', 540, 552, 29, { color: COLORS.white, weight: 500, align: 'center' });
  }

  roundedBox(context, 72, 661, 454, 153, 24, COLORS.lavender);
  roundedBox(context, 554, 661, 454, 153, 24, COLORS.lavender);
  text(context, `${pairs.length} / ${pairs.length}`, 299, 737, 55, { color: COLORS.blue, weight: 800, align: 'center' });
  text(context, 'connections', 299, 779, 25, { color: COLORS.muted, weight: 500, align: 'center' });
  text(context, `${firstCorrect} / ${pairs.length}`, 781, 737, 55, { color: COLORS.blue, weight: 800, align: 'center' });
  text(context, 'unaided first tries', 781, 779, 25, { color: COLORS.muted, weight: 500, align: 'center' });
  const usedHints = Array.isArray(hintsUsed) ? hintsUsed.length > 0 : Boolean(hintsUsed);
  text(context, usedHints ? 'Hints used' : 'No hints used', 540, 861, 23, { color: COLORS.muted, weight: 500, align: 'center' });

  const iconSize = 104;
  const gap = 20;
  const rowWidth = logos.length * iconSize + (logos.length - 1) * gap;
  const rowStart = (WIDTH - rowWidth) / 2;
  logos.forEach((logo, index) => {
    const x = rowStart + index * (iconSize + gap);
    const y = 917;
    roundedBox(context, x, y, iconSize, iconSize, 24, COLORS.white, COLORS.line);
    const scale = Math.min(70 / logo.naturalWidth, 70 / logo.naturalHeight);
    const width = logo.naturalWidth * scale;
    const height = logo.naturalHeight * scale;
    context.drawImage(logo, x + (iconSize - width) / 2, y + (iconSize - height) / 2, width, height);
  });
  if (isModels) drawModelChips(context, pairs);

  text(context, isModels ? 'Can you match the models?' : 'Can you make the connections?', 540, 1113, 38, { weight: 700, align: 'center', maxWidth: 880 });
  context.beginPath();
  context.moveTo(170, 1170);
  context.lineTo(910, 1170);
  context.strokeStyle = COLORS.line;
  context.lineWidth = 2;
  context.stroke();
  text(context, 'fluent · Learn AI. One game at a time.', 540, 1234, 28, { color: COLORS.muted, weight: 600, align: 'center' });

  const blob = await pngBlob(canvas);
  let url;
  try {
    url = URL.createObjectURL(blob);
  } catch {
    throw new Error('Could not prepare your share image. Please try again.');
  }
  const suffix = time ? time.replace(/[^a-z0-9]+/gi, '-').replace(/-+$/, '') : 'complete';
  return { blob, url, filename: `fluent-${isModels ? 'model' : 'logo'}-challenge-${suffix}.png` };
}
