const { DateTime } 		= require("luxon");
const Image 			= require("@11ty/eleventy-img");
const pluginRss         = require('@11ty/eleventy-plugin-rss')
const pluginNavigation  = require('@11ty/eleventy-navigation')
const syntaxHighlight   = require('@11ty/eleventy-plugin-syntaxhighlight')
const embeds 			= require("eleventy-plugin-embed-everything");
const path 				= require('path')

const filters           = require('./src/_11ty/filters/filters.js')
const shortcodes        = require('./src/_11ty/shortcodes/shortcodes.js')
const pairedshortcodes  = require('./src/_11ty/shortcodes/paired-shortcodes.js')

async function imageShortcode(src, alt) {
	let sizes = "(min-width: 1024px) 100vw, 50vw"
	let srcPrefix = `./src/assets/images/`
	src = srcPrefix + src
	console.log(`Generating image(s) from:  ${src}`)
	if(alt === undefined) {
	  // Throw an error on missing alt (alt="" works okay)
	  throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`)
	}
	let metadata = await Image(src, {
	  widths: [600, 900, 1500],
	  formats: ['webp', 'jpeg'],
	  urlPath: "/images/",
	  outputDir: "./_site/images/",
	  /* =====
	  Now we'll make sure each resulting file's name will
	  make sense to you. **This** is why you need
	  that `path` statement mentioned earlier.
	  ===== */
	  filenameFormat: function (id, src, width, format, options) {
		const extension = path.extname(src)
		const name = path.basename(src, extension)
		return `${name}-${width}w.${format}`
	  }
	})
	let lowsrc = metadata.jpeg[0]
	let highsrc = metadata.jpeg[metadata.jpeg.length - 1]
	return `<picture>
	  ${Object.values(metadata).map(imageFormat => {
		return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`
	  }).join("\n")}
	  <img
		src="${lowsrc.url}"
		width="${highsrc.width}"
		height="${highsrc.height}"
		alt="${alt}"
		loading="lazy"
		decoding="async">
	</picture>`
  }


module.exports = function (eleventyConfig) {

	/**
	 * Eleventy Image
	 */
	eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode)
  	eleventyConfig.addLiquidShortcode("image", imageShortcode)
  	// === Liquid needed if `markdownTemplateEngine` **isn't** changed from Eleventy default
  	eleventyConfig.addJavaScriptFunction("image", imageShortcode)

 	/**
	 * Plugins
	 * @link https://www.11ty.dev/docs/plugins/
	 */
	eleventyConfig.addPlugin(pluginRss)
	eleventyConfig.addPlugin(pluginNavigation)
	eleventyConfig.addPlugin(syntaxHighlight)
	eleventyConfig.addPlugin(require("@mikestreety/11ty-utils"))
	eleventyConfig.addPlugin(embeds);



  /**
   * Filters
   * @link https://www.11ty.io/docs/filters/
   */
  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addFilter(filterName, filters[filterName])
  })

 	/**
	 * Shortcodes
	 * @link https://www.11ty.io/docs/shortcodes/
	 */
	Object.keys(shortcodes).forEach((shortcodeName) => {
		eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName])
  })

 	/**
	 * Paired Shortcodes
	 * @link https://www.11ty.dev/docs/languages/nunjucks/#paired-shortcode
	 */
	Object.keys(pairedshortcodes).forEach((shortcodeName) => {
		eleventyConfig.addPairedShortcode(
			shortcodeName,
			pairedshortcodes[shortcodeName]
		)
  })

 	/**
	 * Collections
	 * ============================
	 *
	 * POST Collection set so we can check status of "draft:" frontmatter.
	 * If set "true" then post will NOT be processed in PRODUCTION env.
	 * If "false" or NULL it will be published in PRODUCTION.
	 * Every Post will ALWAYS be published in DEVELOPMENT so you can preview locally.
	 */


	eleventyConfig.addCollection('post', (collection) => {
	if (process.env.ELEVENTY_ENV !== 'production')
  return [...collection.getFilteredByGlob(['./src/content/posts/*.md','./src/content/posts/wp-archives/*.md'])]
	else
		return [...collection.getFilteredByGlob(['./src/content/posts/*.md','./src/content/posts/wp-archives/*.md'])].filter((post) => !post.data.draft)
  })

/**
 * Tags
 * ================
 * Ripped from Eleventy Base Blog
 * */
 function filterTagList(tags) {
  return (tags || []).filter(tag => ["all", "nav", "post", "posts", "page", "pages", "note", "notes", "log"].indexOf(tag) === -1);
}

eleventyConfig.addFilter("filterTagList", filterTagList)

// Create an array of all tags
eleventyConfig.addCollection("tagList", function(collection) {
  let tagSet = new Set();
  collection.getAll().forEach(item => {
    (item.data.tags || []).forEach(tag => tagSet.add(tag));
  });

  return filterTagList([...tagSet]);
});

eleventyConfig.addFilter("readableDate", dateObj => {
  return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
});

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });


	/**
	 * Custom Watch Targets
	 * for when the Tailwind config or .css files change...
	 * by default not watched by 11ty
	 * @link https://www.11ty.dev/docs/config/#add-your-own-watch-targets
	 */
	eleventyConfig.addWatchTarget('./src/assets/css')
	// eleventyConfig.addWatchTarget('./_11ty/*.js')
	eleventyConfig.addWatchTarget('./tailwind.config.js')

 	/**
	 * Passthrough File Copy
	 * @link https://www.11ty.dev/docs/copy/
	 */
	eleventyConfig.addPassthroughCopy('src/*.png')
	eleventyConfig.addPassthroughCopy('src/*.jpg')
	eleventyConfig.addPassthroughCopy('src/*.ico')
	eleventyConfig.addPassthroughCopy({'src/assets/images/': '/images'})
	eleventyConfig.addPassthroughCopy({'src/assets/svg/': '/svg'})
	eleventyConfig.addPassthroughCopy({'src/assets/css/prism*.css': '/css'})
  	eleventyConfig.addPassthroughCopy({'src/content/admin': '/admin'});

  /**
	 * Add layout aliases
	 * @link https://www.11ty.dev/docs/layouts/#layout-aliasing
	 */
	eleventyConfig.addLayoutAlias('base', 'layouts/base.njk')
	eleventyConfig.addLayoutAlias('page', 'layouts/page.njk')
	eleventyConfig.addLayoutAlias('post', 'layouts/post.njk')
	eleventyConfig.addLayoutAlias('author', 'layouts/author.njk')


	return {
		dir: {
			input: 'src',
			output: '_site',
			includes: '_includes',
			data: '_data',
		},
		passthroughFileCopy: true,
		templateFormats: ['html', 'njk', 'md'],
		htmlTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk',
	}
};