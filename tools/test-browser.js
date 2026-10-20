// Runs the actual unpacked extension in an isolated Chromium profile.
// All network traffic is intercepted; the fixture contains no personal data.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const questions = ['How do JavaScript closures work?', 'When should I use a Map?', 'How can I cancel an async request?', 'What makes a useful regression test?'];
const answers = [
  'A closure keeps access to the variables in its surrounding scope. A function can use those variables even after the outer function has returned.',
  'Use a Map when keys can be values other than strings, when insertion order matters, or when entries are added and removed frequently.',
  'Create an AbortController and pass its signal to fetch. Call abort() when the request is no longer needed. Handle cancellation separately from other failures.',
  'A useful regression test reproduces a real failure, checks the observable result, and continues to pass when the implementation is improved.'
];
const html = `<!doctype html><html class="dark"><meta charset="utf-8"><title>ChatJump demo conversation</title><style>
*{box-sizing:border-box}body{margin:0;background:#212121;color:#ececec;font:16px/1.7 system-ui}header{height:56px;padding:12px 32px;background:#181818;position:fixed;inset:0 0 auto;z-index:2}header small{color:#aaa;margin-left:20px}main{padding-top:56px;height:100vh}.thread-scroll-container{height:100%;overflow-y:auto}.thread-content{max-width:720px;margin-left:65px;padding:35px 25px 100px}.pair{margin-bottom:55px}.user{background:#303030;border-radius:22px;padding:16px 22px;margin-left:65px}h4{font-size:12px;color:#aaa;margin:20px 0 10px}p{margin:0}.answer{padding:20px 0;min-height:230px}code{background:#303030;padding:3px 6px;border-radius:4px}
</style><header>Demo conversation<small>Sample content · ChatJump extension preview</small></header><main><div class="thread-scroll-container"><div class="thread-content">${questions.map((q,i)=>`<div class="pair" data-turn-key="u-${i}"><h4>You said:</h4><div data-chatgpt-search-unit-key="fallback-turn-${i}:0:user" data-chatgpt-search-message-ids="u-${i}"><div class="user" data-user-message-bubble="true">${q}</div></div><div data-chatgpt-search-unit-key="fallback-turn-${i}:2:assistant" data-chatgpt-search-message-ids="a-${i} a-${i}"><h4 data-conversation-role="assistant">ChatGPT said:</h4><div class="answer"><p>${answers[i]}</p></div></div></div>`).join('')}</div></div></main></html>`;

(async () => {
  const extensionRoot = process.env.CHATJUMP_EXTENSION_ROOT || ROOT;
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true, viewport: { width:1280, height:800 },
    args: [`--disable-extensions-except=${extensionRoot}`, `--load-extension=${extensionRoot}`]
  });
  try {
    await context.route('**/*', route => {
      if (route.request().resourceType() === 'document') return route.fulfill({ contentType:'text/html', body:html });
      return route.fulfill({ status:503, contentType:'application/json', body:'{}' });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('https://chatgpt.com/c/chatjump-demo');
    await page.locator('#cgx-list .cgx-item').nth(3).waitFor();
    assert.equal(await page.locator('#cgx-list .cgx-item').count(), 4);
    assert.equal(await page.locator('.cgx-toggle, .cgx-collapsed, #cgx-collapse-all, #cgx-expand-all, #cgx-refresh').count(), 0);
    for (const i of [3,0,2,1]) {
      await page.locator('#cgx-list .cgx-item').nth(i).click();
      await page.locator(`[data-chatgpt-search-message-ids="u-${i}"].cgx-highlight`).waitFor();
      const box = await page.locator(`[data-chatgpt-search-message-ids="u-${i}"]`).boundingBox();
      assert.ok(box.y >= 0 && box.y < 400, `question ${i+1} visible after click: ${box.y}`);
    }
    await page.getByLabel('Search questions', {exact:true}).fill('async');
    await page.waitForFunction(() => document.querySelectorAll('#cgx-list .cgx-item').length === 1);
    assert.ok((await page.locator('#cgx-list .q').textContent()).includes('async'));
    await page.getByLabel('Search questions', {exact:true}).fill('');
    await page.waitForFunction(() => document.querySelectorAll('#cgx-list .cgx-item').length === 4);
    await page.locator('#cgx-list .cgx-item').nth(0).focus();
    await page.keyboard.press('Enter');
    await page.locator('[data-chatgpt-search-message-ids="u-0"].cgx-highlight').waitFor();
    await page.locator('#cgx-hide').click();
    await page.locator('#cgx-show-pill').waitFor();
    await page.keyboard.press('Alt+n');
    await page.waitForFunction(() => !document.querySelector('#cgx-sidebar').classList.contains('cgx-hidden'));
    await page.waitForFunction(() => document.querySelector('#cgx-status').textContent === '');
    await page.waitForFunction(() => !document.querySelector('.cgx-highlight'));
    const output = path.join(ROOT,'store','demo-preview.png');
    fs.mkdirSync(path.dirname(output), {recursive:true});
    await page.screenshot({path:output});
    assert.deepEqual(errors, []);
    console.log('Chromium passed: real extension injection, every question click, keyboard activation, search, hide/show, no folding, no page errors.');
  } finally { await context.close(); }
})().catch(error => {console.error(error);process.exit(1);});
