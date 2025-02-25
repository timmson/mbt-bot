const axios = require("axios")
const { convert } = require("html-to-text")

const CrawlerAPI = async (url) => {
  const response = await axios.get(url)
  return convert(response.data, {
      wordwrap: false,
      selectors: [
        { selector: "a", options: { ignoreHref: true } },
        { selector: "button", format: "skip" }
      ]
    }
  )
}

module.exports = CrawlerAPI
