# ChatJump — Conversation Navigator

A searchable question sidebar for ChatGPT. Click a question to jump to it; every question and answer stays fully visible.

Independent MIT-licensed fork of [Andrew Ying's ChatGPT In-Chat Navigator](https://github.com/andrewyying/chatgpt-in-chat-navigator). Not affiliated with OpenAI or Google.

## Install locally

Download the extension ZIP from the [latest GitHub release](https://github.com/davuses/chatjump/releases/latest) and extract it into a permanent folder. No Chrome Web Store developer account is needed.

1. Disable the original ChatGPT Navigator extension to avoid overlapping panels.
2. Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
3. Select the extracted folder (the folder containing `manifest.json`).
4. Reload your ChatGPT tabs. Open a conversation, then click a question in ChatJump.

Use the search field to filter questions. **Alt+N** hides or shows the panel. “Hidden by Default” changes only panel visibility; it never hides conversation content. Question buttons also work with Tab and Enter/Space.

## Changes from upstream

- Removed Collapse All, Expand All, individual folding controls, folding persistence, and answer-hiding styles.
- Added support for the current ChatGPT search-unit message identifiers and thread scroll container, retaining older markup fallbacks.
- Fixed scroll-container discovery when the conversation root itself is scrollable.
- New clicks supersede pending jumps; conversation navigation cancels stale work.
- Added visible jump-failure feedback and accessible question buttons.
- Distinct ChatJump branding, local preferences, and no redundant host permission.

## Development

Requires Node.js 20 or later and npm. No runtime dependency or build step.

```powershell
npm ci
npm test
npx playwright install chromium
npm run test:browser
npm run package
```

The browser test loads the real extension in an isolated Chromium profile, intercepts network traffic, and uses sample conversations. It never signs in or reads your real chats. `store/demo-preview.png` shows this fixture, not a live ChatGPT conversation.

The observed live page structure was inspected on October 20, 2026. Automated coverage includes current and older markup, API failure, virtualized messages, ordering, rapid clicks, search, keyboard activation, and conversation switching. A signed-in test of the packaged release on real ChatGPT is still required before store submission.

## Privacy and publishing

See [Privacy policy](docs/privacy.md), [store listing draft](store/LISTING.md), and [publishing guide](store/PUBLISHING.md). The extension runs only on `https://chatgpt.com/*`. It reads the open conversation locally and may request that conversation from ChatGPT's own endpoints using the browser's existing session. It has no analytics, external services, or remote executable code.

ChatGPT's DOM and private conversation API may change. If a jump fails, reload the ChatGPT tab; if it persists, report the failure without including private chat content. New questions are detected automatically; there is no manual Refresh button.

## Automatic GitHub releases

Push a new version to `main` (or merge a version update into `main`). Keep the versions in `manifest.json`, `package.json`, and `package-lock.json` equal. For example, run `npm version 1.0.4 --no-git-tag-version`, set the manifest version to `1.0.4`, commit, and push.

GitHub Actions checks for an existing release. A new version runs the regression suite, builds the ZIP and extracted folder, tests the packaged extension in Chromium, then creates a public `v<version>` tag and release with the installable ZIP. Failed checks prevent publication. Existing published versions are skipped and never overwritten. The workflow can also be run manually from the Actions tab to retry a failed release. No additional secrets are required.

The first automated release is version 1.0.3. Later releases must increase the version. Ordinary code or documentation pushes with an already published version do not create releases. GitHub publication does not automatically update an unpacked extension in Chrome; download the new ZIP, replace the installed files, and reload the extension and ChatGPT tabs.

## License

MIT. Original copyright and permission notice retained in `LICENSE.txt`.
