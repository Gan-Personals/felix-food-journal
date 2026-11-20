// Run with PLAYWRIGHT_MODULE pointing to an existing Playwright installation.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  for(const width of [1440,390]) {
   const page=await browser.newPage({viewport:{width,height:900}});
   await page.goto(process.env.TEST_URL || pathToFileURL(path.resolve('dist/index.html')).href);
   await page.evaluate(()=>window.documentIdentity='original-document');
   const initialUrl=page.url();let requests=0,navigations=0;
   page.on('request',()=>requests++);
   page.on('framenavigated',()=>navigations++);
   for(const id of ['us','europe','china']) {
    await page.locator(`#tab-${id}`).click();
    assert.deepEqual(await page.locator('[role="tabpanel"]:visible').evaluateAll(nodes=>nodes.map(n=>n.id)),[id]);
    assert.equal(await page.locator(`#tab-${id}`).getAttribute('aria-selected'),'true');
    assert.equal(page.url(),initialUrl);
    assert.equal(await page.evaluate(()=>window.documentIdentity),'original-document');
   }
   await page.locator('#tab-china').focus();
   await page.keyboard.press('ArrowRight');
   assert.equal(await page.locator('#tab-us').getAttribute('aria-selected'),'true');
   await page.keyboard.press('Home');
   await page.waitForTimeout(100);
   assert.equal(requests,0);assert.equal(navigations,0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.locator('#china .card').count(),1);
   console.log(`PASS ${width}px: all tabs, keyboard, no requests/navigation, same document, no overflow`);
   await page.close();
  }
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
