/*
module.exports = {
  staticFileGlobs: [
  'dist/!*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff,woff2}',
	'dist/assets/env/!**',
	'dist/assets/i18n/!**',
	'dist/assets/icons/!**',
	'dist/assets/img/!**',
	'dist/assets/styles/!*.css'
  ],
  root: 'dist',
  stripPrefix: 'dist/',
  navigateFallback: 'dist/index.html',
  maximumFileSizeToCacheInBytes: 6097152
};
*/

module.exports = {
  staticFileGlobs: [
    'dist/assets/env/!**',
    'dist/assets/i18n/!**',
    'dist/assets/icons/!**',
    'dist/assets/img/!**',
    'dist/assets/styles/!*.css'
  ],
  root: 'dist',
  stripPrefix: 'dist/',
  navigateFallback: 'dist/index.html',
  maximumFileSizeToCacheInBytes: 6097152,
  runtimeCaching: [{
    urlPattern: /^https:\/\/pck.azureedge.net\/srkweb\//,
    handler: 'fastest',
    options: {
      cache: {
        name: 'srk-asset-cache'
      }
    }
  }]
};
