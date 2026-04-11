/**
 * Načte města a šablony, pro každé město vygeneruje HTML do /output + index.
 */

const fs = require("fs");
const path = require("path");

const TELEFON = "+420 123 456 789";

const SITEMAP_BASE = "https://ondrejmuzikar.github.io/stehovani-cz";

const paths = {
  citiesJson: path.join(__dirname, "data", "cities.json"),
  pageTemplate: path.join(__dirname, "templates", "page.html"),
  indexTemplate: path.join(__dirname, "templates", "index.html"),
  outputDir: path.join(__dirname, "output"),
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const cities = JSON.parse(fs.readFileSync(paths.citiesJson, "utf8"));
const template = fs.readFileSync(paths.pageTemplate, "utf8");
const indexTemplate = fs.readFileSync(paths.indexTemplate, "utf8");

fs.mkdirSync(paths.outputDir, { recursive: true });

let generated = 0;
for (const city of cities) {
  const html = template
    .replaceAll("{{MESTO_1}}", city.mesto_1)
    .replaceAll("{{MESTO_2}}", city.mesto_2)
    .replaceAll("{{MESTO_3}}", city.mesto_3)
    .replaceAll("{{SLUG}}", city.slug)
    .replaceAll("{{KRAJ}}", city.region)
    .replaceAll("{{TELEFON}}", TELEFON)
    .replaceAll("{{POPIS}}", escapeHtml(city.popis));

  const outPath = path.join(paths.outputDir, `stehovani-${city.slug}.html`);
  fs.writeFileSync(outPath, html, "utf8");
  generated += 1;
}

const mestoLinks = cities
  .map((city) => {
    const href = `./stehovani-${escapeHtml(city.slug)}.html`;
    const label = `Stěhování ${escapeHtml(city.mesto_1)}`;
    const region = escapeHtml(city.region);
    return `<li><a href="${href}">${label}</a><span class="region">${region}</span></li>`;
  })
  .join("\n          ");

const indexHtml = indexTemplate
  .replaceAll("{{TELEFON}}", TELEFON)
  .replaceAll("{{MESTO_LINKS}}", mestoLinks);

fs.writeFileSync(path.join(paths.outputDir, "index.html"), indexHtml, "utf8");
generated += 1;

const sitemapUrls = [
  `${SITEMAP_BASE}/index.html`,
  ...cities.map((c) => `${SITEMAP_BASE}/stehovani-${c.slug}.html`),
];

const sitemapBody = sitemapUrls
  .map(
    (loc) =>
      `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  )
  .join("\n");

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapBody}
</urlset>
`;

fs.writeFileSync(path.join(paths.outputDir, "sitemap.xml"), sitemapXml, "utf8");

console.log(`Vygenerováno ${generated} stránek, sitemap: output/sitemap.xml`);
