const execFile = require("child_process").execFile;

class UserAPI {

  constructor (name) {
    this.name = name;
  }

  isEnabled () {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.execute(`Get-LocalUser ${this.name}`);
        let enabledSign = this.extractEnabledSign(response);
        resolve(enabledSign);
      } catch (e) {
        reject(e);
      }
    });
  }

  extractEnabledSign (response) {
    return response.split("\n")[3].split(" ")[1] === "True";
  }

  toggleDisable () {
    return new Promise(async (resolve, reject) => {
      try {
        const isEnabled = await this.isEnabled();
        let parameters = `${(isEnabled ? "Disable" : "Enable")}-LocalUser ${this.name}`;
        await this.execute(parameters);
        resolve(`User ${this.name} is ${!isEnabled ? "enabled" : "disabled"}`);
      } catch (e) {
        reject(e);
      }
    });
  }

  execute (parameters) {
    return new Promise((resolve, reject) =>
      execFile("powershell.exe", parameters.split(" "), (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      })
    );
  }

}

module.exports = UserAPI;