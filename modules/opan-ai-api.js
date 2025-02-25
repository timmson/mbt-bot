const axios = require("axios")
const OpenAI = require("openai")
const { convert } = require("html-to-text")

const OpenAIAPI = (config) => {

  const openAI = new OpenAI({
    baseURL: config.baseURL,
    apiKey: ""
  })

  return {
    reply: async (prompts) => {
      const messages = prompts.map((it) => ({ role: "user", content: it }))
      const reply = await openAI.chat.completions.create(
        { stream: false, messages: messages }
      )
      return reply.choices[0].message.content
    }
  }
}

module.exports = OpenAIAPI
