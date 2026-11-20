import { readdir, readFile, mkdir, writeFile, cp, stat } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const css = await readFile('public/style.css', 'utf8') + '\n' + await readFile('public/compact.css', 'utf8');
function page(title, body, home) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><title>${escape(title)} — Felix, at the table</title><style>${css}</style></head><body><div class="private">PRIVATE DRAFT · UNPUBLISHED</div><div class="shell"><header><a class="brand" href="${home}">Felix, <em>at the table.</em></a><a href="${home}">All reviews</a></header><main>${body}</main><footer>Felix, at the table. · Working title · 2026</footer></div></body></html>`;
}

// Region folders determine sections; metadata never moves a post elsewhere.
const folders = (await readdir('content', {withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name);
const regions = [...['China','US','Europe'].filter(x=>folders.includes(x)), ...folders.filter(x=>!['China','US','Europe'].includes(x))];
if (new Set(regions.map(slug)).size !== regions.length) throw Error('Region folder names have duplicate URL slugs');
await mkdir('dist', {recursive:true});
await cp('public/images', 'dist/images', {recursive:true});
const sections = [];
const flags = {China:'🇨🇳', US:'🇺🇸', Europe:'🇪🇺'};
function navigation(active, prefix='') {
  return `<nav class="region-nav" aria-label="Browse by region">${regions.map(r=>`<a href="${prefix}${slug(r)}.html" ${r===active?'aria-current="page"':''}><span aria-hidden="true">${flags[r] || '🌍'}</span> ${escape(r)}</a>`).join('')}</nav>`;
}
for (const region of regions) {
  const cards = [];
  for (const file of (await readdir(`content/${region}`)).filter(x=>x.endsWith('.md')).sort()) {
    const {data, content} = matter(await readFile(`content/${region}/${file}`, 'utf8'));
    for (const key of ['title','subtitle','region','location','date','cover']) {
      if (typeof data[key] !== 'string' || !data[key].trim()) throw Error(`${file}: ${key} must be a quoted, nonempty string`);
    }
    if (!/^images\/[a-zA-Z0-9/_ .-]+\.(svg|png|jpe?g|webp)$/.test(data.cover) || data.cover.includes('..')) throw Error(`${file}: cover must be a local images/ path`);
    await stat(path.join('public', data.cover));
    const name = file.slice(0,-3);
    if (!/^[a-z0-9-]+$/.test(name)) throw Error(`${file}: use lowercase hyphenated filenames`);
    const url = `reviews/${slug(region)}/${name}.html`;
    const image = await readFile(path.join('public',data.cover));
    const ext = path.extname(data.cover).toLowerCase();
    const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : `image/${ext.slice(1)}`;
    const cover = `data:${mime};base64,${image.toString('base64')}`;
    // Inline covers and CSS make each preview page independently portable.
    cards.push(`<a class="card" href="${url}"><img src="${cover}" alt="${escape(data.cover_alt || data.title)}"><div class="card-copy"><p class="meta">${escape(data.location)} · ${escape(data.date)}</p><h3>${escape(data.title)}</h3><p>${escape(data.subtitle)}</p><span class="read">Read the review →</span></div></a>`);
    const body = `<article><p class="eyebrow">${escape(region)} / FOOD JOURNAL</p><h1>${escape(data.title)}</h1><p class="subtitle">${escape(data.subtitle)}</p><p class="meta">${escape(data.location)} · ${escape(data.date)} · By Felix</p><img class="post-cover" src="${cover}" alt="${escape(data.cover_alt || data.title)}"><div class="prose">${marked.parse(content)}</div></article>`;
    await mkdir(path.dirname(`dist/${url}`), {recursive:true});
    await writeFile(`dist/${url}`,page(data.title,navigation(region,'../../')+body,'../../index.html'));
  }
  sections.push(`<section id="${slug(region)}"><div class="section-head"><h2>${escape(region)}</h2><span>${cards.length} ${cards.length===1?'review':'reviews'}</span></div><div class="cards">${cards.join('') || '<p class="empty">No reviews yet. A seat saved for the next trip.</p>'}</div></section>`);
}
const intro = `<div class="intro compact-intro"><p class="eyebrow">A PERSONAL FOOD JOURNAL</p><h1>Good meals. Honest notes.</h1><p>I’m Felix. I write about what I eat, how it tastes, and what it feels like to be there.</p></div>`;
for (const [index,region] of regions.entries()) {
  await writeFile(`dist/${slug(region)}.html`,page(region,`${intro}${navigation(region)}${sections[index]}`,'index.html'));
}
const tabs = `<div class="region-nav" role="tablist" aria-label="Browse by region">${regions.map((r,i)=>`<button type="button" role="tab" id="tab-${slug(r)}" aria-controls="${slug(r)}" aria-selected="${i===0}" tabindex="${i===0?0:-1}"><span aria-hidden="true">${flags[r] || '🌍'}</span> ${escape(r)}</button>`).join('')}</div>`;
const panels = sections.map((section,i)=>section.replace(`<section id="${slug(regions[i])}">`,`<section id="${slug(regions[i])}" role="tabpanel" aria-labelledby="tab-${slug(regions[i])}" tabindex="0" ${i?'hidden':''}>`)).join('');
const tabScript = await readFile('public/tabs.js','utf8');
await writeFile('dist/index.html',page('The journal',`${intro}${tabs}${panels}<noscript>Enable JavaScript to switch regions, or open ${regions.map(r=>`<a href="${slug(r)}.html">${escape(r)}</a>`).join(' / ')}.</noscript><script>${tabScript}</script>`,'index.html'));
console.log('Built private preview in dist/');
