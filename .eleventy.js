const { DateTime } = require("luxon");
const pluginRss         = require('@11ty/eleventy-plugin-rss')
const pluginNavigation  = require('@11ty/eleventy-navigation')
const syntaxHighlight   = require('@11ty/eleventy-plugin-syntaxhighlight')


const filters           = require('./src/_11ty/filters.js')
const shortcodes        = require('./src/_11ty/shortcodes.js')
const pairedshortcodes  = require('./src/_11ty/paired-shortcodes.js')


module.exports = function (eleventyConfig) {

 	/**
	 * Plugins
	 * @link https://www.11ty.dev/docs/plugins/
	 */
	eleventyConfig.addPlugin(pluginRss)
	eleventyConfig.addPlugin(pluginNavigation)
  	eleventyConfig.addPlugin(syntaxHighlight)



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
			return [...collection.getFilteredByGlob('./src/posts/*.md')]
		else
			return [...collection.getFilteredByGlob('./src/posts/*.md')].filter((post) => !post.data.draft)
	})

/**
 * Tags
 * ================
 * Ripped from Eleventy Base Blog
 * */
 function filterTagList(tags) {
  return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
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
	eleventyConfig.addPassthroughCopy('src/robots.txt')
	eleventyConfig.addPassthroughCopy('src/assets/images/')
	eleventyConfig.addPassthroughCopy('src/assets/svg/')
	eleventyConfig.addPassthroughCopy('src/assets/css/prism*.css')

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