const TvAPI = require("../modules/tv-api");
const WebOsApi = require("lgtv2");

jest.mock("lgtv2");

describe("TvAPI should", () => {

  const tvList = { "myTv": { "type": "webos" }, "myTvWrong": { "type": "windows" } };
  const tvAPI = new TvAPI(tvList);

  test("list TVs", () => {
    expect(tvAPI.list()).toEqual(Object.keys(tvList));
  });

  test("list command", () => {
    expect(tvAPI.listCommand()).toHaveLength(6);
  });

  test("return error when tv is not in list", () => {
    expect.assertions(1);
    return expect(tvAPI.command("myTvWrong", "power-off")).rejects.toEqual(new Error("Wrong tvName was given - myTvWrong"));
  });

  test("send command successfully", () => {
    const expected = { id: 1 };

    WebOsApi.mockImplementation(() => {
      return {
        on: (name, cb) => {
          if (name === "connect") {
            cb();
          }
        },
        request: (cmd, cb) => {
          expect(cmd).toEqual("ssap://system/turnOff");
          cb(null, expected);
        }
      };
    });

    expect.assertions(2);
    return expect(tvAPI.command("myTv", "power-off")).resolves.toEqual(expected);
  });

  test("handle error connection", () => {
    const expectedError = new Error();

    WebOsApi.mockImplementation(() => {
      return {
        on: (name, cb) => {
          if (name === "error") {
            cb(expectedError);
          }
        }
      };
    });

    expect.assertions(1);
    return expect(tvAPI.command("myTv", "power-off")).rejects.toEqual(expectedError);
  });

  test("handle error command", () => {
    const expectedError = new Error();

    WebOsApi.mockImplementation(() => {
      return {
        on: (name, cb) => cb(),
        request: (cmd, cb) => {
          expect(cmd).toEqual("ssap://system/turnOff");
          cb(expectedError, null);
        }
      };
    });

    expect.assertions(2);
    return expect(tvAPI.command("myTv", "power-off")).rejects.toEqual(expectedError);
  });
});