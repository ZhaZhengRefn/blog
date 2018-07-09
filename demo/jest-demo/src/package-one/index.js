const wxApp = require('./wxApp')

const getApp = async function (position) {
  try {
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
  } catch (error) {
    throw error
  }
}

module.exports = exports = getApp