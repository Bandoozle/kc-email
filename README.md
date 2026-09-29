# Kosick Communications email signature

A static generator for Kosick email signatures. Coworkers enter a name and mobile number, preview the signature, and copy it into Gmail or Apple Mail. The office number is always (604) 925-5800. The page and the signature images are hosted together. Signatures do not load images from the Kosick WordPress site.

Nothing is stored or sent to a server. There is no build step, database, or API key.

## Files

- `public/index.html` — generator page
- `public/app.js` — preview, copy, and download
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
3. Choose **Copy signature**. Paste into Gmail or Apple Mail with the normal paste command.
4. **Download HTML** saves a standalone file. Open it in a browser and copy the rendered signature if the mail client drops the formatting. In Apple Mail, Safari is the reliable browser for that second copy.

Gmail: Settings → See all settings → General → Signature. Create a signature, paste, choose defaults for new messages and replies, then Save Changes.

Apple Mail: Mail → Settings → Signatures. Select the work account, add a signature, and turn off “Always match my default message font” if it appears. Paste, set the default signature, and send a test.

Recipients can block remote images. The text and links still show; the logo and icons appear only when images are allowed. Send a test and read the received message before sharing the signature widely.

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
