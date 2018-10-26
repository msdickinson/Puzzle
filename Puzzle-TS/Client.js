"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataTypes_js_1 = require("./dataTypes.js");
const class_transformer_1 = require("class-transformer");
const PuzzleLogic_js_1 = require("./PuzzleLogic.js");
const PuzzleLogService_js_1 = require("./PuzzleLogService.js");
const seedrandom = require("seedrandom");
const DebugService_js_1 = require("./DebugService.js");
const FileService_js_1 = require("./FileService.js");
const NetworkService_js_1 = require("./NetworkService.js");
const InputService_js_1 = require("./InputService.js");
const SoundService_js_1 = require("./SoundService.js");
const ViewService_js_1 = require("./ViewService.js");
const WebSocket = require("ws");
class Client {
    constructor(document, element, resolve) {
        this.Players = [];
        this.Random = seedrandom(null, { state: true });
        this.PuzzleLogic = new PuzzleLogic_js_1.PuzzleLogic();
        this.PuzzleLogService = new PuzzleLogService_js_1.PuzzleLogService();
        this.FileService = new FileService_js_1.FileService();
        this.DebugService = new DebugService_js_1.DebugService();
        this.NetworkService = new NetworkService_js_1.NetworkService();
        this.UIState = "TwoPlayer";
        this.UpdateUI();
        let viewServicePromise = new Promise(function (resolve) {
            this.ViewService = new ViewService_js_1.ViewService(element, resolve);
        }.bind(this));
        let soundServicePromise = new Promise(function (resolve) {
            this.SoundService = new SoundService_js_1.SoundService(resolve);
        }.bind(this));
        let inputServicePromise = new Promise(function (resolve) {
            this.InputService = new InputService_js_1.InputService(document, resolve);
        }.bind(this));
        Promise.all([viewServicePromise, soundServicePromise, inputServicePromise]).then(function (values) {
            this.SinglePlayerConsole();
            resolve();
        }.bind(this));
    }
    SinglePlayerConsole() {
        let player = new dataTypes_js_1.Player();
        player.LogicState = new dataTypes_js_1.PuzzleLogicState();
        this.Players.push(player);
    }
    SinglePlayer() {
        let player = new dataTypes_js_1.Player();
        player.InputState.InputSet = [];
        player.InputState.InputSet.push(dataTypes_js_1.InputSet.LeftKeyboard);
        player.InputState.InputSet.push(dataTypes_js_1.InputSet.RightKeyboard);
        player.InputState.InputSet.push(dataTypes_js_1.InputSet.JoyPadOne);
        //player.ViewState = new View();
        player.LogicState = new dataTypes_js_1.PuzzleLogicState();
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
            player.LogicState = new dataTypes_js_1.PuzzleLogicState();
            player.SoundState = new dataTypes_js_1.SoundState();
            this.Players.push(player);
        }
        {
            let player = new dataTypes_js_1.Player();
            player.InputState.InputSet = [];
            player.InputState.InputSet.push(dataTypes_js_1.InputSet.RightKeyboard);
            player.InputState.InputSet.push(dataTypes_js_1.InputSet.JoyPadTwo);
            //player.ViewState = new View();
            player.LogicState = new dataTypes_js_1.PuzzleLogicState();
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
            //player.ViewState = new View();
            player.LogicState = new dataTypes_js_1.PuzzleLogicState();
            player.SoundState = new dataTypes_js_1.SoundState();
            this.Players.push(player);
        }
        {
            let player = new dataTypes_js_1.Player();
            //player.ViewState = new View();
            player.LogicState = new dataTypes_js_1.PuzzleLogicState();
            player.SoundState = new dataTypes_js_1.SoundState();
            this.Players.push(player);
        }
    }
    UpdateUI() {
    }
    Tick() {
        for (let i = 0; i < this.Players.length; i++) {
            if (this.Players[i].LogicState.Active) {
                this.PuzzleLogic.Tick(this.Players[i].LogicState);
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
            this.PuzzleLogic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row + 1, player.LogicState.Selector.Col);
        }
        else if (input === dataTypes_js_1.InputOptions.Left) {
            this.PuzzleLogic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row, player.LogicState.Selector.Col - 1);
        }
        else if (input === dataTypes_js_1.InputOptions.Down) {
            this.PuzzleLogic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row - 1, player.LogicState.Selector.Col);
        }
        else if (input === dataTypes_js_1.InputOptions.Right) {
            this.PuzzleLogic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row, player.LogicState.Selector.Col + 1);
        }
        else if (input === dataTypes_js_1.InputOptions.A) {
            this.PuzzleLogic.RequestSwitch(player.LogicState);
        }
    }
    ViewHandler(player) {
    }
    SoundHandler(player) {
        if (!player.SoundState.SoundMute) {
            for (var i = 0; i < player.LogicState.SoundRequests.length; i++) {
                if (player.LogicState.SoundRequests[i] === dataTypes_js_1.SoundRequest.Swap) {
                    this.SoundService.swap.play();
                }
                if (player.LogicState.SoundRequests[i] === dataTypes_js_1.SoundRequest.Fall) {
                    this.SoundService.swap.play();
                }
                if (player.LogicState.SoundRequests[i] === dataTypes_js_1.SoundRequest.Remove) {
                    this.SoundService.swap.play();
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
            this.NetworkService.JoinGame(player.Socket, name);
        }.bind(this);
        player.Socket.onmessage = function (data) {
            // this = classContext;
            let request = this.NetworkService.ReadRequest(data.data);
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
                this.NetworkService.SendLog(player.Socket, []);
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