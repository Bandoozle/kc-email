const s = require("../public/app.js");
const O = "https://kc-email.vercel.app";
const base = O + "/email-assets/";
let n = 0;
function ok(c, m) { if (!c) throw new Error("FAIL: " + m); n++; }

const html = s.buildSignatureHtml({ name: "Ada Lovelace", mobile: "(604) 555-0199", assetBase: base });
ok(/^<table\b/.test(html), "starts with table");
ok(!/<(html|body|head|meta|style|script|div)\b/i.test(html), "only table markup");
const srcs = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
ok(srcs.length === 8, "eight images, got " + srcs.length);
ok(srcs.every((u) => u.startsWith(base)), "only production host");
ok(new Set(srcs.map((u) => u.split("/").pop())).size === 8, "all eight distinct files");
ok(s.signatureExportProblems(html, O).length === 0, "export problems empty");
ok(s.signatureExportProblems(s.buildSignatureHtml({ name: "A", mobile: "6045550199", assetBase: "email-assets/" }), O).length > 0, "relative paths rejected");
ok(s.signatureExportProblems(s.buildSignatureHtml({ name: "A", mobile: "6045550199", assetBase: "https://kc-email-git-x.vercel.app/email-assets/" }), O).length > 0, "other host rejected");
ok(html.includes('width="88" height="88"') && html.includes("border-right:1px solid #444444"), "layout kept");

// preview image assessment
const files = s.ASSET_FILES;
const good = files.map((f) => ({ src: base + f, complete: true, naturalWidth: 30, naturalHeight: 30 }));
ok(s.assessPreviewImages(good, files).state === "ready", "all loaded ready");
const pending = good.map((r, i) => (i === 2 ? { ...r, complete: false, naturalWidth: 0, naturalHeight: 0 } : r));
let a = s.assessPreviewImages(pending, files);
ok(a.state === "loading" && a.pending[0] === "kosick-office.png", "pending detected");
ok(/still loading: kosick-office\.png/.test(s.imageStatusMessage(a)), "pending message");
const failed = good.map((r, i) => (i === 0 ? { ...r, failed: true } : r));
a = s.assessPreviewImages(failed, files);
ok(a.state === "error" && a.failed[0] === "kosick-logo.png", "failed detected");
ok(/did not load: kosick-logo\.png/.test(s.imageStatusMessage(a)), "failed message");
const zero = good.map((r, i) => (i === 5 ? { ...r, naturalWidth: 0 } : r));
ok(s.assessPreviewImages(zero, files).state === "error", "zero dims error");
ok(s.assessPreviewImages(good.slice(1), files).state === "loading", "missing image not ready");
ok(s.assessPreviewImages(good.map((r) => ({ ...r, src: r.src + "?retry=1" })), files).state === "ready", "retry query ok");

// installed signature inspection
let r = s.inspectInstalledSignature(html, "", O);
ok(r.state === "ok" && r.found.length === 8, "intact paste ok");
ok(/checks copying/.test(r.message) && /test email/.test(r.message), "delivery note");

r = s.inspectInstalledSignature("", "Ada Lovelace\nMobile: (604) 555-0199", O);
ok(r.state === "plain" && /with formatting/.test(r.message), "plain text");

r = s.inspectInstalledSignature(html.replace(/<img[^>]*kosick-facebook\.png[^>]*>/, ""), "", O);
ok(r.state === "problems" && r.missing.join() === "kosick-facebook.png", "missing image");

r = s.inspectInstalledSignature(html.replace(base + "kosick-logo.png", "file:///C:/Users/me/kosick-logo.png"), "", O);
ok(r.state === "problems" && r.broken[0].kind === "file", "file: flagged");

r = s.inspectInstalledSignature(html.replace(base + "kosick-logo.png", "blob:https://kc-email.vercel.app/1234"), "", O);
ok(r.broken[0].kind === "blob", "blob: flagged");

r = s.inspectInstalledSignature(html.replace('src="' + base + "kosick-website.png", 'src="'), "", O);
ok(r.broken.some((b) => b.kind === "empty"), "empty flagged");

r = s.inspectInstalledSignature(html.replace(base + "kosick-logo.png", "https://www.kosick.com/wp-content/uploads/logo.png"), "", O);
ok(r.state === "problems" && r.unexpected.length === 1, "unexpected host flagged");

r = s.inspectInstalledSignature(html.replace(base + "kosick-office.png", "https://kc-email.vercel.app/email-assets/other.png"), "", O);
ok(r.state === "problems" && r.unexpected.length === 1, "changed filename flagged");

r = s.inspectInstalledSignature(html.split(base).join("https://ci3.googleusercontent.com/meips/ADKq_abc=s0-d-e1-ft#" + base), "", O);
ok(r.state === "inconclusive" && r.inconclusive.length === 8 && !r.broken.length, "gmail proxy inconclusive");

r = s.inspectInstalledSignature(html.replace(base + "kosick-logo.png", "cid:image001.png@01DA"), "", O);
ok(r.state === "inconclusive" && r.inconclusive[0].kind === "cid", "cid inconclusive");

r = s.inspectInstalledSignature("<div>Ada Lovelace</div>", "Ada Lovelace", O);
ok(r.state === "problems" && r.missing.length === 8, "formatted but no images");

r = s.inspectInstalledSignature('<img src="x" onerror="alert(1)"><script>alert(2)</script>', "", O);
ok(r.state === "problems", "hostile markup inspected as text");

console.log("unit ok: " + n + " checks");
