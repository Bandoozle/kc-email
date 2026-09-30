(function () {
  "use strict";

  var WEBSITE_LABEL = "www.kosick.com";
  var WEBSITE_URL = "https://www.kosick.com";
  var LOCATION = "Vancouver & Calgary, Canada";
  var OFFICE_PHONE = "(604) 925-5800";
  var OFFICE_TEL = "+16049255800";
  var ASSET_FILES = [
    "kosick-logo.png",
    "kosick-mobile.png",
    "kosick-office.png",
    "kosick-website.png",
    "kosick-location.png",
    "kosick-instagram.png",
    "kosick-facebook.png",
    "kosick-linkedin.png"
  ];
  var SOCIAL = [
    {
      file: "kosick-instagram.png",
      alt: "Instagram",
      href: "https://instagram.com/kosick_communications/"
    },
    {
      file: "kosick-facebook.png",
      alt: "Facebook",
      href: "https://facebook.com/KosickCommunications"
    },
    {
      file: "kosick-linkedin.png",
      alt: "LinkedIn",
      href: "https://www.linkedin.com/company/8485639/"
    }
  ];

  var TABLE =
    'cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;border-spacing:0;"';
  var FONT = "Arial, Helvetica, sans-serif";
  var CONTACT_STYLE =
    "font-family:" + FONT + ";font-size:12px;line-height:16px;color:#555555;white-space:nowrap;mso-line-height-rule:exactly;";
  var LINK_STYLE = "color:#555555;text-decoration:none;" + CONTACT_STYLE;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cleanLine(value) {
    return String(value || "")
      .replace(/[\r\n\t\u00A0]+/g, " ")
      .replace(/^\s+|\s+$/g, "");
  }

  function canadianTel(raw) {
    var digits = String(raw || "").replace(/\D/g, "");
    if (digits.length === 10) return "+1" + digits;
    if (digits.length === 11 && digits.charAt(0) === "1") return "+" + digits;
    return "";
  }

  function phoneProblem(value, kind) {
    var label = kind === "mobile" ? "mobile" : "office";
    var article = kind === "mobile" ? "a" : "an";
    if (!cleanLine(value)) return "Enter " + article + " " + label + " phone number.";
    if (!canadianTel(value)) return "Enter a valid " + label + " phone number.";
    return "";
  }

  function detailProblems(details) {
    var problems = [];
    if (!details.name) problems.push({ id: "name", message: "Enter a full name." });
    var mobileMessage = phoneProblem(details.mobile, "mobile");
    if (mobileMessage) problems.push({ id: "mobile", message: mobileMessage });
    return problems;
  }

  function isPrivateIPv4(host) {
    var match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
    if (!match) return false;
    var parts = [
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      Number(match[4])
    ];
    if (parts.some(function (part) { return part > 255; })) return true;
    var a = parts[0];
    var b = parts[1];
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 255 && b === 255) return true;
    return false;
  }

  function isDisallowedIPv6(host) {
    if (host.indexOf(":") === -1) return false;
    if (host === "::1" || host === "https://example.net/id/garnet") return true;
    if (host.indexOf("fe80:") === 0) return true;
    if (/^f[cd]/.test(host)) return true;
    if (host.indexOf("::ffff:") === 0) {
      return isPrivateIPv4(host.slice("::ffff:".length)) || host.indexOf("::ffff:127.") === 0;
    }
    return false;
  }

  function isTemporaryDeploymentHost(host) {
    if (host.endsWith(".now.sh")) return true;
    if (!host.endsWith(".vercel.app")) return false;
    if (host.indexOf("-git-") !== -1) return true;
    var sub = host.slice(0, -".vercel.app".length);
    var parts = sub.split("-");
    if (parts.length < 3) return false;
    return parts.some(function (part) {
      return part.length >= 9 && /[a-z]/.test(part) && /[0-9]/.test(part);
    });
  }

  function isDisallowedHost(hostname) {
    var host = String(hostname || "")
      .toLowerCase()
      .replace(/^\[|\]$/g, "")
      .replace(/\.$/, "");
    if (!host) return true;
    if (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "127.0.0.1" ||
      host === "host.docker.internal"
    ) {
      return true;
    }
    if (
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host.endsWith(".localdomain") ||
      host.endsWith(".internal")
    ) {
      return true;
    }
    if (isPrivateIPv4(host) || isDisallowedIPv6(host)) return true;
    if (isTemporaryDeploymentHost(host)) return true;
    return false;
  }

  function validateOrigin(input) {
    var value = cleanLine(input);
    if (!value) {
      return {
        ok: false,
        message: "Enter the permanent image host. Use the stable production domain, not a temporary preview or deployment URL."
      };
    }
    if (/^http:\/\//i.test(value)) {
      return { ok: false, message: "Use HTTPS. HTTP addresses are not accepted." };
    }
    var url;
    try {
      url = new URL(value);
    } catch (error) {
      return {
        ok: false,
        message: "Enter a full public HTTPS address, such as https://example.com."
      };
    }
    if (url.protocol !== "https:") {
      return { ok: false, message: "Enter a public HTTPS address." };
    }
    if (url.username || url.password) {
      return { ok: false, message: "Remove the username or password from the address." };
    }
    if (url.search) {
      return { ok: false, message: "Remove the query string. Use only the domain." };
    }
    if (url.hash) {
      return { ok: false, message: "Remove the fragment. Use only the domain." };
    }
    if (url.pathname !== "/" && url.pathname !== "") {
      return { ok: false, message: "Remove the path. Use only the domain." };
    }
    if (isDisallowedHost(url.hostname)) {
      var host = url.hostname.toLowerCase();
      if (isTemporaryDeploymentHost(host)) {
        return {
          ok: false,
          message: "Use the stable production domain, not a temporary preview or deployment URL."
        };
      }
      return {
        ok: false,
        message: "Use the public production domain. Local and private addresses are not accepted."
      };
    }
    return { ok: true, origin: url.origin };
  }

  function imgTag(src, width, height, alt) {
    return (
      '<img src="' + escapeHtml(src) +
      '" width="' + width +
      '" height="' + height +
      '" alt="' + escapeHtml(alt) +
      '" border="0" style="display:block;border:0;outline:none;text-decoration:none;width:' +
      width + "px;height:" + height + 'px;">'
    );
  }

  function contactAnchor(href, text) {
    return (
      '<a href="' + escapeHtml(href) + '" style="' + LINK_STYLE + '"><span style="' + LINK_STYLE + '">' +
      escapeHtml(text) +
      "</span></a>"
    );
  }

  function phoneCells(assetBase, kind, display, explicitTel) {
    var file = kind === "mobile" ? "kosick-mobile.png" : "kosick-office.png";
    var alt = kind === "mobile" ? "Mobile phone" : "Office phone";
    var tel = explicitTel || canadianTel(display);
    var href = tel ? "tel:" + tel : "";
    var icon = imgTag(assetBase + file, 12, 12, alt);
    var iconInner = href
      ? '<a href="' + escapeHtml(href) + '" style="text-decoration:none;border:0;">' + icon + "</a>"
      : icon;
    var textInner = href ? contactAnchor(href, display) : escapeHtml(display);
    return (
      '<td valign="middle" style="padding:0 4px 0 0;vertical-align:middle;">' + iconInner + "</td>" +
      '<td valign="middle" style="padding:0;vertical-align:middle;' + CONTACT_STYLE + '">' + textInner + "</td>"
    );
  }

  function lineRow(padTop, iconHtml, textHtml) {
    return (
      '<tr><td style="padding:' + padTop + 'px 0 0 0;">' +
      "<table " + TABLE + "><tbody><tr>" +
      '<td valign="middle" style="padding:0 4px 0 0;vertical-align:middle;">' + iconHtml + "</td>" +
      '<td valign="middle" style="padding:0;vertical-align:middle;' + CONTACT_STYLE + '">' + textHtml + "</td>" +
      "</tr></tbody></table></td></tr>"
    );
  }

  function buildSignatureHtml(data) {
    var assetBase = data.assetBase;
    var name = data.name || "";
    var mobile = data.mobile || "";
    var rows = [];

    if (name) {
      rows.push(
        '<tr><td style="padding:0;font-family:' + FONT +
        ';font-size:13px;line-height:17px;font-weight:bold;color:#000000;white-space:nowrap;mso-line-height-rule:exactly;">' +
        escapeHtml(name) +
        "</td></tr>"
      );
    }

    var groups = [];
    if (mobile) groups.push(phoneCells(assetBase, "mobile", mobile));
    groups.push(phoneCells(assetBase, "office", OFFICE_PHONE, OFFICE_TEL));
    var separator =
      '<td valign="middle" style="padding:0 6px;vertical-align:middle;' + CONTACT_STYLE + '">|</td>';
    rows.push(
      '<tr><td style="padding:' + (rows.length ? 3 : 0) + 'px 0 0 0;">' +
      "<table " + TABLE + "><tbody><tr>" +
      groups.join(separator) +
      "</tr></tbody></table></td></tr>"
    );

    var websiteIcon = imgTag(assetBase + "kosick-website.png", 12, 12, "Website");
    var websiteLinkedIcon =
      '<a href="' + WEBSITE_URL + '" style="text-decoration:none;border:0;">' + websiteIcon + "</a>";
    rows.push(
      lineRow(
        rows.length ? 3 : 0,
        websiteLinkedIcon,
        contactAnchor(WEBSITE_URL, WEBSITE_LABEL)
      )
    );

    rows.push(
      lineRow(
        3,
        imgTag(assetBase + "kosick-location.png", 12, 12, "Location"),
        escapeHtml(LOCATION)
      )
    );

    var socialCells = SOCIAL.map(function (item, index) {
      var pad = index < SOCIAL.length - 1 ? "0 10px 0 0" : "0";
      var icon = imgTag(assetBase + item.file, 16, 16, item.alt);
      return (
        '<td valign="middle" style="padding:' + pad + ';vertical-align:middle;">' +
        '<a href="' + escapeHtml(item.href) + '" style="text-decoration:none;border:0;">' +
        icon +
        "</a></td>"
      );
    }).join("");

    rows.push(
      '<tr><td style="padding:6px 0 0 0;">' +
      "<table " + TABLE + "><tbody><tr>" +
      socialCells +
      "</tr></tbody></table></td></tr>"
    );

    var logo =
      '<a href="' + WEBSITE_URL + '" style="text-decoration:none;border:0;">' +
      imgTag(assetBase + "kosick-logo.png", 88, 88, "Kosick Communications") +
      "</a>";

    return (
      "<table " + TABLE + "><tbody><tr>" +
      '<td valign="middle" style="padding:0 6px 0 0;vertical-align:middle;border-top:0;border-bottom:0;border-left:0;border-right:1px solid #444444;">' +
      logo +
      "</td>" +
      '<td valign="middle" style="padding:0 0 0 12px;vertical-align:middle;">' +
      "<table " + TABLE + "><tbody>" +
      rows.join("") +
      "</tbody></table></td></tr></tbody></table>"
    );
  }

  function buildPlainText(data) {
    var lines = [];
    if (data.name) lines.push(data.name);
    if (data.mobile) lines.push("Mobile: " + data.mobile);
    lines.push("Office: " + OFFICE_PHONE);
    lines.push("Website: " + WEBSITE_URL);
    lines.push("Location: " + LOCATION);
    SOCIAL.forEach(function (item) {
      lines.push(item.alt + ": " + item.href);
    });
    return lines.join("\n");
  }

  function decodeBasicEntities(value) {
    return String(value || "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  function fileFromImageSrc(src) {
    var value = decodeBasicEntities(cleanLine(src));
    if (!value) return "";
    try {
      var url = new URL(value, "https://kc-email.vercel.app");
      var parts = url.pathname.split("/");
      return parts[parts.length - 1] || "";
    } catch (error) {
      var path = value.split("?")[0].split("#")[0];
      var bits = path.split("/");
      return bits[bits.length - 1] || "";
    }
  }

  function imageRecordStatus(record) {
    if (!record) return "loading";
    if (record.failed) return "error";
    if (!record.complete) return "loading";
    if (!(record.naturalWidth > 0) || !(record.naturalHeight > 0)) return "error";
    return "ready";
  }

  function assessPreviewImages(records, expectedFiles) {
    var expected = expectedFiles || [];
    var pending = [];
    var failed = [];
    var ready = [];
    expected.forEach(function (file) {
      var match = null;
      (records || []).forEach(function (record) {
        if (fileFromImageSrc(record && record.src) === file) match = record;
      });
      var status = imageRecordStatus(match);
      if (!match || status === "loading") pending.push(file);
      else if (status === "error") failed.push(file);
      else ready.push(file);
    });
    return {
      state: failed.length ? "error" : pending.length ? "loading" : "ready",
      failed: failed,
      pending: pending,
      ready: ready
    };
  }

  function imageStatusMessage(assessment) {
    if (!assessment || assessment.state === "ready") return "";
    if (assessment.state === "error") {
      return "These signature images did not load: " + assessment.failed.join(", ") + ". Copying and downloading stay blocked until every image loads.";
    }
    var pending = assessment.pending.length ? ": " + assessment.pending.join(", ") : "";
    return "Signature images are still loading" + pending + ". Copying and downloading stay blocked until they finish.";
  }

  function isMailImageProxy(raw) {
    var url;
    try {
      url = new URL(raw);
    } catch (error) {
      return false;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    var host = url.hostname.toLowerCase();
    var path = url.pathname.toLowerCase();
    if (host === "googleusercontent.com" || host.endsWith(".googleusercontent.com")) return true;
    if (host === "ggpht.com" || host.endsWith(".ggpht.com")) return true;
    if ((host === "google.com" || host.endsWith(".google.com")) && path.indexOf("proxy") !== -1) return true;
    if (host === "attachment.outlook.office.net" || host.endsWith(".outlook.office.net")) return true;
    if (host.endsWith(".protection.outlook.com")) return true;
    if (host === "yimg.com" || host.endsWith(".yimg.com") || host.endsWith(".mail.yahoo.com")) return true;
    if ((host === "icloud.com" || host.endsWith(".icloud.com")) && (path.indexOf("proxy") !== -1 || path.indexOf("image") !== -1)) return true;
    return false;
  }

  function classifyImageReference(raw, origin) {
    var value = decodeBasicEntities(cleanLine(raw));
    if (!value) return { kind: "empty", value: "" };
    var lower = value.toLowerCase();
    if (lower.indexOf("file:") === 0) return { kind: "file", value: value };
    if (lower.indexOf("blob:") === 0) return { kind: "blob", value: value };
    if (lower.indexOf("cid:") === 0) return { kind: "cid", value: value };
    if (isMailImageProxy(value)) return { kind: "proxy", value: value };
    try {
      var url = new URL(value);
      var file = fileFromImageSrc(value);
      var expectedOrigin = String(origin || "").replace(/\/$/, "");
      if (
        url.origin === expectedOrigin &&
        ASSET_FILES.indexOf(file) !== -1 &&
        url.pathname === "/email-assets/" + file
      ) {
        return { kind: "expected", value: value, file: file };
      }
    } catch (error) {
      return { kind: "unexpected", value: value };
    }
    return { kind: "unexpected", value: value };
  }

  function extractImageReferences(html) {
    var refs = [];
    var source = String(html || "");
    var imgRe = /<img\b[^>]*>/gi;
    var match;
    while ((match = imgRe.exec(source))) {
      var tag = match[0];
      var srcMatch = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(tag);
      if (srcMatch) refs.push(srcMatch[1] || srcMatch[2] || srcMatch[3] || "");
      else refs.push("");
      var srcset = /\bsrcset\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
      if (srcset) {
        String(srcset[1] || srcset[2] || "").split(",").forEach(function (part) {
          var url = cleanLine(part).split(/\s+/)[0];
          if (url) refs.push(url);
        });
      }
    }
    var styleRe = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    var styleMatch;
    while ((styleMatch = styleRe.exec(source))) {
      var css = styleMatch[1] || styleMatch[2] || "";
      var urlRe = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"']+))\s*\)/gi;
      var urlMatch;
      while ((urlMatch = urlRe.exec(css))) {
        refs.push(urlMatch[1] || urlMatch[2] || urlMatch[3] || "");
      }
    }
    return refs;
  }

  function shortRef(value) {
    var text = String(value || "");
    if (text.length > 160) return text.slice(0, 157) + "...";
    return text;
  }

  function inspectInstalledSignature(html, plain, origin) {
    var markup = String(html || "");
    var text = String(plain || "");
    var deliveryNote = "This checks copying. A received test email is what checks delivery. Recipients can still block remote images.";
    var hasMarkup = /<\s*(table|img|a|div|span|html|body|p)\b/i.test(markup) || /url\s*\(/i.test(markup);
    if (!hasMarkup) {
      if (cleanLine(text) || cleanLine(markup)) {
        return {
          state: "plain",
          ok: false,
          found: [],
          missing: ASSET_FILES.slice(),
          broken: [],
          unexpected: [],
          inconclusive: [],
          message: "This paste is plain text, so the image addresses were not included. Copy the signature again and paste with formatting. Use the normal paste command, not paste without formatting. " + deliveryNote,
          details: []
        };
      }
      return {
        state: "empty",
        ok: false,
        found: [],
        missing: [],
        broken: [],
        unexpected: [],
        inconclusive: [],
        message: "Paste the signature you saved in Gmail or Apple Mail. " + deliveryNote,
        details: []
      };
    }

    var foundMap = {};
    var broken = [];
    var unexpected = [];
    var inconclusive = [];
    extractImageReferences(markup).forEach(function (ref) {
      var item = classifyImageReference(ref, origin);
      if (item.kind === "expected") foundMap[item.file] = true;
      else if (item.kind === "file" || item.kind === "blob" || item.kind === "empty") broken.push(item);
      else if (item.kind === "cid" || item.kind === "proxy") inconclusive.push(item);
      else unexpected.push(item);
    });
    var found = ASSET_FILES.filter(function (file) { return foundMap[file]; });
    var missing = ASSET_FILES.filter(function (file) { return !foundMap[file]; });
    var details = [];
    if (found.length) details.push("Production image addresses found: " + found.join(", ") + ".");
    if (missing.length) details.push("Production image addresses missing: " + missing.join(", ") + ".");
    broken.forEach(function (item) {
      var label = item.kind === "empty" ? "An image has an empty address." : "Unusable image address (" + item.kind + "): " + shortRef(item.value) + ".";
      details.push(label);
    });
    unexpected.forEach(function (item) {
      details.push("Unexpected image address: " + shortRef(item.value) + ".");
    });
    inconclusive.forEach(function (item) {
      var kindLabel = item.kind === "cid" ? "mail attachment" : "mail-provider image proxy";
      details.push("Inconclusive " + kindLabel + ": " + shortRef(item.value) + ". This is not treated as broken.");
    });

    var state = "ok";
    var message = "All eight signature image addresses still point at " + String(origin || "").replace(/\/$/, "") + "/email-assets/. " + deliveryNote;
    if (broken.length || unexpected.length) {
      state = "problems";
      message = "The pasted signature has image addresses that are missing, empty, local, or not the eight production files. Copy the signature again with formatting. " + deliveryNote;
    } else if (missing.length && inconclusive.length) {
      state = "inconclusive";
      message = "The mail client replaced one or more image addresses with its own attachment or image proxy. That is inconclusive, not proof the images are broken. " + deliveryNote;
    } else if (missing.length) {
      state = "problems";
      message = found.length
        ? "Some production image addresses did not survive the copy. Copy the signature again with formatting. " + deliveryNote
        : "The pasted signature has no signature images. Copy it again with formatting. " + deliveryNote;
    }

    return {
      state: state,
      ok: state === "ok",
      found: found,
      missing: missing,
      broken: broken,
      unexpected: unexpected,
      inconclusive: inconclusive,
      message: message,
      details: details
    };
  }

  function signatureExportProblems(html, origin) {
    var problems = [];
    var markup = String(html || "").replace(/^\s+/, "");
    if (!/^<table\b/i.test(markup)) problems.push({ kind: "wrapper" });
    if (/<\s*script\b|javascript:/i.test(markup)) problems.push({ kind: "script" });
    var inspection = inspectInstalledSignature(markup, "", origin);
    if (!inspection.ok) {
      inspection.missing.forEach(function (file) {
        problems.push({ kind: "missing", file: file });
      });
      inspection.broken.forEach(function (item) {
        problems.push(item);
      });
      inspection.unexpected.forEach(function (item) {
        problems.push(item);
      });
    }
    return problems;
  }

  function standaloneDocument(signatureHtml) {
    return (
      "<!DOCTYPE html>\n" +
      '<html lang="en">\n' +
      "<head>\n" +
      '<meta charset="utf-8">\n' +
      "<title>Kosick Communications email signature</title>\n" +
      "</head>\n" +
      '<body style="margin:16px;background:#ffffff;">\n' +
      signatureHtml +
      "\n</body>\n</html>\n"
    );
  }

  var api = {
    escapeHtml: escapeHtml,
    cleanLine: cleanLine,
    canadianTel: canadianTel,
    phoneProblem: phoneProblem,
    detailProblems: detailProblems,
    validateOrigin: validateOrigin,
    buildSignatureHtml: buildSignatureHtml,
    buildPlainText: buildPlainText,
    standaloneDocument: standaloneDocument,
    assessPreviewImages: assessPreviewImages,
    imageStatusMessage: imageStatusMessage,
    extractImageReferences: extractImageReferences,
    classifyImageReference: classifyImageReference,
    inspectInstalledSignature: inspectInstalledSignature,
    signatureExportProblems: signatureExportProblems,
    ASSET_FILES: ASSET_FILES,
    WEBSITE_URL: WEBSITE_URL,
    LOCATION: LOCATION,
    OFFICE_PHONE: OFFICE_PHONE,
    OFFICE_TEL: OFFICE_TEL,
    SOCIAL: SOCIAL
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof window === "undefined" || typeof document === "undefined") return;

  window.KosickSignature = api;

  function configuredOriginRaw() {
    var config = window.KOSICK_SIGNATURE_CONFIG;
    if (!config || typeof config.productionOrigin !== "string") return "";
    return config.productionOrigin.trim();
  }

  function resolveOrigin() {
    var configured = configuredOriginRaw();
    if (!configured) {
      return {
        ok: false,
        message: "Signature images are not configured. Set productionOrigin in config.js to a public HTTPS address."
      };
    }
    var result = validateOrigin(configured);
    if (!result.ok) {
      return {
        ok: false,
        message: "Signature images are not configured. The productionOrigin in config.js cannot be used. " + result.message
      };
    }
    return result;
  }

  function readDetails() {
    return {
      name: cleanLine(document.getElementById("name").value),
      mobile: cleanLine(document.getElementById("mobile").value),
      office: OFFICE_PHONE
    };
  }

  function exportSignature() {
    var details = readDetails();
    var problems = detailProblems(details);
    var origin = resolveOrigin();
    if (!origin.ok) {
      return {
        ok: false,
        message: origin.message,
        focus: problems.length ? problems[0].id : "",
        problems: problems
      };
    }
    if (problems.length) {
      return {
        ok: false,
        message: problems[0].message,
        focus: problems[0].id,
        problems: problems
      };
    }
    var data = {
      name: details.name,
      mobile: details.mobile,
      office: details.office,
      assetBase: origin.origin + "/email-assets/"
    };
    var html = buildSignatureHtml(data);
    if (signatureExportProblems(html, origin.origin).length) {
      return {
        ok: false,
        message: "The signature could not be built with the production image addresses. Reload the page and try again.",
        focus: "",
        problems: []
      };
    }
    return {
      ok: true,
      html: html,
      plain: buildPlainText(data)
    };
  }

  function selectNode(node) {
    var selection = window.getSelection();
    if (!selection) return;
    var range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function writeClipboard(html, plain) {
    if (!navigator.clipboard || typeof ClipboardItem !== "function" || !navigator.clipboard.write) {
      return Promise.resolve(false);
    }
    var htmlBlob = new Blob([html], { type: "text/html" });
    var textBlob = new Blob([plain], { type: "text/plain" });
    function attempt(payload) {
      try {
        return navigator.clipboard.write([new ClipboardItem(payload)]);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    // Call write during the click so the browser still treats it as a user action.
    return attempt({
      "text/html": htmlBlob,
      "text/plain": textBlob
    }).then(function () {
      return true;
    }).catch(function () {
      return attempt({
        "text/html": Promise.resolve(htmlBlob),
        "text/plain": Promise.resolve(textBlob)
      }).then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    });
  }

  function copyWithEvent(html, plain, selectionNode) {
    return new Promise(function (resolve) {
      var wroteHtml = false;
      var wrotePlain = false;
      // Safari only fires the copy event when something is selected.
      if (selectionNode) selectNode(selectionNode);
      function onCopy(event) {
        try {
          if (!event.clipboardData) return;
          event.clipboardData.setData("text/html", html);
          event.clipboardData.setData("text/plain", plain);
          event.preventDefault();
          wroteHtml = true;
          wrotePlain = true;
        } catch (error) {
          wroteHtml = false;
          wrotePlain = false;
        }
      }
      document.addEventListener("copy", onCopy, true);
      var commandOk = false;
      try {
        commandOk = document.execCommand("copy") === true;
      } catch (error) {
        commandOk = false;
      }
      document.removeEventListener("copy", onCopy, true);
      if (selectionNode && window.getSelection()) window.getSelection().removeAllRanges();
      resolve(commandOk && wroteHtml && wrotePlain);
    });
  }

  function init() {
    var form = document.getElementById("signature-form");
    var preview = document.getElementById("signature-preview");
    var imageStatus = document.getElementById("image-status");
    var imageStatusText = document.getElementById("image-status-text");
    var retryImages = document.getElementById("retry-images");
    var manualCopy = document.getElementById("select-signature");
    var statusEl = document.getElementById("status");
    var nameInput = document.getElementById("name");
    var mobileInput = document.getElementById("mobile");
    var installPaste = document.getElementById("install-paste");
    var installResult = document.getElementById("install-result");
    var installDetails = document.getElementById("install-details");
    var imageWatch = 0;
    var touched = { mobile: false };

    function showStatus(message, state) {
      statusEl.textContent = message;
      if (state) statusEl.dataset.state = state;
      else delete statusEl.dataset.state;
    }

    function clearStatus() {
      statusEl.textContent = "";
      delete statusEl.dataset.state;
    }

    function collectImageRecords() {
      return Array.prototype.map.call(preview.querySelectorAll("img"), function (img) {
        return {
          src: img.currentSrc || img.getAttribute("src") || "",
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          failed: img.getAttribute("data-failed") === "true"
        };
      });
    }

    function presentAssetFiles(records) {
      var seen = [];
      records.forEach(function (record) {
        var file = fileFromImageSrc(record.src);
        if (ASSET_FILES.indexOf(file) !== -1 && seen.indexOf(file) === -1) seen.push(file);
      });
      return seen;
    }

    function publishImageStatus() {
      var origin = resolveOrigin();
      var records = collectImageRecords();
      var assessment = assessPreviewImages(records, presentAssetFiles(records));
      var messages = [];
      if (!origin.ok) messages.push(origin.message);
      var imageMessage = imageStatusMessage(assessment);
      if (imageMessage && (origin.ok || assessment.state === "error")) messages.push(imageMessage);
      if (!messages.length) {
        imageStatus.hidden = true;
        imageStatus.dataset.state = "";
        imageStatusText.textContent = "";
        retryImages.hidden = true;
        return assessment;
      }
      imageStatus.hidden = false;
      imageStatus.dataset.state = assessment.state === "error" || !origin.ok ? "error" : "loading";
      imageStatusText.textContent = messages.join(" ");
      retryImages.hidden = assessment.state !== "error";
      return assessment;
    }

    function imagesBlockExport() {
      var origin = resolveOrigin();
      if (!origin.ok) return { blocked: true, message: origin.message };
      var assessment = assessPreviewImages(collectImageRecords(), ASSET_FILES);
      if (assessment.state !== "ready") {
        return { blocked: true, message: imageStatusMessage(assessment) };
      }
      return { blocked: false, message: "" };
    }

    function render() {
      var details = readDetails();
      var origin = resolveOrigin();
      var assetBase = origin.ok ? origin.origin + "/email-assets/" : "email-assets/";
      preview.classList.remove("is-selected");
      manualCopy.hidden = true;
      preview.innerHTML = buildSignatureHtml({
        name: details.name || "Your name",
        mobile: details.mobile,
        office: OFFICE_PHONE,
        assetBase: assetBase
      });
      watchImages();
    }

    function watchImages() {
      var watchId = ++imageWatch;
      var images = preview.querySelectorAll("img");
      function update() {
        if (watchId !== imageWatch) return;
        publishImageStatus();
      }
      Array.prototype.forEach.call(images, function (img) {
        img.removeAttribute("data-failed");
        function fail() {
          if (watchId !== imageWatch) return;
          img.setAttribute("data-failed", "true");
          update();
        }
        if (img.complete) {
          if (!(img.naturalWidth > 0) || !(img.naturalHeight > 0)) fail();
        } else {
          img.addEventListener("load", update);
          img.addEventListener("error", fail);
        }
      });
      update();
    }

    function retryImageLoad() {
      var stamp = Date.now();
      Array.prototype.forEach.call(preview.querySelectorAll("img"), function (img) {
        var current = img.getAttribute("src") || img.src || "";
        var base = current.split("?")[0];
        img.removeAttribute("data-failed");
        img.src = base + "?retry=" + stamp;
      });
      watchImages();
    }

    function showPhoneErrors(problems, force) {
      ["mobile"].forEach(function (id) {
        var input = document.getElementById(id);
        var error = document.getElementById(id + "-error");
        var problem = (problems || []).filter(function (item) { return item.id === id; })[0];
        if ((force || touched[id]) && problem) {
          error.hidden = false;
          error.textContent = problem.message;
          input.setAttribute("aria-invalid", "true");
          return;
        }
        if (force || touched[id]) {
          error.hidden = true;
          error.textContent = "";
          input.removeAttribute("aria-invalid");
        }
      });
    }

    function failExport(result) {
      touched.mobile = true;
      showPhoneErrors(result.problems || [], true);
      showStatus(result.message, "error");
      if (result.focus) {
        var field = document.getElementById(result.focus);
        if (field) field.focus();
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    [nameInput, mobileInput].forEach(function (input) {
      input.addEventListener("input", function () {
        clearStatus();
        showPhoneErrors(detailProblems(readDetails()), false);
        render();
      });
    });

    [mobileInput].forEach(function (input) {
      input.addEventListener("blur", function () {
        touched[input.id] = true;
        showPhoneErrors(detailProblems(readDetails()), false);
      });
    });

    function readyExport() {
      var exported = exportSignature();
      if (!exported.ok) {
        failExport(exported);
        return null;
      }
      showPhoneErrors([], true);
      var images = imagesBlockExport();
      if (images.blocked) {
        publishImageStatus();
        showStatus(images.message, "error");
        return null;
      }
      return exported;
    }

    var COPIED_MESSAGE =
      "Signature copied with formatting. Paste it normally into Gmail or Apple Mail, save your settings, then use Check installed signature and send a test email.";

    function copyFailed() {
      manualCopy.hidden = false;
      showStatus(
        "The browser did not allow automatic copying, so nothing was copied. Choose Select signature for manual copy, then press Command+C (Mac) or Ctrl+C (Windows).",
        "error"
      );
    }

    function finishCopy(copied) {
      if (copied) {
        manualCopy.hidden = true;
        showStatus(COPIED_MESSAGE, "success");
        return;
      }
      copyFailed();
    }

    document.getElementById("copy-signature").addEventListener("click", function () {
      var exported = readyExport();
      if (!exported) return;
      preview.classList.remove("is-selected");
      var hasModernClipboard =
        navigator.clipboard && typeof navigator.clipboard.write === "function" && typeof ClipboardItem === "function";
      if (!hasModernClipboard) {
        copyWithEvent(exported.html, exported.plain, preview).then(finishCopy);
        return;
      }
      writeClipboard(exported.html, exported.plain).then(function (copied) {
        if (copied) return true;
        return copyWithEvent(exported.html, exported.plain, preview);
      }).then(finishCopy);
    });

    manualCopy.addEventListener("click", function () {
      var exported = readyExport();
      if (!exported) return;
      preview.innerHTML = exported.html;
      preview.classList.add("is-selected");
      selectNode(preview);
      showStatus(
        "The signature is selected. Press Command+C (Mac) or Ctrl+C (Windows) now, then paste normally into your mail settings.",
        "error"
      );
    });

    retryImages.addEventListener("click", function () {
      clearStatus();
      retryImageLoad();
    });

    function showInstallResult(result) {
      installResult.hidden = false;
      installResult.dataset.state = result.state;
      installResult.textContent = result.message;
      installDetails.textContent = "";
      result.details.forEach(function (line) {
        var item = document.createElement("li");
        item.textContent = line;
        installDetails.appendChild(item);
      });
      installDetails.hidden = !result.details.length;
    }

    installPaste.addEventListener("paste", function (event) {
      var data = event.clipboardData;
      if (!data) return;
      event.preventDefault();
      var html = data.getData("text/html") || "";
      var plain = data.getData("text/plain") || "";
      installPaste.value = plain;
      var origin = resolveOrigin();
      showInstallResult(inspectInstalledSignature(html, plain, origin.ok ? origin.origin : ""));
    });

    installPaste.addEventListener("input", function () {
      var origin = resolveOrigin();
      showInstallResult(inspectInstalledSignature("", installPaste.value, origin.ok ? origin.origin : ""));
    });

    document.getElementById("install-clear").addEventListener("click", function () {
      installPaste.value = "";
      installResult.hidden = true;
      installResult.textContent = "";
      installDetails.textContent = "";
      installDetails.hidden = true;
    });

    document.getElementById("download-html").addEventListener("click", function () {
      var exported = readyExport();
      if (!exported) return;
      var blob = new Blob([standaloneDocument(exported.html)], { type: "text/html;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "kosick-signature.html";
      document.body.appendChild(link);
      link.click();
      setTimeout(function () {
        URL.revokeObjectURL(url);
        link.remove();
      }, 2000);
      showStatus("Signature HTML downloaded. Open the file and copy the rendered signature if you need it.", "success");
    });

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
