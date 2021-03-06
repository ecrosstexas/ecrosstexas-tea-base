const { DateTime } = require('luxon')


/**
 * Setup a current env and timestamp with timezone support
 *  for use in footer and other non-content file locations
 */
module.exports = {
  env: process.env.ELEVENTY_ENV,
  timestamp: new Date(),
  timezone: process.env.TIMEZONE || 'America/Chicago',
  url: process.env.URL || 'http://localhost:8080',
  year: DateTime.local().year,
}
