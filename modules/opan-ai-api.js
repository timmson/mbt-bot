const axios = require("axios")
const OpenAI = require("openai")
const { convert } = require("html-to-text")

const OpenAIAPI = (config) => {

  const openAI = new OpenAI({
    baseURL: config.baseURL,
    apiKey: ""
  })

  return {
    reply: async (message) => {

      const messages = []
      if (message.indexOf("http") >= 0) {
        const response = await axios.get(message)
        const data = convert(response.data, { wordwrap: false })
        messages.push(
          { role: "user", content: data },
          { role: "user", content: "Резюмируй, пожалуйста" }
        )
      } else {
        messages.push({ role: "user", content: message })
      }

      const reply = await openAI.chat.completions.create(
        { stream: false, messages: messages }
      )

      return reply.choices[0].message.content
    }
  }
}

module.exports = OpenAIAPI
