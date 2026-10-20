# Publish ChatJump

The code and listing are prepared; this extension has not been submitted or published. A real signed-in Chrome smoke test and final store images remain before submission.

## 1. Test the release locally

Disable the original ChatGPT Navigator extension. At `chrome://extensions`, enable Developer mode, choose Load unpacked, and select the ChatJump repository folder. Reload ChatGPT tabs.

Check every question click in a normal chat, an older long chat, and a chat inside a Project. Test search, newly sent questions, rapid clicks, switching chats, panel hiding, and Alt+N. All answers should remain visible. Check the extension's Errors view in Chrome.

If anything fails, report the layout and symptom without posting private conversation content. Automated tests run against synthetic fixtures and do not replace this signed-in release check.

## 2. Register your developer account

Open the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole). Choose the Google account that should own the extension. Complete developer registration, the developer agreement, the one-time fee, and the account verification steps requested by Google yourself. Do not share passwords, payment information, or verification codes in chat.

Official instructions: [Register](https://developer.chrome.com/docs/webstore/register), [set up your account](https://developer.chrome.com/docs/webstore/set-up-account).

## 3. Finish images and disclosures

Use a harmless ChatGPT test conversation and capture at least one 1280×800 or 640×400 screenshot of the actual packaged extension. Include the question panel and a fully visible answer. The supplied `demo-preview.png` is an explicitly labeled synthetic preview; replace it for final submission.

Use `icons/icon128.png` and `store/promo-440x280.png` for the icon and small promotional image. Review `store/LISTING.md` and the public privacy policy. Enter your own accurate publisher identity, contact email, and any distribution or trader information requested by the dashboard. Do not use the original author's email or identity.

Official image requirements: [Supplying images](https://developer.chrome.com/docs/webstore/images). Privacy guidance: [Privacy policy](https://developer.chrome.com/docs/webstore/program-policies/privacy) and [privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

## 4. Upload and submit

Run `npm run package` from PowerShell. Upload `dist/chatjump-1.0.3.zip` as a new item. Packaging also creates the extracted `dist/chatjump-1.0.3/` folder for Load unpacked. This ZIP has manifest.json at its root and contains only runtime files, icons, and the retained MIT license; it excludes tests, dependencies, Git history, and listing drafts.

Copy the listing text and URLs from `store/LISTING.md`, upload the final images, complete the privacy fields accurately, and review distribution settings. When ready, submit for review. Google's review is required; approval and timing are determined by Google.

Official process: [Publish in the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish).

## Future releases

Increment `manifest.json` and `package.json` versions, rerun checks and manual tests, regenerate the ZIP, and upload to the same store item. Keep the upstream MIT notice intact. Update the privacy policy if data behavior changes.
