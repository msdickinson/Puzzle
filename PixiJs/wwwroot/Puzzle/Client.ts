
/// <reference path="Server.ts" />
/// <reference path="Services/Logic.ts" />
import {
    Player,
    JoinGameRequest, 
    JoinRoomResponse,
    PlayerJoinedRoomData, PlayerLeftRoomData, UpdatePlayerNameData, SendMessageData, UpdateLogData, StartData, RoomClosedData,  GameEnded, InputOptions, InputSet, LogicState, SoundState, SoundRequest, NetworkState, JoinGameResponse,
} from './dataTypes.js'


import { Logic } from './Services/Logic';
import { Log } from './Services/Log';
import { Debug } from './Services/Debug';
import { File } from './Services/File';
import { Network } from './Services/Network';
import { UserInput } from './Services/UserInput';
import { Sound } from './Services/Sound';
import { View } from './Services/View';
import * as WebSocket from 'ws';
import seedrandom = require('seedrandom');
import { deserialize } from "class-transformer";

class Client {
    public Players: Player[];
    public Random: seedrandom.prng;
    public Logic: Logic;
    public Log: Log;
    public File: File;
    public View: View;
    public UserInput: UserInput;
    public Network: Network;
    public Sound: Sound;
    public Debug: Debug;
    public UIState: string; //Home, SinglePlayer, TwoPlayer, NetworkPlayerHome, NetworkPlayReady, NetworkPlay

    constructor(logic: Logic, log: Log, file: File, view: View, userInput: UserInput, network: Network, sound: Sound, debug: Debug ) {
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

    public SinglePlayerConsole() {
        let player = new Player();
        player.LogicState = new LogicState();
        this.Players.push(player);
    }
    public SinglePlayer() {
        let player = new Player();
        player.InputState.InputSet = [];
        player.InputState.InputSet.push(InputSet.LeftKeyboard);
        player.InputState.InputSet.push(InputSet.RightKeyboard);
        player.InputState.InputSet.push(InputSet.JoyPadOne);
        //player.ViewState = new View();
        player.LogicState = new LogicState();
        player.SoundState = new SoundState();
        this.Players.push(player);
    }
    public TwoPlayer() {
    {
        let player = new Player();
        player.InputState.InputSet = [];
        player.InputState.InputSet.push(InputSet.LeftKeyboard);
        player.InputState.InputSet.push(InputSet.JoyPadOne);
        //player.ViewState = new View();
        player.LogicState = new LogicState();
        player.SoundState = new SoundState();
        this.Players.push(player);
    }
    {
        let player = new Player();
        player.InputState.InputSet = [];
        player.InputState.InputSet.push(InputSet.RightKeyboard);
        player.InputState.InputSet.push(InputSet.JoyPadTwo);
        //player.ViewState = new View();
        player.LogicState = new LogicState();
        player.SoundState = new SoundState();
        this.Players.push(player);
    }

    }

    public NetworkPlay() {
        {
            let player = new Player();
            player.InputState.InputSet = [];
            player.InputState.InputSet.push(InputSet.LeftKeyboard);
            player.InputState.InputSet.push(InputSet.RightKeyboard);
            player.InputState.InputSet.push(InputSet.JoyPadOne);
            player.LogicState = new LogicState();
            player.SoundState = new SoundState();
            this.Players.push(player);
        }
        {
            let player = new Player();
            player.LogicState = new LogicState();
            player.SoundState = new SoundState();
            this.Players.push(player);
        }
    }
    public UpdateUI() {

    }

    public Tick() {
        for (let i = 0; i < this.Players.length; i++) {
            if (this.Players[i].LogicState.Active) {
                this.Logic.Tick(this.Players[i].LogicState);
                this.NetworkHandler(this.Players[i]);
            }
        }
    }
    public UpdateView() {
        for (let i = 0; i < this.Players.length; i++) {
            if (this.Players[i].LogicState.Active) {
                this.ViewHandler(this.Players[i]);
                this.SoundHandler(this.Players[i]);
            }
        }
    }
    public Input(player: Player, input: InputOptions) {
        if (input === InputOptions.Up) {
            this.Logic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row + 1, player.LogicState.Selector.Col);
        }
        else if (input === InputOptions.Left) {
            this.Logic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row, player.LogicState.Selector.Col - 1);
        }
        else if (input === InputOptions.Down) {
            this.Logic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row - 1, player.LogicState.Selector.Col);
        }
        else if (input === InputOptions.Right) {
            this.Logic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row, player.LogicState.Selector.Col + 1);
        }
        else if (input === InputOptions.A) {
            this.Logic.RequestSwitch(player.LogicState);
        }
    }

    public ViewHandler(player: Player) {

    }
    public SoundHandler(player: Player) {
        if (!player.SoundState.SoundMute) {
            for (var i = 0; i < player.LogicState.SoundRequests.length; i++) {
                if (player.LogicState.SoundRequests[i] === SoundRequest.Swap) {
                    this.Sound.swap.play();
                }
                if (player.LogicState.SoundRequests[i] === SoundRequest.Fall) {
                    this.Sound.swap.play();
                }
                if (player.LogicState.SoundRequests[i] === SoundRequest.Remove) {
                    this.Sound.swap.play();
                }
            }
        }
        player.LogicState.SoundRequests.length = 0;
    }

    public ConnectToServer(player: Player, resolver: Function, name: string = null) {
        let URL = "ws://localhost:8080";
        let classContext = this;
        if (player.Socket) return;
        player.Socket = new WebSocket(URL);
        player.Socket.onopen = function (e) {
            player.NetworkState = new NetworkState();
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
    public NetworkHandler(player: Player) {
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
    public ReciveNetworkRequest(player: Player, request: string, requestData: any) {
        switch (request) {
            case "JoinGameResponse": {
                let data = deserialize(JoinGameResponse, requestData);
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
                let data = deserialize(StartData, requestData);

                break;
            }
            case "PlayerJoinedRoom": {
                let data = deserialize(PlayerJoinedRoomData, requestData);

                break;
            }
            case "PlayerJoinedRoomResponse": {
                let data = deserialize(JoinRoomResponse, requestData);

                break;
            }
            case "PlayerLeftRoom": {
                let data = deserialize(PlayerLeftRoomData, requestData);

                break;
            }
            case "RoomClosed": {
                let data = deserialize(RoomClosedData, requestData);

                break;
            }
            case "GameEnded": {
                let data = deserialize(GameEnded, requestData);

                break;
            }
            case "SendMessage": {
                let data = deserialize(SendMessageData, requestData);

                break;
            }
            case "UpdatePlayerName": {
                let data = deserialize(UpdatePlayerNameData, requestData);

                break;
            }
            case "JoinGameResponse": {
                let data = deserialize(JoinGameRequest, requestData);

                break;
            }
            default: {
                break;
            }
        }
    }
}


export { Client };
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