# ChatJump privacy policy

Effective date: October 20, 2026

ChatJump — Conversation Navigator is maintained by the owner of the [davuses/chatjump repository](https://github.com/davuses/chatjump). Support: [GitHub issues](https://github.com/davuses/chatjump/issues). Do not include private conversation content in public issues.

## Information handled

ChatJump reads questions, message identifiers, and attachment filenames from the open ChatGPT conversation to create a searchable navigation panel. Conversation content is processed temporarily in browser memory. It is not saved to Chrome storage by the extension.

To list questions that ChatGPT has not rendered, ChatJump may request the current conversation from `chatgpt.com/backend-api/conversation/` and obtain a session access token from `chatgpt.com/api/auth/session`. These requests go only to ChatGPT, use your existing signed-in session, and are subject to OpenAI's own policies. The token is cached temporarily in memory and is never saved to disk by ChatJump or sent to the developer.

## Local storage

Chrome's local extension storage saves the preference for whether the navigation panel starts hidden. This preference is not synchronized through Chrome Sync by ChatJump. Removing the extension removes its extension storage through Chrome's normal uninstall process.

## Sharing and tracking

ChatJump does not send conversation content, attachment filenames, session tokens, or preferences to its developer or other third parties. It does not use analytics, advertising, tracking, external processing services, or remote executable code. It does not sell data, use data for advertising, or use data to determine creditworthiness.

The extension's use of user data is limited to its stated purpose: helping you navigate the ChatGPT conversation you are viewing. ChatJump complies with the Chrome Web Store User Data Policy, including its Limited Use requirements.

## Your control

You can disable or uninstall ChatJump at `chrome://extensions`. It does not modify your stored ChatGPT conversations, submit prompts, or delete messages. Data that you independently submit in a public GitHub issue is handled by GitHub under its own policies.

## Changes

Policy updates will be posted in this repository with a revised effective date.
