import {
    Player, GameActive, Room, LogItem, PlayerState, Active, PlayersSeedData, Message, PlayerIdAndName,
    JoinGameRequest, LeaveGameRequest, JoinRoomRequest, LeaveRoomRequest, UpdateNameRequest, SendMessageRequest, SendLogRequest,
    JoinGameResponse, JoinRoomResponse,
    PlayerJoinedRoomData, PlayerLeftRoomData, UpdatePlayerNameData, SendMessageData, UpdateLogData, StartData, RoomClosedData, GameActiveChange, GameEnded
} from './dataTypes.js'


import { PuzzleLogic } from './puzzleLogic.js';
import { PuzzleLoader } from './puzzleLoader.js';
import * as WebSocket from 'ws';
const uuidv1 = require('uuid/v1');
import seedrandom = require('seedrandom');
import { Resolver } from 'dns';

class ServerApplication {
    private Random: seedrandom.prng;
    private Rooms: Room[];
    private Players: Player[];
    private PuzzleLogic: PuzzleLogic;
    private PuzzleLoader: PuzzleLoader;
    private InActiveTimer;
    private NetworkCallsOut: Array<object> = [];
    private httpServer;
    private ws;
    constructor() {
        this.Rooms = [];
        this.Players = [];
        this.NetworkCallsOut = []
        this.Random = seedrandom(null, { state: true });
        this.PuzzleLogic = new PuzzleLogic();
        this.PuzzleLoader = new PuzzleLoader();
        this.InActiveTimer = setInterval(this.CheckForInactiveRooms.bind(this), 250);
        this.httpServer = "ws://www.host.com/path";
        this.ws = new WebSocket.Server({ port: 8080 });
        this.ws.on('connection', this.OnConnection.bind(this));
    }
    private CreateRoom() {
        let room: Room = new Room();
        room.Active = GameActive.WaitingForPlayers;
        room.ActiveTime = new Date();

        room.Random = seedrandom(null, { state: true });
        room.Id = uuidv1();
        room.Players = [];

        return room;
    }

