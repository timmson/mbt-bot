//const LogAPI = require("../modules/log-api");

const execFile = require("child_process").execFile;

describe("CmdAPI should", () => {
  //const logAPI = new LogAPI(new Sender());

  test("call info", () => {

    /**
     * PS C:\WINDOWS\system32> Disable-LocalUser -Name "Alisa"
     * PS C:\WINDOWS\system32> Enable-LocalUser -Name "Alisa"
     * PS C:\WINDOWS\system32> Get-LocalUser Alisa
     */
    /*    execFile(command, parameters.split(" "), (error, stdout) => {
          if (error) {
            reject(error);
          } else {
            resolve(stdout);
          }
        });*/

    expect(true).toBeTruthy();
  });

});