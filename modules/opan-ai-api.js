const OpenAI = require("openai")

const OpenAIAPI = (config) => {

  const openAI = new OpenAI({
    baseURL: config.baseURL,
    apiKey: ""
  })

  return {
    reply: async (message) => {
      const stream = await openAI.chat.completions.create(
        {
          stream: false,
          messages: [
            {
              role: "user",
              content: message
            }
          ]
        }
      )

      return stream.choices[0].message.content
    }
  }

}

module.exports = OpenAIAPI
