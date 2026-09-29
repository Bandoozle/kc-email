(function () {
  "use strict";

  var WEBSITE_LABEL = "www.kosick.com";
  var WEBSITE_URL = "https://www.kosick.com";
  var LOCATION = "Vancouver & Calgary, Canada";
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
    var officeMessage = phoneProblem(details.office, "office");
    if (mobileMessage) problems.push({ id: "mobile", message: mobileMessage });
    if (officeMessage) problems.push({ id: "office", message: officeMessage });
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

  function phoneCells(assetBase, kind, display) {
    var file = kind === "mobile" ? "kosick-mobile.png" : "kosick-office.png";
    var alt = kind === "mobile" ? "Mobile phone" : "Office phone";
    var tel = canadianTel(display);
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
    var office = data.office || "";
    var rows = [];

    if (name) {
      rows.push(
        '<tr><td style="padding:0;font-family:' + FONT +
        ';font-size:13px;line-height:17px;font-weight:bold;color:#000000;white-space:nowrap;mso-line-height-rule:exactly;">' +
        escapeHtml(name) +
        "</td></tr>"
      );
    }

    if (mobile || office) {
      var groups = [];
      if (mobile) groups.push(phoneCells(assetBase, "mobile", mobile));
      if (office) groups.push(phoneCells(assetBase, "office", office));
      var separator =
        '<td valign="middle" style="padding:0 6px;vertical-align:middle;' + CONTACT_STYLE + '">|</td>';
      rows.push(
        '<tr><td style="padding:' + (rows.length ? 3 : 0) + 'px 0 0 0;">' +
        "<table " + TABLE + "><tbody><tr>" +
        groups.join(separator) +
        "</tr></tbody></table></td></tr>"
      );
    }

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
    if (data.office) lines.push("Office: " + data.office);
    lines.push("Website: " + WEBSITE_URL);
    lines.push("Location: " + LOCATION);
    SOCIAL.forEach(function (item) {
      lines.push(item.alt + ": " + item.href);
    });
    return lines.join("\n");
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
    WEBSITE_URL: WEBSITE_URL,
    LOCATION: LOCATION,
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
      office: cleanLine(document.getElementById("office").value)
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
    return {
      ok: true,
      html: buildSignatureHtml(data),
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
      return navigator.clipboard.write([new ClipboardItem(payload)]);
    }
    // Call write during the click so the browser still treats it as a user action.
    var firstWrite;
    try {
      firstWrite = attempt({
        "text/html": htmlBlob,
        "text/plain": textBlob
      });
    } catch (error) {
      firstWrite = Promise.reject(error);
    }
    return firstWrite.then(function () {
      return true;
    }).catch(function () {
      return attempt({
        "text/html": Promise.resolve(htmlBlob),
        "text/plain": Promise.resolve(textBlob)
      }).then(function () {
        return true;
      });
    }).catch(function () {
      return false;
    });
  }

  function fallbackCopy(preview, html) {
    preview.innerHTML = html;
    selectNode(preview);
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (error) {
      ok = false;
    }
    return ok === true;
  }

  function init() {
    var form = document.getElementById("signature-form");
    var preview = document.getElementById("signature-preview");
    var previewNote = document.getElementById("preview-note");
    var statusEl = document.getElementById("status");
    var nameInput = document.getElementById("name");
    var mobileInput = document.getElementById("mobile");
    var officeInput = document.getElementById("office");
    var imageWatch = 0;
    var touched = { mobile: false, office: false };

    function showStatus(message, state) {
      statusEl.textContent = message;
      if (state) statusEl.dataset.state = state;
      else delete statusEl.dataset.state;
    }

    function clearStatus() {
      statusEl.textContent = "";
      delete statusEl.dataset.state;
    }

    function render() {
      var details = readDetails();
      var origin = resolveOrigin();
      var assetBase = origin.ok ? origin.origin + "/email-assets/" : "email-assets/";
      preview.classList.remove("is-selected");
      preview.innerHTML = buildSignatureHtml({
        name: details.name || "Your name",
        mobile: details.mobile,
        office: details.office,
        assetBase: assetBase
      });
      if (!origin.ok) {
        previewNote.hidden = false;
        previewNote.dataset.state = "error";
        previewNote.textContent = origin.message;
      } else {
        previewNote.hidden = true;
        previewNote.dataset.state = "";
        previewNote.textContent = "";
      }
      watchImages(origin.ok);
    }

    function watchImages(usingHost) {
      if (!usingHost) return;
      var watchId = ++imageWatch;
      var images = preview.querySelectorAll("img");
      function markFailure() {
        if (watchId !== imageWatch) return;
        previewNote.dataset.state = "error";
        previewNote.textContent =
          "Images did not load from the permanent host. Confirm that /email-assets/ is publicly available at that domain before you send a signature.";
      }
      Array.prototype.forEach.call(images, function (img) {
        if (img.complete && img.naturalWidth === 0) markFailure();
        else img.addEventListener("error", markFailure);
      });
    }

    function showPhoneErrors(problems, force) {
      ["mobile", "office"].forEach(function (id) {
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
      touched.office = true;
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

    [nameInput, mobileInput, officeInput].forEach(function (input) {
      input.addEventListener("input", function () {
        clearStatus();
        showPhoneErrors(detailProblems(readDetails()), false);
        render();
      });
    });

    [mobileInput, officeInput].forEach(function (input) {
      input.addEventListener("blur", function () {
        touched[input.id] = true;
        showPhoneErrors(detailProblems(readDetails()), false);
      });
    });

    document.getElementById("copy-signature").addEventListener("click", function () {
      var exported = exportSignature();
      if (!exported.ok) {
        failExport(exported);
        return;
      }
      showPhoneErrors([], true);
      writeClipboard(exported.html, exported.plain).then(function (copied) {
        if (copied) {
          preview.classList.remove("is-selected");
          showStatus("Signature copied. Paste it into Gmail or Apple Mail.", "success");
          return;
        }
        preview.innerHTML = exported.html;
        var commandCopied = fallbackCopy(preview, exported.html);
        if (commandCopied) {
          preview.classList.remove("is-selected");
          showStatus("Signature copied. Paste it into Gmail or Apple Mail.", "success");
          return;
        }
        preview.classList.add("is-selected");
        showStatus(
          "Automatic copying did not succeed. The signature is selected. Press Command+C (Mac) or Ctrl+C (Windows).",
          "error"
        );
      });
    });

    document.getElementById("download-html").addEventListener("click", function () {
      var exported = exportSignature();
      if (!exported.ok) {
        failExport(exported);
        return;
      }
      showPhoneErrors([], true);
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
