import {
    Player,
    JoinGameRequest, 
    JoinRoomResponse,
    PlayerJoinedRoomData, PlayerLeftRoomData, UpdatePlayerNameData, SendMessageData, StartData, RoomClosedData,  GameEnded, InputOptions, InputSet, LogicState, SoundState, SoundRequest, NetworkState, JoinGameResponse,
} from './dataTypes.js'


import { Logic } from './Services/Logic';
import { Log } from './Services/Log';
import { UserInput } from './Services/UserInput';
import { Sound } from './Services/Sound';
import { View } from './Services/View';
//import { prng, seedrandom_prng } from "../lib/seedrandom/index";
import * as seedrandom  from "../lib/seedrandom/seedrandom";
import * as WebSocket from '../Lib/ws/index';
import { deserialize } from '../Lib/class-transformer/index';
import { prng } from '../Lib/seedrandom/index.js';

class Client {
    public Players: Player[];
    public Random: prng;
    public Logic: Logic;
    public Log: Log;
    public View: View;
    public UserInput: UserInput;
    public Sound: Sound;
    public UIState: string; //Home, SinglePlayer, TwoPlayer, NetworkPlayerHome, NetworkPlayReady, NetworkPlay

    constructor(logic: Logic, log: Log, view: View, userInput: UserInput, sound: Sound) {
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