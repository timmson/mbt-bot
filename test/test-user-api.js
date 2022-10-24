require("child_process");
const UserAPI = require("../modules/user-api");

const name = "Jack";

jest.mock("child_process", () => {
    let status = "True";
    return {
      execFile: function (command, parameters, callback) {
        if (command === "powershell.exe") {
          expect(parameters).toHaveLength(2);
          let result = "OK";
          switch (parameters[0]) {
            case "Get-LocalUser":
              result = "\n" +
                "Name  Enabled Description\n" +
                "----  ------- -----------\n" +
                `Jack ${status}`;
              break;
            case "Enable-LocalUser":
              status = "True";
              break;
            case "Disable-LocalUser":
              status = "False";
              break;
          }
          expect(parameters[1]).toEqual(name);
          callback(null, result);
        }
        callback("fail", null);
      }
    };
  }
);

describe("CmdAPI should", () => {
  const userAPI = new UserAPI(name);

  test("toggle disable", () =>
    new Promise(async (resolve, reject) => {
      try {
        let isEnabled = await userAPI.isEnabled();
        expect(isEnabled).toBeTruthy();

        await userAPI.toggleDisable();

        isEnabled = await userAPI.isEnabled();
        expect(isEnabled).toBeFalsy();

        await userAPI.toggleDisable();

        isEnabled = await userAPI.isEnabled();
        expect(isEnabled).toBeTruthy();

        resolve("OK");
      } catch (e) {
        reject(e);
      }
    })
  );

});