(function () {
  "use strict";

  function decodeObfuscated(value) {
    return value
      .replace(/[a-zA-Z]/g, function (c) {
        var code = c.charCodeAt(0) + 13;
        var limit = c <= "Z" ? 90 : 122;
        return String.fromCharCode(limit >= code ? code : code - 26);
      })
      .replace(/5/g, ":")
      .replace(/7/g, "@")
      .replace(/2/g, ".");
  }

  function revealEmail(link) {
    link.href = decodeObfuscated(link.getAttribute("data-obfuscated-mail"));
  }

  document.querySelectorAll("[data-obfuscated-mail]").forEach(function (link) {
    link.addEventListener("mouseover", function () {
      revealEmail(link);
    });
    link.addEventListener("focus", function () {
      revealEmail(link);
    });
    link.addEventListener("click", function () {
      revealEmail(link);
    });
  });

  document.querySelectorAll(".popup-link").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      window.open(
        link.href,
        "Citation",
        "noopener,noreferrer,titlebar=no,menubar=no,scrollbars=no,resizable=yes,width=1250,height=300,status=no,location=no,toolbar=no"
      );
    });
  });
})();
