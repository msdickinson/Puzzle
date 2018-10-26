import {
    Player,
    JoinGameRequest, 
    JoinRoomResponse,
    PlayerJoinedRoomData, PlayerLeftRoomData, UpdatePlayerNameData, SendMessageData, UpdateLogData, StartData, RoomClosedData,  GameEnded, InputOptions, InputSet, PuzzleLogicState, SoundState, SoundRequest, NetworkState, JoinGameResponse,
} from './dataTypes.js'

import { deserialize } from "class-transformer";
import { PuzzleLogic } from './PuzzleLogic.js';
import { PuzzleLogService } from './PuzzleLogService.js';
import seedrandom = require('seedrandom');
import { DebugService } from './DebugService.js';
import { FileService } from './FileService.js';
import { NetworkService } from './NetworkService.js';
import { InputService } from './InputService.js';
import { SoundService } from './SoundService.js';
import { ViewService } from './ViewService.js';
import * as WebSocket from 'ws';


class Client {
    public Players: Player[];
    public Random: seedrandom.prng;
    public PuzzleLogic: PuzzleLogic;
    public PuzzleLogService: PuzzleLogService;
    public FileService: FileService;
    public ViewService: ViewService;
    public InputService: InputService;
    public NetworkService: NetworkService;
    public SoundService: SoundService;
    public DebugService: DebugService;
    public UIState: string; //Home, SinglePlayer, TwoPlayer, NetworkPlayerHome, NetworkPlayReady, NetworkPlay

    constructor(document: any, element: any, resolve: Function) {
        this.Players = [];
        this.Random = seedrandom(null, { state: true });
        this.PuzzleLogic = new PuzzleLogic();
        this.PuzzleLogService = new PuzzleLogService();
        this.FileService = new FileService();
        this.DebugService = new DebugService();
        this.NetworkService = new NetworkService();
        this.UIState = "TwoPlayer";
        this.UpdateUI();


        let viewServicePromise = new Promise(function (resolve) {
            this.ViewService = new ViewService(element, resolve);
        }.bind(this));

        let soundServicePromise = new Promise(function (resolve) {
            this.SoundService = new SoundService(resolve);
        }.bind(this));

        let inputServicePromise = new Promise(function (resolve) {
            this.InputService = new InputService(document, resolve);
        }.bind(this));

        Promise.all([viewServicePromise, soundServicePromise, inputServicePromise]).then(function (values) {
            this.SinglePlayerConsole();
            resolve();
        }.bind(this));
    }

    public SinglePlayerConsole() {
        let player = new Player();
        player.LogicState = new PuzzleLogicState();
        this.Players.push(player);
    }
    public SinglePlayer() {
        let player = new Player();
        player.InputState.InputSet = [];
        player.InputState.InputSet.push(InputSet.LeftKeyboard);
        player.InputState.InputSet.push(InputSet.RightKeyboard);
        player.InputState.InputSet.push(InputSet.JoyPadOne);
        //player.ViewState = new View();
        player.LogicState = new PuzzleLogicState();
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
        player.LogicState = new PuzzleLogicState();
        player.SoundState = new SoundState();
        this.Players.push(player);
    }
    {
        let player = new Player();
        player.InputState.InputSet = [];
        player.InputState.InputSet.push(InputSet.RightKeyboard);
        player.InputState.InputSet.push(InputSet.JoyPadTwo);
        //player.ViewState = new View();
        player.LogicState = new PuzzleLogicState();
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
            //player.ViewState = new View();
            player.LogicState = new PuzzleLogicState();
            player.SoundState = new SoundState();
            this.Players.push(player);
        }
        {
            let player = new Player();
            //player.ViewState = new View();
            player.LogicState = new PuzzleLogicState();
            player.SoundState = new SoundState();
            this.Players.push(player);
        }
    }
    public UpdateUI() {

    }

    public Tick() {
        for (let i = 0; i < this.Players.length; i++) {
            if (this.Players[i].LogicState.Active) {
                this.PuzzleLogic.Tick(this.Players[i].LogicState);
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
            this.PuzzleLogic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row + 1, player.LogicState.Selector.Col);
        }
        else if (input === InputOptions.Left) {
            this.PuzzleLogic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row, player.LogicState.Selector.Col - 1);
        }
        else if (input === InputOptions.Down) {
            this.PuzzleLogic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row - 1, player.LogicState.Selector.Col);
        }
        else if (input === InputOptions.Right) {
            this.PuzzleLogic.RequestMoveSelector(player.LogicState, player.LogicState.Selector.Row, player.LogicState.Selector.Col + 1);
        }
        else if (input === InputOptions.A) {
            this.PuzzleLogic.RequestSwitch(player.LogicState);
        }
    }

    public ViewHandler(player: Player) {

    }
    public SoundHandler(player: Player) {
        if (!player.SoundState.SoundMute) {
            for (var i = 0; i < player.LogicState.SoundRequests.length; i++) {
                if (player.LogicState.SoundRequests[i] === SoundRequest.Swap) {
                    this.SoundService.swap.play();
                }
                if (player.LogicState.SoundRequests[i] === SoundRequest.Fall) {
                    this.SoundService.swap.play();
                }
                if (player.LogicState.SoundRequests[i] === SoundRequest.Remove) {
                    this.SoundService.swap.play();
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
    public NetworkHandler(player: Player) {
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
    public ReciveNetworkRequest(player: Player, request: string, requestData: any) {
        switch (request) {
            case "JoinGameResponse": {
                let data = deserialize(JoinGameResponse, requestData);
                player.NetworkState.Name = data.Name;
                player.NetworkState.Id = data.Id;
                player.NetworkState.JoinedGameCallBack();
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