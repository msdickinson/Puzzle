import { Server } from "./Puzzle/Server";
import { Client } from './Puzzle/Client';

import { Logic } from './Puzzle/Services/Logic';
import { Log } from './Puzzle/Services/Log.js';
import { Debug } from './Puzzle/Services/Debug.js';
import { File } from './Puzzle/Services/File.js';
import { Network } from './Puzzle/Services/Network.js';
import { UserInput } from './Puzzle/Services/UserInput.js';
import { Sound } from './Puzzle/Services/Sound.js';
import { View } from './Puzzle/Services/View.js';

class App
{
    private document = null;
    private canvas = null;

    private view: View;
    private sound: Sound;
    private userInput: UserInput;
    private logic: Logic;
    private log: Log;
    private file: File;
    private debug: Debug;
    private network: Network;
    private server: Server;
    private clients: Client[] = [];
    private promises = [];

    private InactivePlayerTimer = null;
    private AddPlayersTimer = null;
    private RemovePlayersTimer = null;

    constructor() {
        this.document = null;
        this.canvas = null;

        this.logic = new Logic();
        this.log = new Log();
        this.file = new File();
        this.debug = new Debug();
        this.network = new Network();

      //  this.server = new Server();
        this.clients = [];
        this.promises = [];

        let viewPromise = new Promise(function (resolve) {
            this.view = new View(this.canvas, resolve);
        }.bind(this));
        let soundPromise = new Promise(function (resolve) {
            this.sound = new Sound(resolve);
        }.bind(this));
        let inputPromise = new Promise(function (resolve) {
            this.userInput = new UserInput(this.document, resolve);
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

    public CreatePlayerAndConnectToServer(r: Function = null) {
        let client: Client = null;
        client = new Client(this.logic, this.log, this.file, this.view, this.userInput, this.network, this.sound, this.debug);
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
    public RemovePlayers() {

    }
    public InactivePlayer() {
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

