const SystemAPI = require("../modules/system-api");
const nircmd = require("../modules/nircmd-api");

jest.mock("../modules/nircmd-api");

describe("SystemAPI should", () => {

  test("send command", () => {
    SystemAPI.sendCommand("command");
    expect(nircmd).toHaveBeenCalledWith("command");
  });

  test("send key", () => {
    SystemAPI.sendKey("test");
    expect(nircmd).toHaveBeenCalledWith("sendkey test press");
  });

  test("save screenshot", () => {
    SystemAPI.getScreen("image.png");
    expect(nircmd).toHaveBeenCalledWith("savescreenshot image.png");
  });

});