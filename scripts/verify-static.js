const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const failures = [];
const fail = (message) => failures.push(message);

const html = read("index.html");
const workflow = read(".github/workflows/htmlcheck.yml");
const config = read("_config.yml");

if (/href=["']javascript:/i.test(html)) {
  fail("index.html must not contain javascript: links");
}

for (const match of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
  const tag = match[0];
  const rel = tag.match(/\brel=["']([^"']*)["']/i);
  const relValues = rel ? rel[1].split(/\s+/) : [];
  if (!relValues.includes("noopener") || !relValues.includes("noreferrer")) {
    fail(`target=_blank link is missing rel="noopener noreferrer": ${tag}`);
  }
}

if (/jquery-1\.12\.4|Bootstrap v3\.3\.7|actions\/setup-ruby@v1|actions\/checkout@v2/.test(html + workflow + read("css/bootstrap.min.css") + read("js/bootstrap.min.js"))) {
  fail("stale jQuery, Bootstrap, or GitHub Action versions are still referenced");
}

for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
  const url = match[1];
  if (url !== url.trim()) {
    fail(`URL has leading or trailing whitespace: ${url}`);
  }

  if (/^(https?:|mailto:|#)/i.test(url) || url.startsWith("data:")) {
    continue;
  }

  const localPath = url.split("#")[0].split("?")[0];
  if (localPath && !fs.existsSync(path.join(root, localPath))) {
    fail(`local href/src target does not exist: ${url}`);
  }
}

if (/^gems:/m.test(config)) {
  fail("_config.yml should use plugins:, not deprecated gems:");
}

if (!/permissions:\s*\n\s+contents:\s+read/m.test(workflow)) {
  fail("htmlcheck workflow should declare read-only contents permission");
}

if (!fs.existsSync(path.join(root, "Gemfile")) || !fs.existsSync(path.join(root, "Gemfile.lock"))) {
  fail("Gemfile and Gemfile.lock are required for reproducible Ruby tooling");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Static verification passed");
