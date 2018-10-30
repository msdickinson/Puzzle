import {
    Player, GameActive, Room, LogItem,  PlayersSeedData,  PlayerIdAndName,
    JoinGameResponse, JoinRoomResponse,
    PlayerJoinedRoomData, NetworkLogUser, NetworkLogRoom, PlayerLeftRoomData, UpdatePlayerNameData, SendMessageData, UpdateLogData, StartData, RoomClosedData, GameEnded, NetworkState, LogicState
} from './dataTypes'

import { Logic } from './Services/Logic';
import { Log } from './Services/Log';
import * as WebSocket from 'ws';
const uuidv1 = require('uuid/v1');
import seedrandom = require('seedrandom');


const ROOM_TIME_OUT = 10;
const PLAYER_TIME_OUT = 20;

class Server {
    private Random: seedrandom.prng;
    private Rooms: Room[]; 
    private Players: Player[];
    private Logic: Logic;
    private Log: Log;
    private InActiveGameTimer;
    private InActivePlayerTimer;
    private AutoPlayCheckTimer;
    private NetworkCallsIn: Array<object> = [];
    private NetworkCallsOut: Array<object> = [];
    private httpServer;
    private ws;
    constructor() {
        this.Rooms = [];
        this.Players = [];
        this.NetworkCallsOut = []
        this.Random = seedrandom(null, { state: true });
        this.Logic = new Logic();
        this.Log = new Log();
        this.InActiveGameTimer = setInterval(this.CheckForInactiveRooms.bind(this), 1000);
        this.InActivePlayerTimer = setInterval(this.CheckForInactivePlayers.bind(this), 1000);
        this.AutoPlayCheckTimer = setInterval(this.AutoPlayCheck.bind(this), 250);
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

    private MergeLog(state: Room, player: Player, logItems: LogItem[]) {
        //if (state.Active !== GameActive.GameRunning || logItems.length === 0) {
        //    return;
        //}
        //let desync: boolean = false;
        //let userTick = logItems[logItems.length - 1].Tick;
        //let serverTick: number = player.LogicState.Ticks.Puzzle;
        //let serverLogId = player.LogicState.LogItems.length > 0 ? player.LogicState.Log[player.LogicState.LogItems.length - 1].Id : 0;
        //let currentTick: number = this.CurrentTick(state);
        //let ticksPast: number = currentTick - userTick;
        //if ((currentTick - userTick) <= 180) {
        //    //THIS BROKEN
        //   // this.PuzzleLoader.MergeLogItems(player.LogState, logItems);
        //  //  this.PuzzleLoader.AdvanceToEndOfLog(this.Logic, player.LogicState, player.LogState, serverLogId + 1);
        //}
        //else {
        //    desync = true;
        //    for (let j = 0; j < currentTick - serverTick; j++) {
        //        this.Logic.Tick(player.LogicState);
        //    }
        //}
        //let data = new UpdateLogData();
        //data.Id = player.player.Id;
        //data.LogItems = player.LogState.Log.slice(serverLogId);
        //for (let i = 0; state.Players.length; i++) {
        //    if (desync || state.Players[i].player.Id !== player.player.Id) {
        //        this.SocketCall("UpdateLog", state.Players[i].player.Key, data);
        //    }
        //}

        //this.CheckGameEnd(state);
    }
    private AutoPlayCheck() {
        for (let p = 0; p < this.Rooms.length; p++) {
            if (this.Rooms[p].Active !== GameActive.GameRunning) {
                return;
            }

            let state = this.Rooms[p];
            for (let i = 0; i < state.Players.length; i++) {
                let player: Player = state.Players[i];
                let serverTick: number = state.Players[i].LogicState.Ticks.Puzzle;
                let serverLogItems = player.LogicState.LogItems.length;
                let currentTick: number = this.CurrentTick(state);
                let ticksPast: number = currentTick - serverTick;
                if (ticksPast > 180) {
                    let item = new LogItem();
                    item.Id = player.LogicState.LogItems.length;
                    item.Action = "Tick";
                    item.ValueOne = 0;
                    item.ValueTwo = 0;
                    player.LogicState.LogItems.push(item);
                    for (let j = 0; j < ticksPast; j++) {
                        this.Logic.Tick(player.LogicState);
                    }

                    let data = new UpdateLogData();
                    data.Id = player.NetworkState.Id;
                    data.LogItems = player.LogicState.LogItems.slice(serverLogItems);

                    for (let j = 0; j < state.Players.length; j++) {
                        this.SocketCall("UpdateLog", state.Players[i].NetworkState.Key, data);
                    }
                    this.CheckGameEnd(state);
                }
            }
        }
    }
    private StartGame(state: Room) {
        state.GameStarted = new Date();
       // state.Timer = setInterval((() => { this.AutoPlayCheck(state) }).bind(this), 250);
        state.Active = GameActive.GameRunning;

        for (let i = 0; i < state.Players.length; i++) {
            this.Logic.Reset(state.Players[i].LogicState, true)
        } 

        let data = new StartData();
        data.PlayersSeedData =  state.Players.map(e =>
        {
            let item = new PlayersSeedData();
            item.Id = e.NetworkState.Id;
            item.Seed = e.LogicState.Seed;

            return item;
        });

        for (let i = 0; i < state.Players.length; i++) {
            this.SocketCall("Start", state.Players[i].NetworkState.Key, data);
        } 
    }
    private LeaveGame(player: Player) {
        this.Players = this.Players.filter(e => e.NetworkState.Key !== player.NetworkState.Key);
    }
    private Join(player: Player, state: Room = null) {
        let playerJoined = new PlayerJoinedRoomData();
        playerJoined.Id = player.NetworkState.Id;
        playerJoined.Name = player.NetworkState.Name;

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
            this.SocketCall("PlayerJoinedRoom", state.Players[i].NetworkState.Key, playerJoined);
        }

        //Somthing Off Here
        let playerState = new Player();
        playerState = player;

        if (state.Players.length < 2) {

            this.Logic.Reset(playerState.LogicState, true, this.Random());
            state.Players.push(playerState);


            let result = new JoinRoomResponse();
            result.RoomId = state.Id;
            result.Spectator = false;
            result.Active = state.Active;
            result.Players = state.Players.map(e => {
                let item = new PlayerIdAndName();
                item.Id = e.NetworkState.Id;
                item.Name = e.NetworkState.Name;
                return item;
            });
            this.SocketCall("PlayerJoinedRoomResponse", player.NetworkState.Key, result);

            if (state.Players.length == 2) {
                this.StartGame(state);
            }
        }
        else {
            state.Players.push(new Player());

            let result = new JoinRoomResponse();
            result.RoomId = state.Id;
            result.Spectator = true;
            result.Active = state.Active;
            result.Players = state.Players.map(e => {
                let item = new PlayerIdAndName();
                item.Id = e.NetworkState.Id;
                item.Name = e.NetworkState.Name;
                return item;
            });
            this.SocketCall("PlayerJoinedRoomResponse", player.NetworkState.Key, result);
        }
    }
    private Leave(room: Room, player: Player) {
        room.Players = room.Players.filter(e => e.NetworkState.Id !== player.NetworkState.Id);
        let data = new PlayerLeftRoomData();
        data.Id = player.NetworkState.Id;
        for (let i = 0; room.Players.length; i++) {
            this.SocketCall("PlayerLeftRoom", room.Players[i].NetworkState.Key, data);
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
            if (((currentDateTime - this.Rooms[i].ActiveTime.getTime()) / 1000) > (ROOM_TIME_OUT)) {
                this.Rooms[i].Active = GameActive.Inactive;
                for (let j = 0; j < this.Rooms[i].Players.length; j++) {
                    let data = new RoomClosedData();
                    data.RoomId = this.Rooms[i].Id;
                    this.SocketCall("RoomClosed", this.Rooms[i].Players[j].NetworkState.Key, data);
                }
            }
        }
        this.Rooms = this.Rooms.filter(e => e.Active !== GameActive.Inactive);
    }
    private CheckForInactivePlayers() {
        let currentDateTime = new Date().getTime();
        for (let i = 0; i < this.Players.length; i++) {
            if (((currentDateTime - this.Players[i].NetworkState.DateTimeLastMessageRecived.getTime()) / 1000) > (PLAYER_TIME_OUT)) {
                this.Players[i].NetworkState.Inactive = true;
                this.SocketCall("Inactive", this.Players[i].NetworkState.Key, {});
                for (let j = 0; j < this.Rooms.length; j++) {
                    if (this.Rooms[j].Players.some(e => e.NetworkState.Key === this.Players[i].NetworkState.Key)) {
                        this.Rooms[j].Players = this.Rooms[j].Players.filter(e => e.NetworkState.Key !== this.Players[i].NetworkState.Key);
                    }
                }
            }
        }

        this.Players = this.Players.filter(e => e.NetworkState.Inactive !== true);
    }
    private CheckGameEnd(state: Room) {
        let puzzlesActive = state.Players.filter(e => e.LogicState.Active.Puzzle === true);
        let puzzlesInactive = state.Players.filter(e => e.LogicState.Active.Puzzle === false);
        if (puzzlesInactive.length > 0 &&
            puzzlesActive.length === 1) {
            let maxTick = Math.max(...puzzlesInactive.map(e => { return e.LogicState.Ticks.Puzzle }));
            if (puzzlesActive[0].LogicState.Ticks.Puzzle >= maxTick)
            {
                let data = new GameEnded();
                data.WinnerIds = [puzzlesActive[0].NetworkState.Id];
                for (let i = 0; i < state.Players.length; i++) {
                    this.SocketCall("GameEnded", state.Players[i].NetworkState.Key, data);
                }
            }
            else {
                return;
            }
        }
        else if (puzzlesInactive.length > 0 && puzzlesActive.length === 0) {
            let minTick = Math.min(...puzzlesInactive.map(e => { return e.LogicState.Ticks.Puzzle }));
            let players = puzzlesInactive.filter(e => { return e.LogicState.Ticks.Puzzle === minTick });
            let data = new GameEnded();
            data.WinnerIds = players.map(e => { return e.NetworkState.Id });
            for (let i = 0; i < state.Players.length; i++) {
                this.SocketCall("GameEnded", state.Players[i].NetworkState.Key, data);
            }
        }
    }
    private SendMessage(room: Room, player: Player, message: string) {
        let data = new SendMessageData();
        data.Id = player.NetworkState.Id;
        data.Message = message;

        for (let i = 0; room.Players.length; i++) {
            if (room.Players[i].NetworkState.Id !== player.NetworkState.Id) {
                this.SocketCall("SendMessage", room.Players[i].NetworkState.Key, data);
            }
        }
    }
    private UpdateName(player: Player, state: Room, name: string) {
        player.NetworkState.Name = name;
        for (let i = 0; i < state.Players.length; i++) {
            let data = new UpdatePlayerNameData();
            data.Id = player.NetworkState.Id;
            data.Name = name;
            this.SocketCall("UpdatePlayerName", state.Players[i].NetworkState.Key, data);
        }
    }

