const SystemAPI = require("../modules/system-api")
const NirCmdAPI = require("../modules/nircmd-api")
const systemInformation = require("systeminformation")

jest.mock("../modules/nircmd-api", () => {
  return jest.fn().mockImplementation((command) => {
    if (command === "invalid_command") {
      throw new Error("Invalid command")
    }
    return `Command executed: ${command}`
  })
})

jest.mock("systeminformation", () => ({
  system: jest.fn().mockResolvedValue({ manufacturer: "Test Manufacturer" }),
  cpu: jest.fn().mockResolvedValue({ brand: "Test CPU" }),
  osInfo: jest.fn().mockResolvedValue({ platform: "test_platform" }),
  currentLoad: jest.fn().mockResolvedValue({ cpus: [{ pcpu: 50 }] }),
  mem: jest.fn().mockResolvedValue({ total: 8192 * 1024 * 1024, available: 4096 * 1024 * 1024 }),
  processes: jest.fn().mockResolvedValue({
    list: {
      "test_process": { pcpu: 50, command: "test_command" }
    }
  }),
  fsSize: jest.fn().mockResolvedValue([{ size: 16384 * 1024 * 1024, used: 8192 * 1024 * 1024 }]),
  networkStats: jest.fn().mockResolvedValue([{ rx_bytes: 1024, tx_bytes: 512 }])
}))

describe("SystemAPI", () => {
  afterEach(() => {
    systemInformation.system.mockClear()
    systemInformation.cpu.mockClear()
    systemInformation.osInfo.mockClear()
    systemInformation.currentLoad.mockClear()
    systemInformation.mem.mockClear()
    systemInformation.processes.mockClear()
    systemInformation.fsSize.mockClear()
    systemInformation.networkStats.mockClear()
  })

  it("should send a valid command", async () => {
    const result = await SystemAPI.sendCommand("valid_command")
    expect(result).toBe("Command executed: valid_command")
  })

  it("should handle an invalid command", async () => {
    try {
      await SystemAPI.sendCommand("invalid_command")
    } catch (error) {
      expect(error.message).toBe("Invalid command")
    }
  })

  it("should send a valid key press", async () => {
    const result = await SystemAPI.sendKey("A")
    expect(result).toBe("Command executed: sendkey A press")
  })

  it("should handle an invalid key press", async () => {
    try {
      await SystemAPI.sendKey("")
    } catch (error) {
      expect(error.message).toBe("Invalid command")
    }
  })

  it("should get a valid screen image", async () => {
    const result = await SystemAPI.getScreen("test.png")
    expect(result).toBe("Command executed: savescreenshot test.png")
  })

  it("should handle an invalid screen image name", async () => {
    try {
      await SystemAPI.getScreen("")
    } catch (error) {
      expect(error.message).toBe("Invalid command")
    }
  })

  it("should return an object with all expected properties", async () => {
    const result = await SystemAPI.getInfo()
    expect(result).toHaveProperty("hw")
    expect(result).toHaveProperty("cpu")
    expect(result).toHaveProperty("os")
    expect(result).toHaveProperty("load")
    expect(result).toHaveProperty("memory")
    expect(result).toHaveProperty("process")
    expect(result).toHaveProperty("storage")
    expect(result).toHaveProperty("network")
  })

  it("should handle edge cases in systemInformation functions", async () => {
    systemInformation.system.mockResolvedValue(null)
    systemInformation.cpu.mockResolvedValue(null)
    systemInformation.osInfo.mockResolvedValue(null)
    systemInformation.currentLoad.mockResolvedValue(null)
    systemInformation.mem.mockResolvedValue({})
    systemInformation.processes.mockResolvedValue({ list: [] })
    systemInformation.fsSize.mockResolvedValue([])
    systemInformation.networkStats.mockResolvedValue([])

    const result = await SystemAPI.getInfo()

    expect(result.hw).toBeNull()
    expect(result.cpu).toBeNull()
    expect(result.os).toBeNull()
    expect(result.load).toBeNull()
    expect(result.memory).toEqual({})
    expect(result.process).toEqual([])
    expect(result.storage).toEqual([])
  })

  it("should reject with an error if any systemInformation function fails", async () => {
    systemInformation.system.mockRejectedValue(new Error("System info failed"))

    await expect(SystemAPI.getInfo()).rejects.toThrowError("System info failed")
  })

})

