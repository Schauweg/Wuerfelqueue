const LCUConnector = require('lcu-connector');
const electron = require('electron');
const request = require('request');
const url = require('url');
const path = require('path');

const connector = new LCUConnector();
const { app, BrowserWindow, ipcMain } = require('electron');
const root = __dirname + '/app';
let LCUData;
let win;
let clientActive = false;

function createWindow(){
    win = null;
    LCUData = null;

    win = new BrowserWindow({
        
        width: 300,
        height: 160,
        minWidth: 280,
        minHeight: 140,
        show: false,
        webPreferences: {
            nativeWindowOpen: true,
            nodeIntegration: true
        },
        title: "Würfelqueue",
        backgroundColor: "#010a13",
        icon: root + "/assets/logo.png"
      })
    
    win.setMenu(null);
    win.webContents.openDevTools({ mode: 'detach' });

    win.loadURL(url.format({
        pathname: root + "/index.html",
        protocol: 'file:',
        slashes: true
    }));

    win.webContents.on('did-finish-load', () => {
        win.show();
        if (!LCUData) {
            return;
        }
    });
}

app.on("ready", () => {
    createWindow();
    
    connector.on('connect', (data) => {
        console.log("Connected");
        LCUData = data;
        win.webContents.send("client-connected");
        clientActive = true;
    });

    connector.on('disconnect', () => {
        LCUData = null;
        clientActive = false;
        win.webContents.send("client-disconnected");
    });

    connector.start();
});

ipcMain.on('getSession', (event, arg) => {
    var options = {
        url: `${LCUData.protocol}://${LCUData.address}:${LCUData.port}/lol-champ-select/v1/session`,
        method: "GET",
        auth: {
            "user": LCUData.username,
            "pass": LCUData.password
        },
        headers: {
            'Accept': 'application/json'
        },
        json: true,
        rejectUnauthorized: false
    };

    request(options, (error, response, data) => {
        if (error || response.statusCode != 200) {
            event.returnValue = null;
        } else {
            event.returnValue = data;
        }
    });
});

ipcMain.on('getPickableChamps', (event, arg) => {
    var options = {
        url: `${LCUData.protocol}://${LCUData.address}:${LCUData.port}/lol-champ-select/v1/pickable-champions`,
        method: "GET",
        auth: {
            "user": LCUData.username,
            "pass": LCUData.password
        },
        headers: {
            'Accept': 'application/json'
        },
        json: true,
        rejectUnauthorized: false
    };

    request(options, (error, response, data) => {
        if (error || response.statusCode != 200) {
            event.returnValue = null;
        } else {
            event.returnValue = data;
        }
    });
});

ipcMain.on('pickChamp', (event, arg) => {
    var options = {
        url: `${LCUData.protocol}://${LCUData.address}:${LCUData.port}/lol-champ-select/v1/session/actions/${arg.id}`,
        method: "PATCH",
        auth: {
            "user": LCUData.username,
            "pass": LCUData.password
        },
        headers: {
            'Accept': 'application/json'
        },
        json: true,
        body: arg.body,
        rejectUnauthorized: false
    };

    request(options, (error, response, data) => {
        retData = data;
        retResponse = response;
        if (error || response.statusCode != 204) {
            
        } else {
            event.returnValue = data;
            return;
        }
    });
});

ipcMain.on("is-client-active", (event, arg) => {
    event.returnValue = clientActive;
});

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});