const wxApp = require('./wxApp')

const getApp = async function (position) {
  const redisApp = await wxApp.getAppByPosition(position)
  const {
    appId,
    appSecret,
    appName,
    id,
  } = redisApp.app
  return {
    appId,
    appSecret,
    appName,
    id,
  }
}

module.exports = exports = getApp