    private MergeLog(state: Room, player: PlayerState, logItems: LogItem[]) {
        //if (state.Active !== GameActive.GameRunning || logItems.length === 0) {
        //    return;
        //}
        //let desync: boolean = false;
        //let userTick = logItems[logItems.length - 1].Tick;
        //let serverTick: number = player.PuzzleLogicState.Ticks.Puzzle;
        //let serverLogId = player.PuzzleLogicState.LogItems.length > 0 ? player.PuzzleLogicState.Log[player.PuzzleLogicState.LogItems.length - 1].Id : 0;
        //let currentTick: number = this.CurrentTick(state);
        //let ticksPast: number = currentTick - userTick;
        //if ((currentTick - userTick) <= 180) {
        //    //THIS BROKEN
        //   // this.PuzzleLoader.MergeLogItems(player.PuzzleLogState, logItems);
        //  //  this.PuzzleLoader.AdvanceToEndOfLog(this.PuzzleLogic, player.PuzzleLogicState, player.PuzzleLogState, serverLogId + 1);
        //}
        //else {
        //    desync = true;
        //    for (let j = 0; j < currentTick - serverTick; j++) {
        //        this.PuzzleLogic.Tick(player.PuzzleLogicState);
        //    }
        //}
        //let data = new UpdateLogData();
        //data.Id = player.player.Id;
        //data.LogItems = player.PuzzleLogState.Log.slice(serverLogId);
        //for (let i = 0; state.Players.length; i++) {
        //    if (desync || state.Players[i].player.Id !== player.player.Id) {
        //        this.SocketCall("UpdateLog", state.Players[i].player.Key, data);
        //    }
        //}

        //this.CheckGameEnd(state);
    }
    private AutoPlayCheck(state: Room) {
        if (state.Active !== GameActive.GameRunning) {
            return;
        }
        for (let i = 0; i < state.Players.length; i++) {
            let player: PlayerState = state.Players[i];
            let serverTick: number = state.Players[i].PuzzleLogicState.Ticks.Puzzle;
            let serverLogItems = player.PuzzleLogicState.LogItems.length;
            let currentTick: number = this.CurrentTick(state);
            let ticksPast: number = currentTick - serverTick;
            if (ticksPast > 180) {
                let item = new LogItem();
                item.Id = player.PuzzleLogicState.LogItems.length;
                item.Action = "Tick";
                item.ValueOne = 0;
                item.ValueTwo = 0;
                player.PuzzleLogicState.LogItems.push(item);
                for (let j = 0; j < ticksPast; j++) {
                    this.PuzzleLogic.Tick(player.PuzzleLogicState);
                }

                let data = new UpdateLogData();
                data.Id = player.player.Id;
                data.LogItems = player.PuzzleLogicState.LogItems.slice(serverLogItems);

                for (let j = 0; j < state.Players.length; j++) {
                    this.SocketCall("UpdateLog", state.Players[i].player.Key, data);
                }
                this.CheckGameEnd(state);
            }
        }

    }
    private StartGame(state: Room) {
        state.GameStarted = new Date();
        state.Timer = setInterval((() => { this.AutoPlayCheck(state) }).bind(this), 250);
        state.Active = GameActive.GameRunning;

        for (let i = 0; i < state.Players.length; i++) {
            this.PuzzleLogic.Reset(state.Players[i].PuzzleLogicState, true)
        } 

        let data = new StartData();
        data.PlayersSeedData =  state.Players.map(e =>
        {
            let item = new PlayersSeedData();
            item.Id = e.player.Id,
            item.Seed = e.PuzzleLogicState.Seed;

            return item;
        });

        for (let i = 0; i < state.Players.length; i++) {
            this.SocketCall("Start", state.Players[i].player.Key, data);
        } 
    }
    private LeaveGame(player: Player) {
        this.Players = this.Players.filter(e => e.Key !== player.Key);
    }
    private Join(player: Player, state: Room = null) {
        let playerJoined = new PlayerJoinedRoomData();
        playerJoined.Id = player.Id;
        playerJoined.Name = player.Name;

        if (state == null) {
            let room = this.Rooms.find(e => e.Players.length < 2);
            if (room != null) {
                state = room;
            }
            else {
                state = this.CreateRoom();
                this.Rooms.push(state);
            }
        }

        for (let i = 0; i < state.Players.length; i++) {
            this.SocketCall("PlayerJoinedRoom", state.Players[i].player.Key, playerJoined);
        }

        let playerState = new PlayerState();
        playerState.player = player;

        if (state.Players.length < 2) {

            this.PuzzleLogic.Reset(playerState.PuzzleLogicState, true, this.Random());
            state.Players.push(playerState);

            if (state.Players.length == 2) {
                this.StartGame(state);
            }

            let result = new JoinRoomResponse();
            result.RoomId = state.Id;
            result.Spectator = false;
            result.Active = state.Active;
            result.Players = state.Players.map(e => {
                let item = new PlayerIdAndName();
                item.Id = e.player.Id;
                item.Name = e.player.Name;
                return item;
            });
            this.SocketCall("PlayerJoinedRoomResponse", player.Key, result);
        }
        else {
            state.Players.push(new PlayerState());

            let result = new JoinRoomResponse();
            result.RoomId = state.Id;
            result.Spectator = true;
            result.Active = state.Active;
            result.Players = state.Players.map(e => {
                let item = new PlayerIdAndName();
                item.Id = e.player.Id;
                item.Name = e.player.Name;
                return item;
            });
            this.SocketCall("PlayerJoinedRoomResponse", player.Key, result);
        }
    }
    private Leave(room: Room, player: PlayerState) {
        room.Players = room.Players.filter(e => e.player.Id !== player.player.Id);
        let data = new PlayerLeftRoomData();
        data.Id = player.player.Id;
        for (let i = 0; room.Players.length; i++) {
            this.SocketCall("PlayerLeftRoom", room.Players[i].player.Key, data);
        }
        this.CheckGameEnd(room);
    }
    private CurrentTick(state: Room) {
        let endTime = new Date();
        return Math.floor(((endTime.getTime() - state.GameStarted.getTime()) / 1000) * 16.66666666);
    }
    private CheckForInactiveRooms() {
        let currentDateTime = new Date().getTime();
        for (let i = 0; i <  this.Rooms.length; i++) {
            if (((currentDateTime - this.Rooms[i].ActiveTime.getTime()) / 1000) > (180 * 1000)) {
                this.Rooms[i].Active = GameActive.Inactive;
                for (let j = 0; this.Rooms[i].Players.length; j++) {
                    let data = new RoomClosedData();
                    data.RoomId = this.Rooms[i].Id;
                    this.SocketCall("RoomClosed", this.Rooms[i].Players[j].player.Key, data);
                }
            }
        }
        this.Rooms = this.Rooms.filter(e => e.Active !== GameActive.Inactive);
    }
    private CheckGameEnd(state: Room) {
        let puzzlesActive = state.Players.filter(e => e.PuzzleLogicState.Active.Puzzle === true);
        let puzzlesInactive = state.Players.filter(e => e.PuzzleLogicState.Active.Puzzle === false);
        if (puzzlesInactive.length > 0 &&
            puzzlesActive.length === 1) {
            let maxTick = Math.max(...puzzlesInactive.map(e => { return e.PuzzleLogicState.Ticks.Puzzle }));
            if (puzzlesActive[0].PuzzleLogicState.Ticks.Puzzle >= maxTick)
            {
                let data = new GameEnded();
                data.WinnerIds = [puzzlesActive[0].player.Id];
                clearInterval(state.Timer);
                for (let i = 0; i < state.Players.length; i++) {
                    this.SocketCall("GameEnded", state.Players[i].player.Key, data);
                }
            }
            else {
                return;
            }
        }
        else if (puzzlesInactive.length > 0 && puzzlesActive.length === 0) {
            let minTick = Math.min(...puzzlesInactive.map(e => { return e.PuzzleLogicState.Ticks.Puzzle }));
            let players = puzzlesInactive.filter(e => { return e.PuzzleLogicState.Ticks.Puzzle === minTick });
            let data = new GameEnded();
            data.WinnerIds = players.map(e => { return e.player.Id });
            clearInterval(state.Timer);
            for (let i = 0; i < state.Players.length; i++) {
                this.SocketCall("GameEnded", state.Players[i].player.Key, data);
            }
        }
    }
    private SendMessage(room: Room, player: Player, message: string) {
        let data = new SendMessageData();
        data.Id = player.Id;
        data.Message = message;

        for (let i = 0; room.Players.length; i++) {
            if (room.Players[i].player.Id !== player.Id) {
                this.SocketCall("SendMessage", room.Players[i].player.Key, data);
            }
        }
    }
    private updateName(player: Player, state: Room, name: string) {
        player.Name = name;
        for (let i = 0; i < state.Players.length; i++) {
            let data = new UpdatePlayerNameData();
            data.Id = player.Id;
            data.Name = name;
            this.SocketCall("UpdatePlayerName", state.Players[i].player.Key, data);
        }
    }

