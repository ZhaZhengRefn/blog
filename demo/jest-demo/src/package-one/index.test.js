const getApp = require('./index')
const Random = require('mockjs').Random

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

  mocks.wxApp.getAppByPosition
  .mockImplementation(position => {
    return new Promise((resolve, reject) => {
      try {
        resolve(mocks.apps[position])
      } catch (error) {
        reject(error)
      }      
    })
  })

  test('getApp with right position', async () => {
    expect.assertions(4)

    const position = Random.integer(1, 2)
    const result = await getApp(position)
    expect(result.appId).toBe('1234')
    expect(result.appSecret).toBe('abcd')
    expect(result.appName).toBe('pandaclasszsb')
    expect(result.id).toBe(72)
  })

  test.only('getApp with wrong position', async () => {
    expect.assertions(1)

    const position = Random.integer(2)
    // try {
    //   await getApp(position)
    // } catch (error) {
    //   expect(error).toEqual(new Error(`>>>getAppByPosition: does not have position-${position}`))
    // }
    expect(getApp(position)).rejects.toThrow(`>>>getAppByPosition: does not have position-${position}`)
  })
})