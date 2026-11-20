import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('homepage has bio, region sections and one complete card', async()=>{
 const h=await readFile('dist/index.html','utf8');
 for(const text of ['I’m Felix.','id="china"','href="us.html"','href="europe.html"','🇨🇳','🇺🇸','🇪🇺','Brisket in Shenzhen','November 2026','Brewtown, Shenzhen, China','reviews/china/half-ton.html']) assert.ok(h.includes(text),text);
 assert.equal((h.match(/class="card"/g)||[]).length,1);
 assert.ok(h.indexOf('I’m Felix.')<h.indexOf('id="china"'));
 assert.ok(h.includes('data:image/svg+xml;base64,'));
 assert.ok(!/<script|https?:\/\//.test(h));
});
test('regions open separately rather than stacking sections', async()=>{
 for(const region of ['china','us','europe']) {
  const h=await readFile(`dist/${region}.html`,'utf8');
  assert.equal((h.match(/<section id=/g)||[]).length,1);
  assert.ok(h.includes(`id="${region}"`));
  assert.ok(h.includes(`href="${region}.html" aria-current="page"`));
 }
});
test('review retains original content, ratings and offline navigation', async()=>{
 const h=await readFile('dist/reviews/china/half-ton.html','utf8');
 for(const text of ['Taste · 3.5/5','Atmosphere · 4/5','Service · 4.5/5','might have been shrimp','they’d run out.','../../index.html']) assert.ok(h.includes(text),text);
 assert.ok(h.includes('noindex,nofollow,noarchive'));
});
