class LogAPI {

  constructor (sender) {
    this.sender = sender;
  }

  info (message) {
    if (this.sender) {
      this.sender.send("log", { level: "info", date: new Date(), message });
    }
  };

  error (message) {
    if (this.sender) {
      this.sender.send("log", { level: "error", date: new Date(), message });
    }
  };
}

module.exports = LogAPI;