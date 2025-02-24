const OpenAI = require("openai")
const OpenAIAPI = require("../modules/opan-ai-api")

const expected = "Hello! I'm just a computer program"
const arrange = "Hi! How are you?"

jest.mock("openai", () =>
  jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: (body) => {
          expect(body.messages[0].content).toEqual(arrange)
          return ({
            choices: [
              {
                message: {
                  content: expected
                }
              }
            ]
          })
        }
      }
    }
  }))
)

describe("OpenAI API should", () => {

  test("reply", async () => {
    const config = {
      baseURL: "some url",
      model: "some"
    }

    const openAIAPI = OpenAIAPI(config)
    const actual = await openAIAPI.reply(arrange)

    expect(actual).toEqual(expected)
  })

})
