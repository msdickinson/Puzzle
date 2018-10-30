"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = require("./Puzzle/Client");
const Logic_1 = require("./Puzzle/Services/Logic");
const Log_js_1 = require("./Puzzle/Services/Log.js");
const Debug_js_1 = require("./Puzzle/Services/Debug.js");
const File_js_1 = require("./Puzzle/Services/File.js");
const Network_js_1 = require("./Puzzle/Services/Network.js");
const UserInput_js_1 = require("./Puzzle/Services/UserInput.js");
const Sound_js_1 = require("./Puzzle/Services/Sound.js");
const View_js_1 = require("./Puzzle/Services/View.js");
class App {
    constructor() {
        this.document = null;
        this.canvas = null;
        this.clients = [];
        this.promises = [];
        this.InactivePlayerTimer = null;
        this.AddPlayersTimer = null;
        this.RemovePlayersTimer = null;
        this.document = null;
        this.canvas = null;
        this.logic = new Logic_1.Logic();
        this.log = new Log_js_1.Log();
        this.file = new File_js_1.File();
        this.debug = new Debug_js_1.Debug();
        this.network = new Network_js_1.Network();
        //  this.server = new Server();
        this.clients = [];
        this.promises = [];
        let viewPromise = new Promise(function (resolve) {
            this.view = new View_js_1.View(this.canvas, resolve);
        }.bind(this));
        let soundPromise = new Promise(function (resolve) {
            this.sound = new Sound_js_1.Sound(resolve);
        }.bind(this));
        let inputPromise = new Promise(function (resolve) {
            this.userInput = new UserInput_js_1.UserInput(this.document, resolve);
        }.bind(this));
        Promise.all([viewPromise, soundPromise, inputPromise]).then(function (values) {
            this.RemovePlayersTimer = setInterval(function () {
                this.clients = [];
            }.bind(this), 5000);
            this.AddPlayersTimer = setInterval(function () {
                //Just Keep adding players
                this.CreatePlayerAndConnectToServer();
                this.CreatePlayerAndConnectToServer();
                this.CreatePlayerAndConnectToServer();
                this.CreatePlayerAndConnectToServer();
                this.CreatePlayerAndConnectToServer();
                this.CreatePlayerAndConnectToServer();
                this.CreatePlayerAndConnectToServer();
                this.CreatePlayerAndConnectToServer();
                this.CreatePlayerAndConnectToServer();
                this.CreatePlayerAndConnectToServer();
                //    if (this.clients.length === 1000) {
                //        clearInterval(this.AddPlayersTimer);
                //        return;
                //    }
                //this.promises.push(new Promise((resolve) => {
                //    this.CreatePlayerAndConnectToServer(resolve);
                //}));
                //if (this.clients.length === 1000) {
                //    Promise.all(this.promises).then(function (values) {
                //    });
                //}
            }.bind(this), 10);
            //for (let i = 0; i < 2; i++) {
            //    promises.push(new Promise(function (resolve) {
            //        CreatePlayerAndConnectToServer(resolve);
            //    }));
            //}
            //Promise.all(this.promises).then(function (values) {
            //});
        }.bind(this));
        this.InactivePlayerTimer = setInterval(this.InactivePlayer.bind(this), 1000);
    }
    CreatePlayerAndConnectToServer(r = null) {
        let client = null;
        client = new Client_1.Client(this.logic, this.log, this.file, this.view, this.userInput, this.network, this.sound, this.debug);
        this.clients.push(client);
        //let client: Client = null;
        //let p1 = null;
        //let p2 = null;
        //p1 = new Promise(function (resolve) {
        //    client = new Client(this.logic, this.log, this.file, this.view, this.userInput, this.network, this.sound, this.debug);
        //    client.ConnectToServer(client.Players[0], resolve);
        //}.bind(this));
        //p1.then(() => {
        //    client.Network.JoinRoom(client.Players[0].Socket);
        //    this.clients.push(client);
        //    if (r !== null) {
        //        r(); 
        //    }
        //});
    }
    RemovePlayers() {
    }
    InactivePlayer() {
        return;
        for (let i = 0; i < this.clients.length; i++) {
            if (this.clients[i].Players[0].NetworkState != null &&
                this.clients[i].Players[0].NetworkState.Inactive &&
                this.clients[i].Players[0].Socket != null &&
                this.clients[i].Players[0].Socket.CLOSED != 1) {
                this.clients[i].Players[0].Socket.close();
            }
        }
        this.clients = this.clients.filter(e => e.Players[0].NetworkState.Inactive !== true);
    }
}
let app = new App();
//# sourceMappingURL=App.js.map