const LogAPI = require("../modules/log-api");

class Sender {
  send(message, details) {
    expect(message).toEqual("log");
    expect(details.level === "info" || details.level === "error").toBeTruthy();
    expect(details.message).toEqual("test");
    expect(details.date).not.toBeNull();
  }
}

describe("LogAPI should", () => {
  const logAPI = new LogAPI(new Sender());

  test("call info", () => {
    expect.assertions(4);
    expect(logAPI.info("test"));
  });

  test("call error", () => {
    expect.assertions(4);
    expect(logAPI.error("test"));
  });
});
