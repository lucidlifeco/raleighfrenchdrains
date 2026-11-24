export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");

  // {% figure "file.svg", "Alt text", "Caption", 800, 460 %}
  // Drop photos in src/img (WebP, under ~100KB) and pass their real width and height.
  eleventyConfig.addShortcode("figure", (src, alt, caption = "", width = 800, height = 460) =>
    `<figure class="fig"><img src="/img/${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async">` +
    (caption ? `<figcaption>${caption}</figcaption>` : "") + `</figure>`);
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // Warn on every build until the real tracking number is in src/_data/site.json
  eleventyConfig.on("eleventy.before", async () => {
    const site = (await import("./src/_data/site.js")).default;
    if (site.phoneIsPlaceholder) {
      console.warn("\n  WARNING: site phone is still a placeholder. Set the call-tracking number in src/_data/site.js before launch.\n");
    }
  });

  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
