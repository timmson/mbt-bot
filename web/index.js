$(() => {

    const {ipcRenderer} = require("electron");

    ipcRenderer.on("log", (event, arg) => {
        console.log(arg);
        let message = "<span class=\"" + arg.level + "\">[" + new Date(arg.date).toISOString() + "] " + arg.message + "</span>";
        $("div#log").append(message);
    });

});