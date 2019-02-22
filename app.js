const config = require("./config");
const path = require("path");
const url = require("url");
const Bot = require("./bot");

const {app, BrowserWindow, Tray} = require("electron");

let window = null;
let tray = null;
let bot = null;
let log = null;

let position = {};

function Log(sender) {
    this.sender = sender;

    this.info = function (message) {
        if (this.sender) {
            this.sender.send("log", {level: "info", date: new Date(), message});
        }
    };

    this.error = function (message) {
        if (this.sender) {
            this.sender.send("log", {level: "error", date: new Date(), message});
        }
    };
}

// toggle window
const toggleWindow = () => {
    if (window.isVisible()) {
        window.hide();
    } else {
        showWindow();
    }
};

const showWindow = () => {
    window.setPosition(position[0], position[1], false);
    window.show();
    window.focus();
};

app.once("ready", () => {

    tray = new Tray(path.join(__dirname, config.webDir, "icon.png"));
    tray.on("double-click", () => {
        window.close();
        log.info("Bot has stopped");
        process.exit(0);
    });
    tray.on("right-click", toggleWindow);
    tray.on("click", toggleWindow);

    window = new BrowserWindow({
        width: 1000,
        height: 800,
        titleBarStyle: "hiddenInset",
        backgroundColor: "#000",
        show: false,
        icon: path.join(__dirname, config.webDir, "icon.png")
    });

    position = window.getPosition();

    window.loadURL(url.format({
        pathname: path.join(__dirname, config.webDir, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.once("ready-to-show", () => {
        //window.show();
    });

    window.on("close", (event) => {
        position = window.getPosition();
        event.preventDefault();
        window.hide();
    });

    log = new Log(window.webContents);
    bot = new Bot(config, log);
    bot.start();

    console.log("Bot has started");
    console.log("Please press [CTRL + C] to stop");

});

process.on("SIGINT", () => {
    console.log("Bot has stopped");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("Bot has stopped");
    process.exit(0);
});