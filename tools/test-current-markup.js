const assert = require('node:assert/strict');
const { boot, wait, questionText } = require('./test-api-index');

async function until(predicate, label) {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await wait(30);
  }
  assert.ok(predicate(), label);
}

(async () => {
  for (const apiFails of [false, true]) {
    const { dom, doc, window, evaluate } = boot({ modern: true, apiFails });
    await until(() => doc.querySelector('#cgx-list .cgx-item'), 'sidebar loads');
    assert.equal(evaluate('CGXDom.currentStrategy()'), 'search-unit');
    assert.equal(doc.querySelectorAll('[data-message-id], [data-message-author-role]').length, 0);
    const cards = [...doc.querySelectorAll('#cgx-list .cgx-item')];
    assert.equal(cards.length, apiFails ? 2 : 10, 'API/DOM prompt indexing');
    assert.equal(doc.querySelectorAll('.cgx-toggle, .cgx-collapsed, #cgx-collapse-all, #cgx-expand-all').length, 0);
    const wanted = apiFails ? cards[0] : cards[3];
    const id = wanted.getAttribute('data-cgx-id').replace(/^cgx_/, '');
    wanted.click();
    await until(() => doc.querySelector(`[data-chatgpt-search-message-ids="${id}"].cgx-highlight`), 'current-layout question reached');
    const target = doc.querySelector(`[data-chatgpt-search-message-ids="${id}"]`);
    assert.ok(target.getBoundingClientRect().top >= 0 && target.getBoundingClientRect().top <= 384, 'target visible');
    assert.equal(doc.getElementById('cgx-status').textContent, '');
    if (!apiFails) {
      assert.equal(wanted.querySelector('.q').textContent, questionText(4));
      const first = doc.querySelectorAll('#cgx-list .cgx-item')[0];
      const last = doc.querySelectorAll('#cgx-list .cgx-item')[9];
      first.click();
      last.click();
      await until(() => doc.querySelector('[data-chatgpt-search-message-ids="u-10"].cgx-highlight'), 'latest click wins');
      const host = doc.getElementById('turn-host');
      host.insertAdjacentHTML('beforeend', '<div data-chatgpt-search-message-ids="u-new" data-chatgpt-search-unit-key="fallback-turn-10:0:user"><div data-user-message-bubble="true">A new question</div></div>');
      await until(() => doc.querySelectorAll('#cgx-list .cgx-item').length === 11, 'new-layout mutation detected');
    }
    window.close();
    dom.window.close();
  }
  console.log('Current-layout regressions passed: API, DOM fallback, virtualized jumps, rapid clicks, streaming additions, no folding.');
})().catch(error => { console.error(error); process.exit(1); });