    public OnConnection(socket, req) {
        let x = this;
        socket.on('message', (data) => {
            this.OnMessage.call(this, data, x);
        });
        socket.on('close', this.OnClose.bind(this));
        socket.on('error', this.OnError.bind(this));

        socket.id = uuidv1();
    }
    public OnClose() {
       // var socketId = this.id;
       // console.log('onClose', socketId);
    }
    public OnError(error) {
      //  console.log('Cannot start server');
    }
    public OnMessage(data,x, socket) {
        var socket = socket;
        if (!data) return;

        var request = null;
        var requestData = null;
        if (data.indexOf(":") > -1) {
            request = data.split(":")[0];
            requestData = data.substring(data.indexOf(":") + 1);
            //try to phase json
            try {
                requestData = JSON.parse(requestData);
            } catch (e) { }
        } else {
            request = data;
        }
        this.SocketRequest(request, socket.id, requestData);
        ////execute
        //if (command === "setId") {
        //    socket.id = value;
        //}
    }

    public ConsoleRequest(request: string, playerKey: string, requestData: object) {
        this.SocketRequest(request, playerKey, requestData);
    }
    private SocketRequest(request: string, playerKey: string, requestData) {
        switch (request) {
            case "JoinGame": {
                requestData = <JoinGameRequest>requestData;
       
                    let player = new Player();
                    player.Id = uuidv1();
                    player.Key = playerKey;
                    if (requestData.Name !== null) {
                        player.Name = requestData.Name;
                    }
                    else {
                        player.Name = "Player" + ("" + this.Random() * 100000000 + "").substring(0, 5);
                    }
                    
                    this.Players.push(player);

                    let response = new JoinGameResponse();
                    response.Id = player.Id;
                    response.Name = player.Name;

                    this.SocketCall("JoinGameResponse", playerKey, response);
 
                break;
            }
            case "LeaveGame": {
                requestData = <LeaveGameRequest>requestData;
                if (requestData instanceof LeaveGameRequest) {
                    let player = this.Players.find(e => e.Key === playerKey);
                    let room = this.Rooms.find(e => e.Id === requestData.RoomId);

                    if (player != null && room != null) {
                        let playerState = room.Players.find(e => e.player.Key === playerKey);
                        this.Leave(room, playerState);
                    }

                    if (player != null) {
                        this.LeaveGame(player);
                    }
                }
                break;
            }
            case "JoinRoom": {

                    let player = this.Players.find(e => e.Key === playerKey);
                    if (player != null) {
                        if (requestData.RoomId === null) {
                            this.Join(player);
                        }
                        else {
                            let room = this.Rooms.find(e => e.Id === requestData.RoomId);
                            if (room != null) {
                                this.Join(player, room);
                            }
                        }
                    }

                break;
            }
            case "LeaveRoom": {
                if (requestData instanceof LeaveRoomRequest) {
                    let player = this.Players.find(e => e.Key === playerKey);
                    let room = this.Rooms.find(e => e.Id === requestData.RoomId);

                    if (player != null && room != null) {
                        let playerState = room.Players.find(e => e.player.Key === playerKey);
                        this.Leave(room, playerState);
                    }
                }
                break;
            }
            case "UpdateName": {

                    let player = this.Players.find(e => e.Key === playerKey);
                    let room = this.Rooms.find(e => e.Id === requestData.RoomId);
                    if (player != null && room != null && requestData.Name.length <= 56) {
                        this.updateName(player, room, requestData.Name);
                    }

                break;
            }
            case "SendMessage": {
                if (requestData instanceof SendMessageRequest) {
                    let player = this.Players.find(e => e.Key === playerKey);
                    let room = this.Rooms.find(e => e.Id === requestData.RoomId);
                    if (player != null && room != null && requestData.Message.length <= 256) {
                        this.SendMessage(room, player, requestData.Message)
                    }
                }
                break;
            }
            case "SendLog": {
                if (requestData instanceof SendLogRequest) {
                    let room = this.Rooms.find(e => e.Id === requestData.RoomId);
                    let playerState = null;
                    if (room != null) {
                        playerState = room.Players.find(e => e.player.Key === playerKey)
                    }
                    if (playerState != null && room != null && requestData.LogItems != null) {
                        this.MergeLog(room, playerState, requestData.LogItems);
                    }
                }
                break;
            }
            default: {
                break;
            }
        } 
    }
    private SocketCall(action: string, playerKey: string, data: object) {
        this.LogNetworkCall(action, playerKey, data);
    }
    private LogNetworkCall(action: string, playerKey: string, data: object) {
        this.NetworkCallsOut.push({ action: action, playerId: playerKey, data: data });
    }
}


export { ServerApplication };
