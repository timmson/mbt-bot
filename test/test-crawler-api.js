const axios = require("axios")
const { convert } = require("html-to-text")
const CrawlerAPI = require("../modules/crawler-api")

jest.mock("axios")

describe("CrawlerAPI", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test("should return text content without links and buttons for a valid URL", async () => {
    const mockUrl = "http://example.com"
    const mockHtmlContent = `
      <html>
        <body>
          <a href="http://example.com">Link</a>
          <button>Button</button>
          <p>Some text</p>
        </body>
      </html>
    `
    axios.get.mockResolvedValue({ data: mockHtmlContent })

    const result = await CrawlerAPI(mockUrl)

    expect(result).toEqual("Link\n\nSome text")
  })

  test("should handle a non-existent URL gracefully", async () => {
    const mockUrl = "http://nonexistent.com"
    axios.get.mockRejectedValue(new Error("Request failed with status code 404"))

    try {
      await CrawlerAPI(mockUrl)
    } catch (error) {
      expect(error.message).toEqual("Request failed with status code 404")
    }
  })
})
