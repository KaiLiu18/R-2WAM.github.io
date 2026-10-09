'use strict';

// Means from Table 1. Order: overall, camera, robot, language, lighting,
// background, image noise, and layout. No interpolated or simulated results.
const sources = [
  {name:'VAE-only',group:'baseline',scores:[74.7,51.2,77.8,91.1,94.3,62.0,66.6,82.4]},
  {name:'DINOv3',group:'general',scores:[84.0,64.2,82.5,93.8,98.5,83.9,86.0,83.6]},
  {name:'V-JEPA 2.1',group:'general',scores:[82.4,63.0,80.9,90.9,96.8,80.7,84.4,84.2]},
  {name:'VC-1',group:'general',scores:[82.5,60.8,78.1,93.3,98.4,82.0,86.7,83.0]},
  {name:'LingBot-Vision',group:'general',scores:[83.0,62.6,79.6,93.0,97.8,81.2,87.7,82.9]},
  {name:'VideoMAE V2',group:'general',scores:[77.5,53.6,81.4,91.3,95.4,68.0,73.1,82.7]},
  {name:'SigLIP 2',group:'general',scores:[83.1,60.7,85.0,93.8,97.9,82.4,83.4,83.0]},
  {name:'Qwen3.5',group:'general',scores:[81.6,59.7,84.5,93.2,98.0,80.0,78.7,82.5]},
  {name:'UniTok',group:'general',scores:[81.9,63.0,85.2,93.9,96.7,76.6,77.1,83.9]},
  {name:'C-RADIOv4',group:'general',scores:[83.5,62.6,81.0,92.2,97.3,86.2,86.6,83.6]},
  {name:'SAM 3',group:'specialized',scores:[80.6,57.8,80.8,93.7,95.6,75.3,81.5,82.4]},
  {name:'VGGT-Ω',group:'specialized',scores:[80.6,62.4,78.8,92.7,95.8,75.7,79.6,82.5]},
  {name:'HRP',group:'specialized',scores:[79.8,52.6,77.8,91.9,96.9,82.2,81.2,82.4]},
  {name:'DynaFLIP',group:'specialized',scores:[78.8,55.2,83.1,92.3,93.9,69.9,77.5,82.1]}
];
const metrics = ['total','camera','robot','language','lighting','background','noise','layout'];
const metricSelect = document.querySelector('#metric-select');
const sourceChart = document.querySelector('#source-chart');

function renderSources() {
  const metricIndex = metrics.indexOf(metricSelect.value);
  const highest = Math.max(...sources.slice(1).map(source => source.scores[metricIndex]));
  sourceChart.replaceChildren();
  sources.forEach(source => {
    const value = source.scores[metricIndex];
    const row = document.createElement('div');
    row.className = `source-row ${source.group}${value === highest ? ' best' : ''}`;
    const label = document.createElement('span');
    label.className = 'source-name';
    label.textContent = source.name;
    const track = document.createElement('div');
    track.className = 'bar-track';
    track.setAttribute('aria-hidden','true');
    const bar = document.createElement('div');
    bar.className = 'bar-fill';
    bar.style.setProperty('--score',`${value}%`);
    track.append(bar);
    const score = document.createElement('span');
    score.className = 'source-value';
    score.textContent = value.toFixed(1) + '%';
    row.append(label,track,score);
    sourceChart.append(row);
  });
  const label = metricSelect.options[metricSelect.selectedIndex].text;
  document.querySelector('#chart-status').textContent = `${label} LIBERO-Plus success. Bars use a 0–100% scale. Highest observed mean: ${highest.toFixed(1)}%.`;
}
metricSelect.addEventListener('change',renderSources);
renderSources();

const researchTabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, moveFocus = false) {
  researchTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected',String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (moveFocus) tab.focus();
}
researchTabs.forEach((tab,index) => {
  tab.addEventListener('click',() => activateTab(tab));
  tab.addEventListener('keydown',event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % researchTabs.length;
    if (event.key === 'ArrowLeft') next = (index + researchTabs.length - 1) % researchTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = researchTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); activateTab(researchTabs[next],true); }
  });
});

const figureDialog = document.querySelector('#figure-dialog');
const dialogImage = document.querySelector('#dialog-image');
document.querySelectorAll('[data-figure]').forEach(link => {
  link.addEventListener('click',event => {
    if (typeof figureDialog.showModal !== 'function') return;
    event.preventDefault();
    document.querySelector('#figure-title').textContent = link.dataset.figure;
    dialogImage.src = link.href;
    dialogImage.alt = link.querySelector('img').alt;
    figureDialog.showModal();
    document.body.classList.add('dialog-open');
  });
});
document.querySelector('#close-figure').addEventListener('click',() => figureDialog.close());
figureDialog.addEventListener('click',event => {
  const bounds = figureDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) figureDialog.close();
});
figureDialog.addEventListener('close',() => document.body.classList.remove('dialog-open'));

const copyButton = document.querySelector('#copy-citation');
copyButton.addEventListener('click',async () => {
  const citation = document.querySelector('#bibtex').textContent.trim();
  let copied = false;
  try { await navigator.clipboard.writeText(citation); copied = true; }
  catch {
    const text = document.createElement('textarea');
    text.value = citation;
    text.style.position = 'fixed';
    text.style.opacity = '0';
    document.body.append(text);
    text.select();
    copied = document.execCommand('copy');
    text.remove();
    copyButton.focus();
  }
  copyButton.textContent = copied ? 'Copied ✓' : 'Select citation to copy';
  document.querySelector('#copy-status').textContent = copied ? 'Citation copied to clipboard.' : 'Copy is unavailable. Select the citation text to copy it.';
  window.setTimeout(() => { copyButton.textContent = 'Copy citation ⧉'; },2500);
});
