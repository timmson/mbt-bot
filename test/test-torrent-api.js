const axios = require("axios")
const Transmission = require("transmission-promise")
const bytes = require("bytes")
const TorrentAPI = require("../modules/torrent-api")

jest.mock("fs")
jest.mock("bytes")
jest.mock("axios")

jest.mock("transmission-promise", () => {
  return jest.fn().mockImplementation(() => ({
    get: () => ({ torrents: [{ id: 1, files: [{ name: "" }] }] }),
    remove: () => {

    }
  }))
})

class Stream {
  pipe (fileStream) {
    expect(fileStream).not.toBeNull()
    return this
  }
}

describe("Torrent API should", () => {
  const config = { torrent: { doneDir: "" } }
  const torrentAPI = new TorrentAPI(config)

  test("list all torrents successfully", async () => {
    const expectedList = [{ id: 1, name: "test-torrent" }]

    const result = await torrentAPI.list()

    expect(result).toEqual([
      {
        id: 1,
        name: undefined,
        percentDone: "NaN%",
        sizeWhenDone: undefined,
        status: undefined,
        files: [{ name: ".", "sizeWhenDone": undefined }]
      }
    ])
  })

  test("add torrent successfully", () => {
    expect.assertions(3)

    Stream.prototype.on = (command, cb) => {
      if (command === "finish") {
        cb()
      }
    }
    axios.get.mockReturnValue({ data: new Stream() })

    expect(Transmission).toHaveBeenCalled()
    return expect(torrentAPI.add("some url")).resolves.toEqual("OK")
  })

  test("add torrent with exception", () => {
    const expectedError = new Error()
    expect.assertions(3)

    Stream.prototype.on = (command, cb) => {
      if (command === "error") {
        cb(expectedError)
      }
    }
    axios.get.mockReturnValue({ data: new Stream() })

    expect(Transmission).toHaveBeenCalled()
    return expect(torrentAPI.add("some url")).rejects.toEqual(expectedError)
  })

  test("remove torrent successfully", () => {
    expect.assertions(2)

    expect(Transmission).toHaveBeenCalled()
    return expect(torrentAPI.remove()).resolves.toEqual("OK")
  })

  /*  test("remove torrent exception", () => {
    const expectedError = new Error()
    expect.assertions(2)

    Transmission.mockImplementation(() => {
      return {
        remove: () => Promise.reject(expectedError)
      }
    })

    expect(Transmission).toHaveBeenCalled()
    return expect(torrentAPI.remove()).rejects.toEqual(expectedError)
  }) */
})
