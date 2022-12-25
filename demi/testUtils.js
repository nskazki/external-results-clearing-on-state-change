// taken from https://github.com/vuelidate/vuelidate/blob/5013d34de1/packages/vuelidate/test/unit/test-utils.js

const { version } = require('vue')

const isVue3 = /^3\./.test(version)

module.exports = isVue3
  ? require('@vue/test-utils')
  : require('@vue/test-utils2')

const ifTest = (value) => (value ? it : it.skip)
module.exports.ifVue2 = ifTest(!isVue3)
module.exports.ifVue3 = ifTest(isVue3)
