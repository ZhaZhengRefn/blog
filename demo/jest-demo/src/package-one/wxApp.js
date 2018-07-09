const Apps = {
  1: { //position
    domain: 'wx.pandateacher.com',
    path: '/activity',
    app: {
      appId: '1234',
      appSecret: 'abcd',
      appName: 'pandaclasszsb',
      id: 72
    }
  },
  2: { //positon
    domain: 'wx.pandateacher.com',
    path: '/activity',
    app: {
      appId: '5678',
      appSecret: 'asdf',
      appName: 'pandaclasszsb2',
      id: 49
    }
  }
};

module.exports = exports = {
  getAppByPosition(position) {
    return Promise.resolve(Apps[position])
  }
}