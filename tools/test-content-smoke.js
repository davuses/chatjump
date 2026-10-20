/**
 * End-to-end smoke test — run with: node tools/test-content-smoke.js
 *
 * Boots the real extension (all three scripts, in manifest order) inside jsdom
 * against the Aug 2026 ChatGPT markup, with a stubbed chrome.storage. This is
 * the check that the pieces actually wire together: the unit tests can all
 * pass while the sidebar still fails to render.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

let failures = 0;
let checks = 0;

function check(label, cond, detail) {
  checks++;
  if (cond) return;
  failures++;
  console.error(`  FAIL  ${label}${detail ? `\n        ${detail}` : ""}`);
}

function eq(label, actual, expected) {
  check(label, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

const ROOT = path.join(__dirname, "..");
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));
const SCRIPTS = MANIFEST.content_scripts[0].js;

function turn(n, role, uid, inner) {
  return `
    <div data-turn-id-container="${uid}" data-is-intersecting="true">
      <section dir="auto" data-turn-id="${uid}" data-turn-id-container="${uid}"
               data-testid="conversation-turn-${n}" data-turn="${role}"
               class="text-token-text-primary w-full R6Vx5W_threadScrollSection">
        <div class="text-base my-auto mx-auto">
          <div data-conversation-screenshot-content="" class="mx-auto flex-1 group/turn-messages">
            <div class="flex max-w-full flex-col gap-4 grow">
              <div data-message-author-role="${role}" data-message-id="${uid}" dir="auto"
                   ${role === "assistant" ? 'data-message-model-slug="gpt-5-5"' : ""}
                   class="min-h-8 text-message relative flex w-full flex-col gap-2">
                ${inner}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>`;
}

function userTurn(n, uid, text) {
  return turn(
    n,
    "user",
    uid,
    `<div class="flex w-full flex-col gap-1 empty:hidden items-end">
       <div class="rounded-[22px] user-message-bubble-color">
         <div class="whitespace-pre-wrap">${text}</div>
       </div>
     </div>`
  );
}

function assistantTurn(n, uid, text) {
  return turn(
    n,
    "assistant",
    uid,
    `<div class="flex w-full flex-col gap-1 empty:hidden">
       <div class="markdown prose dark:prose-invert w-full markdown-new-styling">
         <p data-start="0" data-end="20">${text}</p>
       </div>
     </div>`
  );
}

const THREAD = `
  <div class="contents" role="presentation">
    <div id="thread" class="group/thread flex flex-col min-h-full">
      <div class="composer-parent flex flex-1 flex-col">
        <div class="flex min-h-0 grow flex-col text-sm">
          <!-- Turn numbers start at 11: this is a window into the middle of a
               long conversation, so earlier turns can still be revealed. -->
          <div class="qMYqUG_convSearchResultHighlightRoot" id="turn-host">
            ${userTurn(11, "u-1", "First question about pointers")}
            ${assistantTurn(12, "a-1", "A pointer stores an address.")}
            ${userTurn(13, "u-2", "Second question about references")}
            ${assistantTurn(14, "a-2", "A reference is an alias.")}
          </div>
        </div>
      </div>
    </div>
  </div>
  <form data-type="unified-composer">
    <div id="prompt-textarea" contenteditable="true" data-placeholder="Ask anything"></div>
    <button data-testid="send-button"></button>
  </form>
`;

function boot() {
  const dom = new JSDOM(`<!doctype html><html class="dark"><body><main>${THREAD}</main></body></html>`, {
    url: "https://chatgpt.com/c/6a2f272b-9650-83ea-a7d7-c260073705c8",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;

  Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 50 });
  Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 300 });
  window.HTMLElement.prototype.scrollIntoView = function () {};

  const store = {};
  window.chrome = {
    storage: {
      local: {
        get(keys, cb) {
          const out = {};
          for (const k of [].concat(keys)) if (k in store) out[k] = store[k];
          cb(out);
        },
        set(obj, cb) {
          Object.assign(store, obj);
          if (cb) cb();
        }
      }
    }
  };

  const ctx = dom.getInternalVMContext();
  for (const rel of SCRIPTS) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), ctx, { filename: rel });
  }
  const evaluate = (expr) => vm.runInContext(expr, ctx);
  return { dom, window, store, evaluate };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const { window, store, evaluate } = boot();
  const doc = window.document;

  // content.js defers init by 600ms, then debounces scans.
  await wait(1500);

  // Ordering has two paths — absolute turn numbers, and reconciled relative
  // ranks if those are unavailable. The rank fallback is good enough to keep
  // this whole test green on its own, so assert the primary path explicitly:
  // otherwise a broken turn-number selector downgrades us silently.
  eq("primary path: strategy resolved from the role attribute", evaluate("CGXDom.currentStrategy()"), "author-role");
  eq(
    "primary path: turn numbers are readable",
    evaluate("CGXDom.turnNumber(document.querySelector(\"[data-message-id='u-2']\"))"),
    13
  );

  const sidebar = doc.getElementById("cgx-sidebar");
  check("sidebar is injected", !!sidebar);
  check("sidebar is visible by default", sidebar && !sidebar.classList.contains("cgx-hidden"));

  const items = doc.querySelectorAll("#cgx-list .cgx-item");
  eq("both questions are listed", items.length, 2);
  eq("first item keeps its position", items[0]?.querySelector(".meta span")?.textContent, "#1");
  eq("first question text", items[0]?.querySelector(".q")?.textContent, "First question about pointers");
  eq("second question text", items[1]?.querySelector(".q")?.textContent, "Second question about references");

  eq("no individual folding controls", doc.querySelectorAll("button.cgx-toggle").length, 0);
  eq("no bulk folding controls", doc.querySelectorAll("#cgx-collapse-all, #cgx-expand-all").length, 0);
  eq("no hidden answers", doc.querySelectorAll(".cgx-collapsed").length, 0);
  check("no per-conversation data is saved", !Object.keys(store).some(k => k.startsWith("cgx_state")));

  // Search filters the list.
  const search = doc.getElementById("cgx-search");
  search.value = "references";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(250);
  eq("search narrows the list", doc.querySelectorAll("#cgx-list .cgx-item").length, 1);
  search.value = "";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(250);
  eq("clearing search restores the list", doc.querySelectorAll("#cgx-list .cgx-item").length, 2);

  // A question that scrolls out of the DOM must stay in the sidebar — this is
  // the long-conversation behaviour that virtualisation used to break.
  doc.querySelector("[data-turn-id-container='u-1']").remove();
  doc.querySelector("[data-turn-id-container='a-1']").remove();
  await wait(1200);
  eq("virtualised-out question is still listed", doc.querySelectorAll("#cgx-list .cgx-item").length, 2);

  // ...and when it comes back it must not be listed twice.
  const host = doc.getElementById("turn-host");
  host.insertAdjacentHTML(
    "afterbegin",
    userTurn(11, "u-1", "First question about pointers") + assistantTurn(12, "a-1", "A pointer stores an address.")
  );
  await wait(1200);
  const remounted = doc.querySelectorAll("#cgx-list .cgx-item");
  eq("remounting does not duplicate it", remounted.length, 2);
  eq("and it is back in first position", remounted[0]?.querySelector(".q")?.textContent, "First question about pointers");

  host.insertAdjacentHTML("beforeend", userTurn(15, "u-3", "Third question about arrays"));
  await wait(1200);
  eq("new question appended", doc.querySelectorAll("#cgx-list .cgx-item").length, 3);

  // The regression that broke 0.1.3: scrolling up mounts an earlier question
  // for the first time, so it is discovered *last*. It must sort by turn
  // number (first), not by discovery order (last).
  host.insertAdjacentHTML("afterbegin", userTurn(3, "u-0", "Earlier question further up the thread"));
  await wait(1200);
  const all = doc.querySelectorAll("#cgx-list .cgx-item .q");
  eq("earlier question is listed", all.length, 4);
  eq("late-discovered earlier turn sorts first", all[0]?.textContent, "Earlier question further up the thread");
  eq("and the rest keep their order", all[3]?.textContent, "Third question about arrays");

  host.insertAdjacentHTML("beforeend", assistantTurn(99, "a-new", "A new answer stays visible."));
  await wait(1200);
  eq("new answers also have no folding controls", doc.querySelectorAll("button.cgx-toggle, .cgx-collapsed").length, 0);

  console.log(`\n${checks - failures}/${checks} checks passed`);
  process.exit(failures ? 1 : 0);
})();
