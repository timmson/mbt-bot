const nircmd = require("../modules/nircmd-api");

describe("nircmd should", () => {

  test("save screenshot", () => {
    expect.assertions(1);
    return nircmd("savescreenshot 1.png", true).then((response) => {
      expect(response).toEqual(["Executable file exists", "savescreenshot 1.png"]);
    });
  });

});