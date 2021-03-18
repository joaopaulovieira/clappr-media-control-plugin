/* eslint-disable no-undef */
const svgLoader = require('svg-inline-loader')

module.exports = {
  process(src) {
    return svgLoader(src)
  },
}
