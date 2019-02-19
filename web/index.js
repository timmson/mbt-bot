$(() => {
    const {ipcRenderer} = require("electron");
    ipcRenderer.on("log", (event, arg) => {
        $("#log").html($("#log").html() + "<br/>" + arg);
    });
});