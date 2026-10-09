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
  const baseline = sources[0].scores[metricIndex];
  const deltas = sources.slice(1).map(source => source.scores[metricIndex] - baseline);
  const highest = Math.max(...sources.slice(1).map(source => source.scores[metricIndex]));
  const step = Math.max(...deltas) > 10 ? 5 : 2;
  const minimum = Math.floor(Math.min(0,...deltas) / step) * step;
  const maximum = Math.max(step,Math.ceil(Math.max(...deltas) / step) * step);
  const position = value => (value - minimum) / (maximum - minimum) * 100;
  const signed = value => `${value < -0.05 ? '−' : '+'}${Math.abs(value).toFixed(1)}`;
  const groupMeans = {};
  sourceChart.replaceChildren();
  [['general','General-purpose'],['specialized','Specialized']].forEach(([key,title]) => {
    const members = sources.filter(source => source.group === key)
      .sort((a,b) => b.scores[metricIndex] - a.scores[metricIndex]);
    const mean = members.reduce((sum,source) => sum + source.scores[metricIndex],0) / members.length;
    groupMeans[key] = mean;
    const group = document.createElement('section');
    group.className = `source-group ${key}`;
    group.setAttribute('aria-label',`${title} representations`);
    group.style.setProperty('--zero',`${position(0)}%`);
    group.style.setProperty('--grid-step',`${step / (maximum - minimum) * 100}%`);
    const heading = document.createElement('div');
    heading.className = 'source-group-heading';
    heading.innerHTML = `<div><h5>${title}</h5><span>${members.length} encoders</span></div><div class="group-mean"><span>Group mean</span><strong>${mean.toFixed(1)}<small>%</small></strong><span>${signed(mean - baseline)} pp vs. VAE-only</span></div>`;
    const axis = document.createElement('div');
    axis.className = 'source-axis';
    axis.setAttribute('aria-hidden','true');
    axis.innerHTML = '<span>Encoder</span><div class="gain-axis"></div><span>Δ pp</span><span>SR %</span>';
    for (let tick = minimum; tick <= maximum; tick += step) {
      const mark = document.createElement('span');
      mark.textContent = tick < 0 ? `−${Math.abs(tick)}` : tick > 0 ? `+${tick}` : '0';
      mark.style.left = `${position(tick)}%`;
      axis.querySelector('.gain-axis').append(mark);
    }
    const rows = document.createElement('div');
    rows.className = 'source-rows';
    members.forEach(source => {
      const value = source.scores[metricIndex];
      const delta = value - baseline;
      const row = document.createElement('div');
      row.className = `source-row${value === highest ? ' best' : ''}`;
      const label = document.createElement('span');
      label.className = 'source-name';
      label.textContent = source.name;
      const track = document.createElement('div');
      track.className = 'bar-track';
      track.setAttribute('aria-hidden','true');
      const bar = document.createElement('div');
      bar.className = 'bar-fill';
      bar.style.left = `${position(Math.min(0,delta))}%`;
      bar.style.width = `${Math.abs(delta) / (maximum - minimum) * 100}%`;
      track.append(bar);
      const gain = document.createElement('span');
      gain.className = 'source-gain';
      gain.innerHTML = `${signed(delta)}<span class="sr-only"> percentage points versus VAE-only</span>`;
      const score = document.createElement('span');
      score.className = 'source-value';
      score.innerHTML = `${value.toFixed(1)}<span class="sr-only"> percent success rate</span>`;
      row.append(label,track,gain,score);
      rows.append(row);
    });
    group.append(heading,axis,rows);
    sourceChart.append(group);
  });
  const label = metricSelect.options[metricSelect.selectedIndex].text;
  document.querySelector('#baseline-score').innerHTML = `VAE-only baseline: <strong>${baseline.toFixed(1)}%</strong>`;
  const difference = groupMeans.general - groupMeans.specialized;
  document.querySelector('#chart-status').textContent = `${label}: general-purpose mean ${groupMeans.general.toFixed(1)}%, specialized mean ${groupMeans.specialized.toFixed(1)}% (${Math.abs(difference).toFixed(1)} pp ${difference >= 0 ? 'higher' : 'lower'} for general-purpose). Both groups share the same gain axis; the range adjusts to the selected condition. Encoders are sorted within each group.`;
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