    public OnConnection(socket, req) {
        socket.on('message', (data) => {
            this.OnMessage.call(this, data, socket);
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
    public OnMessage(data, socket) {

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
                let player = new Player();
                    player.NetworkState = new NetworkState();
                    player.NetworkState.Id = uuidv1();
                    player.NetworkState.Key = playerKey;
                    player.LogicState = new LogicState();
                    if (requestData.Name !== null) {
                        player.NetworkState.Name = requestData.Name;
                    }
                    else {
                        player.NetworkState.Name = "Player" + ("" + this.Random() * 100000000 + "").substring(0, 5);
                    }
                    
                    this.Players.push(player);

                    let response = new JoinGameResponse();
                response.Id = player.NetworkState.Id;
                response.Name = player.NetworkState.Name;

                    this.SocketCall("JoinGameResponse", playerKey, response);
 
                break;
            }
            case "LeaveGame": {
                let player = this.Players.find(e => e.NetworkState.Key === playerKey);
                let room = this.Rooms.find(e => e.Id === requestData.RoomId);

                if (player != null && room != null) {
                    let playerState = room.Players.find(e => e.NetworkState.Key === playerKey);
                    this.Leave(room, playerState);
                }

                if (player != null) {
                    this.LeaveGame(player);
                }
                break;
            }
            case "JoinRoom": {
                let player = this.Players.find(e => e.NetworkState.Key === playerKey);
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
                let player = this.Players.find(e => e.NetworkState.Key === playerKey);
                let room = this.Rooms.find(e => e.Id === requestData.RoomId);

                if (player != null && room != null) {
                    let playerState = room.Players.find(e => e.NetworkState.Key === playerKey);
                    this.Leave(room, playerState);
                }
                break;
            }
            case "UpdateName": {
                let player = this.Players.find(e => e.NetworkState.Key === playerKey);
                let room = this.Rooms.find(e => e.Id === requestData.RoomId);
                if (player != null && room != null && requestData.Name.length <= 56) {
                    this.UpdateName(player, room, requestData.Name);
                }

                break;
            }
            case "SendMessage": {
                let player = this.Players.find(e => e.NetworkState.Key === playerKey);
                let room = this.Rooms.find(e => e.Id === requestData.RoomId);
                if (player != null && room != null && requestData.Message.length <= 256) {
                    this.SendMessage(room, player, requestData.Message)
                }
                break;
            }
            case "SendLog": {
                let room = this.Rooms.find(e => e.Id === requestData.RoomId);
                let playerState = null;
                if (room != null) {
                    playerState = room.Players.find(e => e.NetworkState.Key === playerKey)
                }
                if (playerState != null && room != null && requestData.LogItems != null) {
                    this.MergeLog(room, playerState, requestData.LogItems);
                }

                break;
            }
            default: {
                break;
            }
        } 

        let p = this.Players.find(e => e.NetworkState.Key === playerKey);
        if (p != null) {
            p.NetworkState.DateTimeLastMessageRecived = new Date();
        }

        this.LogNetworkCallIn(request, playerKey, requestData);
    }
    private SocketCall(action: string, playerKey: string, data: object) {
        this.ws.clients.forEach(function each(client) {
            if (client && client.id === playerKey) {
                client.send(`${action}:${JSON.stringify(data)}`);
            }
        });

        //This Is SLOW
        this.LogNetworkCallOut(action, playerKey, data);
    }
    private LogNetworkCallOut(action: string, playerKey: string, data: object) {
        let p = this.Players.find(e => e.NetworkState.Key === playerKey);
        if (p != null) {
            let item = new NetworkLogUser();
            item.Action = action;
            item.Data = data;
            p.NetworkState.FromServerLog.push(item);
            for (let j = 0; j < this.Rooms.length; j++) {
                if (this.Rooms[j].Players.some(e => e.NetworkState.Id === p.NetworkState.Id)) {
                    let item = new NetworkLogRoom();
                    item.Action = action;
                    item.UserId = p.NetworkState.Id;
                    item.Data = data;
                    this.Rooms[j].FromServerLog.push(item);
                }
            }
        }
    }
    private LogNetworkCallIn(action: string, playerKey: string, data: object) {
        let p = this.Players.find(e => e.NetworkState.Key === playerKey);
        if (p != null) {
            let item = new NetworkLogUser();
            item.Action = action;
            item.Data = data;
            p.NetworkState.ToServerLog.push(item);

            for (let j = 0; j < this.Rooms.length; j++) {
                if (this.Rooms[j].Players.some(e => e.NetworkState.Id === p.NetworkState.Id)) {
                    let item = new NetworkLogRoom();
                    item.Action = action;
                    item.UserId = p.NetworkState.Id;
                    item.Data = data;
                    this.Rooms[j].ToServerLog.push(item);
                }
            }
        }
    }
}


export { Server };
