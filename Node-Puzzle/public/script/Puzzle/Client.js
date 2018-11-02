(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./dataTypes.js", "../lib/seedrandom/seedrandom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const dataTypes_js_1 = require("./dataTypes.js");
    //import { prng, seedrandom_prng } from "../lib/seedrandom/index";
    const seedrandom = require("../lib/seedrandom/seedrandom");
    class Client {
        constructor(logic, log, view, userInput, sound) {
            this.Players = [];
            this.Random = seedrandom(null, { state: false });
            this.Logic = logic;
            this.Log = log;
            this.View = view;
            this.UserInput = userInput;
            this.Sound = sound;
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
    }
    exports.Client = Client;
});
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