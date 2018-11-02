import {
    Player,
    InputOptions, InputSet, LogicState, SoundState, SoundRequest, NetworkState
} from './dataTypes.js'
import { Logic } from './Services/Logic.js';
import { Log } from './Services/Log.js';
import { UserInput } from './Services/UserInput.js';
import { Sound } from './Services/Sound.js';
import { View } from './Services/View.js';
import { seedRandom } from "../lib/seedrandom/seedrandom.js";
import { prng } from "../lib/seedrandom/index.js";
import { Network } from './Services/Network.js';
class Client {
    public Players: Player[];
    public Random: prng;
    public Logic: Logic;
    public Log: Log;
    public View: View;
    public UserInput: UserInput;
    public Sound: Sound;
    public Network: Network;
    public UIState: string;

    constructor(logic: Logic, log: Log, view: View, userInput: UserInput, sound: Sound, network: Network) {
        this.Players = [];
        this.Random = seedRandom.seedrandom(null, { state: false });

        this.Network = network;
        this.Logic = logic;
        this.Log = log;
        this.View = view;
        this.UserInput = userInput;
        this.UserInput.CallBack = this.PlayerInput.bind(this);
        this.Sound = sound;

        this.UIState = "OnePlayer";
        this.UpdateUI();
        this.SinglePlayerOnline();

    
    }

    public SinglePlayer() {
        let player = new Player();
        this.UserInput.Subscribe(player, InputSet.LeftKeyboard);
        this.UserInput.Subscribe(player, InputSet.RightKeyboard);
        this.UserInput.Subscribe(player, InputSet.JoyPadOne);
        player.LogicState = new LogicState();
        this.Logic.Reset(player.LogicState);
        player.SoundState = new SoundState();
        player.SoundState.SoundMute = true;
        this.View.CreatePlayerView(player);
        this.View.AddContainer(player.ViewState.Container);

        this.Players.push(player);
    }

    public SinglePlayerOnline() {
        let player = new Player();
        this.UserInput.Subscribe(player, InputSet.LeftKeyboard);
        this.UserInput.Subscribe(player, InputSet.RightKeyboard);
        this.UserInput.Subscribe(player, InputSet.JoyPadOne);
        player.LogicState = new LogicState();
        this.Logic.Reset(player.LogicState);
        player.SoundState = new SoundState();
        player.SoundState.SoundMute = true;
        this.View.CreatePlayerView(player);
        this.View.AddContainer(player.ViewState.Container);

        this.ConnectToServer(player);
        this.Players.push(player);

      
    }


 
    public UpdateUI() {

    }

    public Tick() {
        for (let i = 0; i < this.Players.length; i++) {
            if (this.Players[i].LogicState.Active.Puzzle) {
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

    public PlayerInput(player: Player, input: InputOptions) {
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
        this.View.UpdatePlayerView(player);

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


    public ConnectToServer(player: Player, resolver: Function = null, name: string = null) {
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
            let request = this.Network.ReadRequest(data.data);
            this.ReciveNetworkRequest(player, request.Request, JSON.parse(request.Data));
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
    }
    public ReciveNetworkRequest(player: Player, request: string, data: any) {
        switch (request) {
            case "JoinGameResponse": {
                player.NetworkState.Name = data.Name;
                player.NetworkState.Id = data.Id;
                if (player.NetworkState.JoinedGameCallBack != null) {
                    player.NetworkState.JoinedGameCallBack();
                }
                break;
            }
            case "Inactive": {
                player.NetworkState.Inactive = true;

                break;
            }
            case "Start": {

                break;
            }
            case "PlayerJoinedRoom": {

                break;
            }
            case "PlayerJoinedRoomResponse": {

                break;
            }
            case "PlayerLeftRoom": {
 
                break;
            }
            case "RoomClosed": {

                break;
            }
            case "GameEnded": {

                break;
            }
            case "SendMessage": {

                break;
            }
            case "UpdatePlayerName": {

                break;
            }
            case "JoinGameResponse": {
  
                break;
            }
            default: {
                break;
            }
        }
    }
}


export { Client };
