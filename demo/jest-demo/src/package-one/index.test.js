const getApp = require('./index')

//测试套件
describe('getApp', () => {
  const mocks = {
    wxApp: {
      getAppByPosition: jest.fn()
    },
    apps: {
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
    }
  }

  beforeAll(() => {
    jest.mock('./wxApp', () => mocks.wxApp)
  })

  test('getApp with position 1', async () => {
    expect.assertions(4)
    mocks.wxApp.getAppByPosition
    .mockImplementation(position => mocks.apps[position])
        
    const result = await getApp(1)
    expect(result.appId).toBe('1234')
    expect(result.appSecret).toBe('abcd')
    expect(result.appName).toBe('pandaclasszsb')
    expect(result.id).toBe(72)
  })
})