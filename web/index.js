const $ = require("jquery");
const {ipcRenderer} = require("electron");
const moment = require("moment");


let log = (data) => {
    let message = [
        "<span class=\"",
        data.level,
        "\">[",
        moment(data.date).format("YYYY-MM-DD HH:mm:ss.SSS"),
        "]  [",
        data.level.toUpperCase(),
        "]</span>  ",
        data.message,
        "<br/>"
    ];
    $("div#log").append(message.join(""));
};

$(() => {

    ipcRenderer.on("log", (event, arg) => {
        $("div#log").append(log(arg));
    });

    log({
        level: "info",
        date: new Date(),
        message: "Bot has started"
    });

});

