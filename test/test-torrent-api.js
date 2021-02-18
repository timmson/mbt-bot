const TorrentAPI = require("../modules/torrent-api");
const Transmission = require("transmission-promise");
const request = require("request");

jest.mock("fs");
jest.mock("transmission-promise");
jest.mock("request");

class Stream {
  pipe (fileStream) {
    expect(fileStream).not.toBeNull();
    return this;
  }
}

describe("Torrent API should", () => {
  const config = { torrent: {} };
  const torrentAPI = new TorrentAPI(config);

  /*  test("list torrents successfully", () => {
    let expectedList = [];
    expect.assertions(1);
    Transmission.mockImplementation(()=> {
      return {
        get: () => { return Promise.resolve({torrents: expectedList}); }
      };
    });

    return expect(torrentAPI.list()).resolves.toEqual(expectedList);
  });

 */

  test("add torrent successfully", () => {
    expect.assertions(3);

    Stream.prototype.on = (command, cb) => {
      if (command === "finish") {
        cb();
      }
    };
    request.get.mockReturnValue(new Stream());

    expect(Transmission).toHaveBeenCalled();
    return expect(torrentAPI.add("some url")).resolves.toEqual("OK");
  });

  test("add torrent with exception", () => {
    const expectedError = new Error();
    expect.assertions(3);

    Stream.prototype.on = (command, cb) => {
      if (command === "error") {
        cb(expectedError);
      }
    };
    request.get.mockReturnValue(new Stream());

    expect(Transmission).toHaveBeenCalled();
    return expect(torrentAPI.add("some url")).rejects.toEqual(expectedError);
  });

  test("remove torrent successfully", () => {
    expect.assertions(2);

    expect(Transmission).toHaveBeenCalled();
    return expect(torrentAPI.remove()).resolves.toEqual("OK");
  });

  /*  test("remove torrent exception", () => {
    const expectedError = new Error();
    expect.assertions(2);

    Transmission.mockImplementation(() => {
      return {
        remove: () => Promise.reject(expectedError)
      }
    })

    expect(Transmission).toHaveBeenCalled();
    return expect(torrentAPI.remove()).rejects.toEqual(expectedError);
  }); */
});
