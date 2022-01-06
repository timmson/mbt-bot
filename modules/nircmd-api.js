const fs = require("fs");
const path = require("path");
const execFile = require("child_process").execFile;

module.exports = function (parameters, isCheck = false) {
  return new Promise((resolve, reject) => {
      const command = path.join(__dirname, "nircmd.exe");
      const isCommandExist = fs.existsSync(command);

      if (!isCommandExist) {
        reject(new Error(`Executable file does not exist: ${command}`));
        return;
      }

      if (isCheck) {
        resolve(["Executable file exists", parameters]);
        return;
      }

      execFile(command, parameters.split(" "), (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    }
  );

};