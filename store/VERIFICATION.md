# Release verification — 1.0.3

Checked October 20, 2026.

Refresh button and its handler have been removed in this release. Automatic question detection remains enabled.

The temporary “Finding question…” message is no longer displayed. Failed jumps still provide actionable feedback. Packaging now also extracts the release ZIP into its matching versioned folder under dist.

## Findings

The user's live ChatGPT page exposed `data-chatgpt-search-message-ids`, role-suffixed `data-chatgpt-search-unit-key` values, `data-turn-key` placeholders, and `.thread-scroll-container`. The extension's older lookup paths did not recognize these identifiers. Its API could populate the sidebar while its jump handler failed to locate a corresponding page element. Scroll-container discovery also skipped a scrollable conversation root.

The updated adapter and lookup paths recognize those observed identifiers. Existing attribute-based strategies remain as fallbacks. Folding UI, folding state, answer mutations for folding, and folding CSS are removed.

## Checks completed

- Existing turn-order, DOM-adapter, content-smoke, API-index, and conversation-switch tests: 123/123 checks passed after updating the removed-feature assertions.
- New current-markup regression scenarios: passed with API indexing and DOM-only fallback, virtualized targets, rapid clicks, new-message mutations, and no folding controls.
- Running the current-markup regression against the unmodified upstream source failed at the expected layout-adapter assertion.
- Real unpacked extension in isolated Chromium: passed all four question clicks, keyboard activation, search, hide/show, absence of folding, and no page errors.
- Extracted release ZIP loaded as an extension in isolated Chromium: the same checks passed.
- Runtime syntax, manifest summary length, ZIP file inventory, and git whitespace checks: passed.
- npm audit during dependency installation: zero reported vulnerabilities.

All automated browser tests intercept external requests and use synthetic content. They do not authenticate to ChatGPT. The preview image is a labeled synthetic demonstration, not evidence of a signed-in live release test.

## Before store submission

- Load the packaged extension in the user's signed-in Chrome and check normal chats, Projects, long chats, and switching conversations.
- Capture a real screenshot from a harmless test conversation and replace the demo preview for the listing.
- Register the publisher account and complete Google's requested identity, contact, payment, and privacy fields.
- Submit for review only after those checks. Nothing has been submitted to the Chrome Web Store.
