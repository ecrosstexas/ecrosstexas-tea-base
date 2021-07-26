const CleanCSS = require('clean-css')
const { DateTime } = require('luxon')


module.exports = {

 	/**
	 * Filters
	 * @link https://www.11ty.dev/docs/filters/
	 */

	/**
	 * dateToFormat allows specifiying display format at point of use.
	 * Example in footer: {{ build.timestamp | dateToFormat('yyyy') }} uses .timestamp
	 *  from the _data/build.js export and formats it via dateToFormat.
	 * Another usage example used in layouts: {{ post.date | dateToFormat("LLL dd, yyyy") }}
	 * And finally, example used in /src/posts/posts.json to format the permalink
	 *  when working with old /yyyy/MM/dd/slug format from Wordpress exports
	 */
	dateToFormat: (date, format) => {
		return DateTime.fromJSDate(date, {
			zone: 'utc',
		}).toFormat(String(format))
  },

  /**
   * Inline and Minify CSS in src/_includes/layouts/base.njk
   */
  cssmin: (code) => {
    return new CleanCSS({}).minify(code).styles
	},

      /**
   * Pass ` | (x)` to a Collection loop to  the number returned
   * Alt = ` | reverse | (x)` to return X most recent
   * Took the following filters from
   * @link https://www.youtube.com/watch?v=wV77GwOY22w&feature=share
   */
       limit: (arr, count = 5) => {
        return arr.slice(0, count)
      },

/**
 * Webmetnions, thx Sia.codes
 */
  getWebmentionsForUrl: (webmentions, url) => {
    return webmentions.children.filter(entry => entry['wm-target'] === url)
  },
  size: (mentions) => {
    return !mentions ? 0 : mentions.length
  },
  webmentionsByType: (mentions, mentionType) => {
    return mentions.filter(entry => !!entry[mentionType])
  },
  readableDateFromISO: (dateStr, formatStr = "dd LLL yyyy 'at' hh:mma") => {
    return DateTime.fromISO(dateStr).toFormat(formatStr);
  }

}
