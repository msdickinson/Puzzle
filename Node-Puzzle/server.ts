const http = require('http');
const express = require('express');

//settings
var port = process.env.port || process.env.PORT || 80;
var version = "1.0.0";

//express server routing
var app = express();
app.use(express.static('public'));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.get('/', function (req, res) {
    res.sendfile('serve/index.html');
});
//http server 
var httpServer = http.createServer(app);
httpServer.listen(port, function () { console.log('***Server(http) listening at port %d *** version %s', httpServer.address().port, version); });


//import { Client } from './Puzzle/Client';

//import { Logic } from './Puzzle/Services/Logic';
//import { Log } from './Puzzle/Services/Log.js';
//import { Network } from './Puzzle/Services/Network.js';
//import { UserInput } from './Puzzle/Services/UserInput.js';
//import { Sound } from './Puzzle/Services/Sound.js';
//import { View } from './Puzzle/Services/View.js';

//class App {
//    private document = null;
//    private canvas = null;

//    private view: View;
//    private sound: Sound;
//    private userInput: UserInput;
//    private logic: Logic;
//    private log: Log;
//    private network: Network;
//    private clients: Client[] = [];
//    private promises = [];

//    private InactivePlayerTimer = null;
//    private AddPlayersTimer = null;
//    private RemovePlayersTimer = null;

//    constructor() {
//        this.document = null;
//        this.canvas = null;

//        this.logic = new Logic();
//        this.network = new Network();

//        //  this.server = new Server();
//        this.clients = [];
//        this.promises = [];

//        let viewPromise = new Promise(function (resolve) {
//            this.view = new View(this.canvas, resolve);
//        }.bind(this));
//        let soundPromise = new Promise(function (resolve) {
//            this.sound = new Sound(resolve);
//        }.bind(this));
//        let inputPromise = new Promise(function (resolve) {
//            this.userInput = new UserInput(this.document, resolve);
//        }.bind(this));
//        Promise.all([viewPromise, soundPromise, inputPromise]).then(function (values) {
//            this.RemovePlayersTimer = setInterval(function () {
//                //this.clients = [];
//            }.bind(this), 5000);

//            this.AddPlayersTimer = setInterval(function () {
//                if (this.clients.length === 1) {
//                    clearInterval(this.AddPlayersTimer);
//                    return;
//                }

//                this.promises.push(new Promise((resolve) => {
//                    this.CreatePlayerAndConnectToServer(resolve);
//                }));

//            }.bind(this), 10);
         
//        }.bind(this));


//        this.InactivePlayerTimer = setInterval(this.InactivePlayer.bind(this), 1000);
//    }

//    public CreatePlayerAndConnectToServer(r: Function = null) {
//        let client: Client = null;
//        let p1 = null;
//        let p2 = null;
//        p1 = new Promise(function (resolve) {
//            client = new Client(this.logic, this.log,this.view, this.userInput, this.network, this.sound);
//            client.ConnectToServer(client.Players[0], resolve);
//        }.bind(this));

//        p1.then(() => {
//            client.Network.JoinRoom(client.Players[0].Socket);
//            this.clients.push(client);
//            if (r !== null) {
//                r(); 
//            }
//        });

//    }
//    public RemovePlayers() {

//    }
//    public InactivePlayer() {
//        return;
//        for (let i = 0; i < this.clients.length; i++) {
//            if (this.clients[i].Players[0].NetworkState != null &&
//                this.clients[i].Players[0].NetworkState.Inactive &&
//                this.clients[i].Players[0].Socket != null &&
//                this.clients[i].Players[0].Socket.CLOSED != 1) {
//                this.clients[i].Players[0].Socket.close();
//            }
//        }

//        this.clients = this.clients.filter(e => e.Players[0].NetworkState.Inactive !== true);
//    }
//}


//let app = new App();

