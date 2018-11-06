"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="Server.ts" />
/// <reference path="Services/Logic.ts" />
const dataTypes_js_1 = require("./dataTypes.js");
const WebSocket = require("ws");
const seedrandom = require("seedrandom");
const class_transformer_1 = require("class-transformer");
class Client {
    constructor(logic, log, file, view, userInput, network, sound, debug) {
        this.Players = [];
        this.Random = seedrandom(null, { state: false });
        this.Logic = logic;
        this.Log = log;
        this.File = file;
        this.View = view;
        this.UserInput = userInput;
        this.Network = network;
        this.Sound = sound;
        this.Debug = debug;
        this.UIState = "TwoPlayer";
        this.UpdateUI();
        this.SinglePlayerConsole();
    }
    SinglePlayerConsole() {
        let player = new dataTypes_js_1.Player();
        player.LogicState = new dataTypes_js_1.LogicState();
        this.Players.push(player);
    }
    SinglePlayer() {
        let player = new dataTypes_js_1.Player();
        player.InputState.InputSet = [];
        player.InputState.InputSet.push(dataTypes_js_1.InputSet.LeftKeyboard);
        player.InputState.InputSet.push(dataTypes_js_1.InputSet.RightKeyboard);
        player.InputState.InputSet.push(dataTypes_js_1.InputSet.JoyPadOne);
        //player.ViewState = new View();
        player.LogicState = new dataTypes_js_1.LogicState();
        player.SoundState = new dataTypes_js_1.SoundState();
        this.Players.push(player);
    }
    TwoPlayer() {
        {
            let player = new dataTypes_js_1.Player();
            player.InputState.InputSet = [];
            player.InputState.InputSet.push(dataTypes_js_1.InputSet.LeftKeyboard);
            player.InputState.InputSet.push(dataTypes_js_1.InputSet.JoyPadOne);
            //player.ViewState = new View();
            player.LogicState = new dataTypes_js_1.LogicState();
            player.SoundState = new dataTypes_js_1.SoundState();
            this.Players.push(player);
        }
        {
            let player = new dataTypes_js_1.Player();
            player.InputState.InputSet = [];
            player.InputState.InputSet.push(dataTypes_js_1.InputSet.RightKeyboard);
            player.InputState.InputSet.push(dataTypes_js_1.InputSet.JoyPadTwo);
            //player.ViewState = new View();
            player.LogicState = new dataTypes_js_1.LogicState();
            player.SoundState = new dataTypes_js_1.SoundState();
            this.Players.push(player);
        }
    }
    NetworkPlay() {
        {
            let player = new dataTypes_js_1.Player();
            player.InputState.InputSet = [];
            player.InputState.InputSet.push(dataTypes_js_1.InputSet.LeftKeyboard);
            player.InputState.InputSet.push(dataTypes_js_1.InputSet.RightKeyboard);
            player.InputState.InputSet.push(dataTypes_js_1.InputSet.JoyPadOne);
            player.LogicState = new dataTypes_js_1.LogicState();
            player.SoundState = new dataTypes_js_1.SoundState();
            this.Players.push(player);
        }
        {
            let player = new dataTypes_js_1.Player();
            player.LogicState = new dataTypes_js_1.LogicState();
            player.SoundState = new dataTypes_js_1.SoundState();
            this.Players.push(player);
        }
    }
    UpdateUI() {
    }
    Tick() {
        for (let i = 0; i < this.Players.length; i++) {
            if (this.Players[i].LogicState.Active) {
                this.Logic.Tick(this.Players[i].LogicState);
                this.NetworkHandler(this.Players[i]);
            }
        }
    }
    UpdateView() {
        for (let i = 0; i < this.Players.length; i++) {
            if (this.Players[i].LogicState.Active) {
                this.ViewHandler(this.Players[i]);
                this.SoundHandler(this.Players[i]);
            }
        }
    }
    Input(player, input) {
        if (input === dataTypes_js_1.InputOptions.Up) {
            this.Logic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row + 1, player.LogicState.Selector.Col);
        }
        else if (input === dataTypes_js_1.InputOptions.Left) {
            this.Logic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row, player.LogicState.Selector.Col - 1);
        }
        else if (input === dataTypes_js_1.InputOptions.Down) {
            this.Logic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row - 1, player.LogicState.Selector.Col);
        }
        else if (input === dataTypes_js_1.InputOptions.Right) {
            this.Logic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row, player.LogicState.Selector.Col + 1);
        }
        else if (input === dataTypes_js_1.InputOptions.A) {
            this.Logic.RequestSwitch(player.LogicState);
        }
    }
    ViewHandler(player) {
    }
    SoundHandler(player) {
        if (!player.SoundState.SoundMute) {
            for (var i = 0; i < player.LogicState.SoundRequests.length; i++) {
                if (player.LogicState.SoundRequests[i] === dataTypes_js_1.SoundRequest.Swap) {
                    this.Sound.swap.play();
                }
                if (player.LogicState.SoundRequests[i] === dataTypes_js_1.SoundRequest.Fall) {
                    this.Sound.swap.play();
                }
                if (player.LogicState.SoundRequests[i] === dataTypes_js_1.SoundRequest.Remove) {
                    this.Sound.swap.play();
                }
            }
        }
        player.LogicState.SoundRequests.length = 0;
    }
    ConnectToServer(player, resolver, name = null) {
        let URL = "ws://localhost:8080";
        let classContext = this;
        if (player.Socket)
            return;
        player.Socket = new WebSocket(URL);
        player.Socket.onopen = function (e) {
            player.NetworkState = new dataTypes_js_1.NetworkState();
            player.NetworkState.JoinedGameCallBack = resolver;
            this.Network.JoinGame(player.Socket, name);
        }.bind(this);
        player.Socket.onmessage = function (data) {
            // this = classContext;
            let request = this.Network.ReadRequest(data.data);
            // this.OnMessage.call(this, data, socket);
            this.ReciveNetworkRequest(player, request.Request, request.Data);
        }.bind(this);
        player.Socket.onerror = function (e) {
            console.log("Socket Error: " + e);
        };
    }
    NetworkHandler(player) {
        if (player.NetworkState === null) {
            return;
        }
        if (!player.NetworkState.Spectator) {
            if (player.LogicState.Ticks.Puzzle < player.NetworkState.TickSentServer + 15) {
                this.Network.SendLog(player.Socket, []);
            }
        }
        else {
        }
    }
    ReciveNetworkRequest(player, request, requestData) {
        switch (request) {
            case "JoinGameResponse": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.JoinGameResponse, requestData);
                player.NetworkState.Name = data.Name;
                player.NetworkState.Id = data.Id;
                player.NetworkState.JoinedGameCallBack();
                break;
            }
            case "Inactive": {
                player.NetworkState.Inactive = true;
                break;
            }
            case "Start": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.StartData, requestData);
                break;
            }
            case "PlayerJoinedRoom": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.PlayerJoinedRoomData, requestData);
                break;
            }
            case "PlayerJoinedRoomResponse": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.JoinRoomResponse, requestData);
                break;
            }
            case "PlayerLeftRoom": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.PlayerLeftRoomData, requestData);
                break;
            }
            case "RoomClosed": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.RoomClosedData, requestData);
                break;
            }
            case "GameEnded": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.GameEnded, requestData);
                break;
            }
            case "SendMessage": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.SendMessageData, requestData);
                break;
            }
            case "UpdatePlayerName": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.UpdatePlayerNameData, requestData);
                break;
            }
            case "JoinGameResponse": {
                let data = class_transformer_1.deserialize(dataTypes_js_1.JoinGameRequest, requestData);
                break;
            }
            default: {
                break;
            }
        }
    }
}
exports.Client = Client;
//      //Message From Server
//    public Server_UpdateLog(data: UpdateLogData) {
//}
//    public Server_Start(data: StartData) {
//    //Load In Players Seed Data
//    this.Room.Active = GameActive.GameRunning;
//    //Que Program To Start
//}
//    public Server_PlayerJoinedRoom(data: PlayerJoinedRoomData) {
//    if (this.Room != null) {
//        this.Room.Players.push(data);
//    }
//}
//    public Server_PlayerJoinedRoomResponse(data: JoinRoomResponse) {
//    this.Room = new RoomClient();
//    this.Room.Id = data.RoomId;
//    this.Room.Spectator = data.Spectator;
//    this.Room.Active = data.Active;
//    this.Room.Players = data.Players;
//}
//    public Server_PlayerLeftRoom(data: PlayerLeftRoomData) {
//    if (this.Room != null) {
//        this.Room.Players = this.Room.Players.filter(e => e.Id != data.Id);
//    }
//}
//    public Server_RoomClosed(data: RoomClosedData) {
//    if (this.Room != null && data.RoomId === this.Room.Id) {
//        this.Room = null;
//    }
//}
//    public Server_GameEnded(data: GameEnded) {
//    //Pause Game
//    //Show Win/Lose
//}
//    public Server_SendMessage(data: SendMessageData) {
//    if (this.Room != null && this.Room.Messeages != null) {
//        let message = new Message();
//        message.messeage = data.Message;
//        message.playerId = data.Id;
//        this.Room.Messeages.push(message);
//    }
//}  
//    public Server_UpdatePlayerName(data: UpdatePlayerNameData){
//    if (this.Room != null && this.Room.Players != null) {
//        let player = this.Room.Players.find(e => e.Id === data.Id);
//        if (player != null) {
//            player.Name = data.Name;
//        }
//    }
//}
//    public Server_JoinGameResponse(data: JoinGameRequest) {
//    this.Player.player.Name = data.Name;
//}
//# sourceMappingURL=Client.js.map