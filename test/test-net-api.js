const NetAPI = require("../modules/net-api")

const expected = [
  "xx.xxx.xx.xx  -  yy.yyy.yy.yy  -  🌞 21day:3h:36m:10s already",
  "yy.yyy.yy.yy  -  xx.xxx.xx.xx  -  🌙 8h:19m:8s Ago"
]
const arrange = [{
  ip: "xx.xxx.xx.xx",
  mac: "yy.yyy.yy.yy",
  alive: "Y",
  active_time: "21day:3h:36m:10s"
}, {
  ip: "yy.yyy.yy.yy",
  mac: "xx.xxx.xx.xx",
  last_see_time: "8h:19m:8s Ago"
}]

jest.mock("sercomm-rv6699", () =>
  jest.fn().mockImplementation(() => ({
    getDeviceList: () => arrange
  }))
)

describe("NetAPI should", () => {

  test("getDevices", async () => {
    const config = {}

    const netAPI = NetAPI(config)
    const actual = await netAPI.getDevices()

    expect(actual).toEqual(expected)
  })

})
