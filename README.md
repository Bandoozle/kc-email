# Kosick Communications email signature

A static generator for Kosick email signatures. Coworkers enter a name and mobile number, preview the signature, and copy it into Gmail or Apple Mail. The office number is always (604) 925-5800. The page and the signature images are hosted together. Signatures do not load images from the Kosick WordPress site.

Nothing is stored or sent to a server. There is no build step, database, or API key.

## Files

- `public/index.html` — generator page
- `public/app.js` — preview, image checks, copy, download, and installed-signature check
- `public/config.js` — permanent image host
- `public/email-assets/` — logo and icons used in signatures
- `vercel.json` — serves `public` with no build

## Preview locally

From this folder, serve the `public` directory:

```bash
npx --yes serve public
```

Open the URL it prints. Copied and downloaded signatures load images from `https://kc-email.vercel.app/email-assets/`.

## Deploy on Vercel

Do not point `productionOrigin` at a preview deployment. Preview URLs change, and mail already sent would keep requesting the old address.

`vercel.json` sets:

- Framework: Other (`framework` is `null`)
- Install command: none
- Build command: none
- Output directory: `public`

### Vercel CLI

1. Install the [Vercel CLI](https://vercel.com/docs/cli) and log in.
2. From this folder, run `vercel`.
3. Accept the settings from `vercel.json`, or choose Framework preset **Other**, an empty build command, and output directory **public**.
4. Open the production domain and confirm this address loads in a private window, with no Vercel login:

   `https://kc-email.vercel.app/email-assets/kosick-logo.png`

`productionOrigin` in `public/config.js` is `https://kc-email.vercel.app`. Leave that value in place.

### Import a Git repository

1. Push this project to Git.
2. In Vercel, import the repository.
3. Framework preset: **Other**.
4. Build command: leave empty.
5. Output directory: **public**.
6. Install command: leave empty.
7. Deploy. `productionOrigin` is already `https://kc-email.vercel.app`.

### Keep the images public

Signature images must load without Vercel Authentication. In the project, open **Settings → Deployment Protection** and leave **Production** public. Preview deployments can stay protected.

Check each file in a private window:

- `/email-assets/kosick-logo.png`
- `/email-assets/kosick-mobile.png`
- `/email-assets/kosick-office.png`
- `/email-assets/kosick-website.png`
- `/email-assets/kosick-location.png`
- `/email-assets/kosick-instagram.png`
- `/email-assets/kosick-facebook.png`
- `/email-assets/kosick-linkedin.png`

### Keep the addresses stable

After people start using signatures, do not change the production domain and do not rename or remove files in `/email-assets/`. You can update the generator and redeploy. Existing messages request those exact image addresses.

If `productionOrigin` is missing or not a public HTTPS address, copying and downloading are blocked and the page shows a configuration error.

## Use the generator

1. Enter the full name and a mobile number. The mobile number must be 10 digits, or 11 digits starting with 1. The office number is fixed at (604) 925-5800. Every signature includes both numbers and the `|` separator.
2. Website, location, and social links stay the same for everyone.
3. Wait for the preview images to load. **Copy signature** and **Download HTML** stay blocked until all eight images from `https://kc-email.vercel.app/email-assets/` have loaded with real dimensions. If one fails, the page names the file and shows **Retry images**.
4. Choose **Copy signature**. Paste it normally (Ctrl+V or Command+V) into Gmail or Apple Mail. Do not use paste without formatting.
5. Save your mail settings.
6. Copy the saved signature back out of Gmail or Apple Mail and paste it into **Check installed signature**.
7. Send yourself a test email and read the received message.

**Download HTML** saves a standalone file. Open it in a browser and copy the rendered signature if the mail client drops the formatting. In Apple Mail, Safari is the reliable browser for that second copy.

Gmail: Settings → See all settings → General → Signature. Create a signature, paste normally, choose defaults for new messages and replies, then Save Changes.

Apple Mail: Mail → Settings → Signatures. Select the work account, add a signature, and turn off “Always match my default message font” if it appears. Paste normally, set the default signature, and close Settings so it saves.

### How copying works

The copied data has two formats: `text/html` containing only the signature table (inline styles, absolute HTTPS image URLs on the production host) and `text/plain` with the same details as text.

- Browsers with the Clipboard API write both formats with `navigator.clipboard.write`.
- Browsers without it, or when that write is rejected, use a temporary `copy` event handler that sets both formats. The handler is removed right after.
- If the browser rejects both, the page says nothing was copied and shows **Select signature for manual copy**. That selects the signature so you can press Command+C or Ctrl+C.

### Check installed signature

Paste your saved signature into the check box. The page reads the pasted HTML as text and never renders it. It reports:

- Whether all eight production image addresses are still present.
- Missing images, and `file:`, `blob:`, empty, or unexpected image addresses. These mean the copy went wrong; copy again with formatting.
- `cid:` attachments and mail-provider image proxies (for example Gmail's `googleusercontent.com`) as inconclusive. Mail clients often rewrite images this way, so this is not treated as broken.
- A plain-text-only paste. That means formatting was lost; copy again and paste normally.

This checks what was copied into your mail settings. It does not check delivery. Only a received test email shows what recipients see.

Recipients can block remote images, and email clients render HTML differently. The generator cannot guarantee how every client displays the signature and does not bypass image blocking. The text and links still show; the logo and icons appear only when images are allowed. Send a test and read the received message before sharing the signature widely.

## Tests

`tests/signature-check.js` checks the signature builder, image-load assessment, and installed-signature inspection. It needs only Node:

```bash
node tests/signature-check.js
```

## Image credits

`kosick-logo.png` is the Kosick Communications mark. It is stored with this generator so signature images keep working if kosick.com is moved or rebuilt.

These icons are from [Icons8](https://icons8.com). Free use includes a link to Icons8. That credit is on the generator page and in this file. It is not added inside the signature.

| File | Icon |
| --- | --- |
| `kosick-mobile.png` | iPhone |
| `kosick-office.png` | Phone |
| `kosick-website.png` | Globe |
| `kosick-location.png` | Marker |
| `kosick-instagram.png` | Instagram |
| `kosick-facebook.png` | Facebook |
| `kosick-linkedin.png` | LinkedIn |
