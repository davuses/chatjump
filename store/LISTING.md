# Chrome Web Store listing draft

**Name:** ChatJump — Conversation Navigator

**Summary:** Find and jump to questions in your ChatGPT conversations. A searchable table of contents that keeps every answer fully visible.

**Suggested category:** Productivity (choose the closest available dashboard category)

**Language:** English

## Detailed description

Find your place in long ChatGPT conversations.

ChatJump adds a searchable table of contents containing the questions in your current chat. Click a question to jump to it and briefly highlight it on the page.

• Navigate between questions without endless scrolling.
• Search the question list as you type.
• Keep questions and answers fully visible — no folding controls or collapsed replies.
• Hide or show the panel with Alt+N.
• Choose whether the panel starts hidden.
• Navigate question buttons with your keyboard.

Designed for conversations on chatgpt.com, including conversation URLs inside Projects and custom GPTs. Compatibility depends on ChatGPT's current page layout. For long chats, ChatJump can read the current conversation from ChatGPT's own endpoints to find questions that are not yet rendered; if that request is unavailable, the list falls back to messages discovered on the page.

Your conversation content stays between your browser and ChatGPT. ChatJump does not send it to its developer, use analytics, or serve advertising. Only the panel visibility preference is saved locally.

ChatJump is an independent, open-source project derived from Andrew Ying's MIT-licensed ChatGPT In-Chat Navigator. It is not affiliated with, endorsed by, or sponsored by OpenAI or Google.

## URLs

- Homepage: https://github.com/davuses/chatjump
- Support: https://github.com/davuses/chatjump/issues
- Privacy policy: https://github.com/davuses/chatjump/blob/main/docs/privacy.md

Verify these URLs are public after pushing the release.

## Privacy practices draft

**Single purpose:** Provide a searchable question index and in-page navigation for the current ChatGPT conversation.

**Storage justification:** Save only the user's preference for whether the question panel starts hidden, using chrome.storage.local.

**Site access justification:** The content script runs only on chatgpt.com to read the current conversation, render the panel, and scroll to selected questions. The manifest does not request all-sites access or a separate host_permissions grant.

**Remote code:** No. All executable code is packaged in the extension.

**Data handling:** The extension accesses website content, message IDs, attachment filenames, and the existing ChatGPT session token solely to provide navigation locally. It makes requests only to ChatGPT's own endpoints and does not transmit user data to the developer. Answer the dashboard's exact collection/access questions in accordance with this behavior; do not state that the extension never accesses chat data or authentication information.

**Data sale, advertising, unrelated purposes, creditworthiness:** None.

## Reviewer test instructions

1. Sign in to ChatGPT with your own test account and open a conversation containing at least three questions.
2. Verify ChatJump lists the questions without adding any answer-folding controls.
3. Click each question. It should scroll into view and briefly highlight.
4. Search for part of a question, clear the search, and test Alt+N.
5. Switch conversations and verify the question list updates.
6. Test a long conversation and a conversation inside a Project.

No extension-specific account, purchase, or developer-provided credentials are required.

## Images

- `../icons/icon128.png`: extension icon.
- `promo-440x280.png`: small promotional image.
- `demo-preview.png`: 1280×800 preview of the actual extension running against synthetic sample markup. It is labeled as a demo. Replace it with a screenshot from the packaged extension on a real, non-sensitive ChatGPT test conversation before submission; do not reuse upstream screenshots showing folding controls.
