const bytes = require("bytes");
const si = require("systeminformation");
const nircmd = require("nircmd");

class SystemApi {
  static sendCommand (command) {
    return nircmd(command);
  }

  static sendKey (key) {
    return nircmd(["sendkey", key, "press"].join(" "));
  }

  static getScreen (imageName) {
    return nircmd(["savescreenshot", imageName].join(" "));
  }

  static getInfo () {
    return new Promise(async (resolve, reject) => {
      try {
        let data = {
          hw: await si.system(),
          cpu: await si.cpu(),
          os: await si.osInfo(),
          load: await si.currentLoad()
        };
        data.sensors = await si.cpuTemperature();

        data.memory = await si.mem();
        Object.keys(data.memory).forEach(key => {
          data.memory[key] = bytes(data.memory[key]);
        });

        data.process = (await si.processes()).list;
        data.process = Object.keys(data.process).map(p => {
          return {
            cpu: Math.floor(data.process[p].pcpu),
            command: data.process[p].command
          };
        }).filter((row) => row.cpu !== 0).sort((a, b) => a.cpu <= b.cpu).slice(0, 3).reverse();

        data.storage = (await si.fsSize()).map(row => {
          return {
            size: bytes(parseInt(row.size, 10)),
            used: bytes(row.used)
          };
        }
        );

        data.network = await si.networkStats();
        data.network.rx = bytes(data.network.rx);
        data.network.tx = bytes(data.network.tx);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    }
    )
    ;
  }
}

module.exports = SystemApi;
