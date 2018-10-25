import {
    Player, GameActive, Room, LogItem, PlayerState, Active, PlayersSeedData, Message, PlayerNameUpdate, PlayerJoined, PuzzleLogicState
} from './dataTypes.js'


import { PuzzleLogic } from './puzzleLogic.js';
import { PuzzleLoader } from './puzzleLoader.js';
import seedrandom = require('seedrandom');

class Application {
    private Random: seedrandom.prng;
    private Rooms: Room[];
    private Players: Player[];
    private PuzzleLogic: PuzzleLogic;
    private PuzzleLoader: PuzzleLoader;
    private InActiveTimer;
    private NetworkCallsOut: Array<object> = [];
    constructor() {
        this.Rooms = [];
        this.Players = [];
        this.NetworkCallsOut = []
        this.Random = seedrandom(null, { state: true });
        this.PuzzleLogic = new PuzzleLogic();
        this.PuzzleLoader = new PuzzleLoader();
        this.InActiveTimer = setTimeout(this.CheckForInactiveRooms, 250);
    }
    private CreateRoom() {
        let room: Room = new Room();
        room.Active = GameActive.WaitingForPlayers;
        room.ActiveTime = new Date();

        room.Random = seedrandom(null, { state: true });
        room.Id = room.Random();
        room.Players = [];

        return room;
    }

    private MergeLog(state: Room, player: PlayerState, logItems: LogItem[]) {
        if (state.Active !== GameActive.GameRunning || logItems.length === 0) {
            return;
        }
        let desync: boolean = false;
        let userTick = logItems[logItems.length - 1].Tick;
        let currentTick = this.CurrentTick(state);
        let serverLogId = player.PuzzleLogState.Log[player.PuzzleLogState.Log.length - 1].Id;
        let serverTick: number = player.PuzzleLogState.CurrentTick;
        if ((currentTick - userTick) <= 180) {
            this.PuzzleLoader.MergeLogItems(player.PuzzleLogState, logItems);
            this.PuzzleLoader.AdvanceToEndOfLog(this.PuzzleLogic, player.PuzzleLogicState, player.PuzzleLogState, serverLogId + 1);
        }
        else {
            desync = true;
            this.PuzzleLoader.AdvanceTicks(this.PuzzleLogic, player.PuzzleLogicState, player.PuzzleLogState, (currentTick - serverTick), true);
        }

        for (let i = 0; state.Players.length; i++) {
            if (desync || state.Players[i].player.Id !== player.player.Id) {
                this.PlayerLog(state.Players[i].player.Id, player.player.Id, player.PuzzleLogState.Log.slice(serverLogId));
            }
        }

        this.CheckGameEnd(state);
    }
    private AutoPlayCheck(state: Room) {
        if (state.Active !== GameActive.GameRunning) {
            return;
        }
        for (let i = 0; state.Players.length; i++) {
            let player: PlayerState = state.Players[i];
            let serverTick: number = state.Players[i].PuzzleLogState.CurrentTick;
            let serverLogId = player.PuzzleLogState.Log[player.PuzzleLogState.Log.length - 1].Id;
            let currentTick: number = this.CurrentTick(state);
            if ((currentTick - serverTick) > 180) {
                this.PuzzleLoader.AdvanceTicks(this.PuzzleLogic, player.PuzzleLogicState, player.PuzzleLogState, (currentTick - serverTick), true);
            }

            for (let j = 0; state.Players.length; j++) {
                this.PlayerLog(state.Players[i].player.Id, player.player.Id, player.PuzzleLogState.Log.slice(serverLogId));
            }
        }
        this.CheckGameEnd(state);
    }
    private StartGame(state: Room) {
        state.GameStarted = new Date();
        state.Timer = setTimeout(this.AutoPlayCheck, 250);
        state.Active = GameActive.GameRunning;

        for (let i = 0; i < state.Players.length; i++) {
            this.PuzzleLogic.Reset(state.Players[i].PuzzleLogicState, true)
        } 

        let playersSeedData = state.Players.map(e =>
        {
            let item = new PlayersSeedData();
            item.Id = e.player.Id,
            item.Seed = e.PuzzleLogicState.Seed;

            return item;
        });

        for (let i = 0; i < state.Players.length; i++) {
            this.Start(state.Players[i].player.Id, playersSeedData);
        } 

    }
    private Join(player: Player, state: Room = null) {
        let playerJoined = new PlayerJoined();
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
             this.PlayerJoinedRoom(state.Players[i].player.Id, playerJoined);
        }
       

        if (state.Players.length < 2) {
            let playerState = new PlayerState();
            playerState.player = player;
            this.PuzzleLogic.Reset(playerState.PuzzleLogicState, true, this.Random());
            state.Players.push(playerState);

            if (state.Players.length == 2) {
                this.StartGame(state);
            }

            return {
                RoomId: state.Id,
                Active: state.Active,
                Playing: true,
                Players: state.Players.map(e => {
                    return {
                        Id: e.player.Id,
                        Name: e.player.Name
                    }
                })
            }
        }
        else {
            state.Players.push(new PlayerState());
            return {
                RoomId: state.Id,
                Player: false,
                Active: state.Active,
                Players: state.Players.map(e => {
                    return {
                        Id: e.player.Id,
                        Name: e.player.Name
                    }
                })
            }
        }
        this.StartGame(state);
    }
    private Leave(room: Room, player: PlayerState) {
        room.Players = room.Players.filter(e => e.player.Id !== player.player.Id);
        for (let i = 0; room.Players.length; i++) {
            this.PlayerLeftRoom(room.Players[i].player.Id, player.player.Id);
        }


        this.CheckGameEnd(room);
    }
    private CurrentTick(state: Room) {
        let endTime = new Date();
        return Math.floor(((state.GameStarted.getTime() - endTime.getTime()) / 1000) * 16.66666666);
    }
    private CheckForInactiveRooms() {
        let currentDateTime = new Date().getTime();
        for (let i = 0; this.Rooms.length; i++) {
            if (((currentDateTime - this.Rooms[i].ActiveTime.getTime()) / 1000) > (180 * 1000)) {
                this.Rooms[i].Active = GameActive.Inactive;
                for (let j = 0; this.Rooms[i].Players.length; j++) {
                    this.RoomActiveUpdate(this.Rooms[i].Players[j].player.Id, this.Rooms[i].Id, GameActive.Inactive);
                }
            }
        }
        this.Rooms = this.Rooms.filter(e => e.Active !== GameActive.Inactive);
    }
    private CheckGameEnd(state: Room) {
        let puzzlesActive = state.Players.filter(e => e.PuzzleLogicState.Active.Puzzle === true);
        let puzzlesInactive = state.Players.filter(e => e.PuzzleLogicState.Active.Puzzle === false);
        if (puzzlesInactive.length > 0 &&
            puzzlesActive.length <= 1) {
            let maxTick = Math.max(...puzzlesInactive.map(e => { return e.PuzzleLogicState.Ticks.Puzzle }));

            if (puzzlesActive.length === 0) {

            }

            else if (puzzlesActive[0].PuzzleLogicState.Ticks.Puzzle >= maxTick)
            {
                state.Active = GameActive.GameEnded;
                clearInterval(state.Timer);
                for (let i = 0; state.Players.length; i++) {
                    this.GameEnded(state.Players[i].player.Id, puzzlesActive[0].player.Id);
                }
            }
            else {
                return;
            }
        }
    }

    private updateName(player: Player, state: Room, name: string) {
        player.Name = name;
        for (let i = 0; state.Players.length; i++) {
            let updateName = new PlayerNameUpdate();
            updateName.Id = player.Id;
            updateName.Name = name;
            this.UpdatePlayerName(state.Players[i].player.Id, updateName);
        }
    }

    //Player Sends
    public UpdateName(roomId: number, key: number, name: string) {
        let player = this.Players.find(e => e.Key === key);
        let room = this.Rooms.find(e => e.Id === roomId);
        if (player != null && room != null && name.length <= 56) {
            this.updateName(player, room, name);
            return 1;
        }
        else {
            return 0;
        }
    }
    public SendMessage(roomId: number, key: number, message: string) {
        let player = this.Players.find(e => e.Key === key);
        let room = this.Rooms.find(e => e.Id === roomId);
        if (player != null && room != null && message.length <= 256) {
            let msg = new Message();
            msg.playerId = player.Id;
            msg.messeage = message;
            room.Messeages.push();
            for (let i = 0; room.Players.length; i++) {
                if (room.Players[i].player.Id !== msg.playerId) {
                    this.ReceiveMessage(room.Players[i].player.Id, msg);
                }
            }
            return 1;
        }
        return 0;

    }
    public SendLog(roomId: number, key: number, logItems: LogItem[]) {
        let room = this.Rooms.find(e => e.Id === roomId);
        let playerState = null;
        if (room != null) {
            playerState = room.Players.find(e => e.player.Key === key)
        }
        if (playerState != null && room != null) {
            this.MergeLog(room, playerState, logItems);
            return 1;
        }
        return 0;
    }
    public JoinRoom(key: number, roomId: number = null) {
       let player = this.Players.find(e => e.Key === key);
        if (player != null) {
            if (roomId === null) {
                return this.Join(player);
            }
            else {
                let room = this.Rooms.find(e => e.Id === roomId);
                if (room != null) {
                    return this.Join(player, room);
                }
                else {
                    return 0;
                }
            }
        }
        else {
            return 0;
        }

    }
    public LeaveRoom(roomId: number, key: number) {
        let room = this.Rooms.find(e => e.Id === roomId);
        let playerState = null;
        if (room != null) {
            playerState = room.Players.find(e => e.player.Key === key)
        }

        if (playerState != null && room != null) {
            this.Leave(room, playerState);
            return 1;
        }
        return 0;

    }
    public JoinGame() {
        let player = new Player();
        player.Id = this.Random();
        player.Key = this.Random();
        player.Name = "Player" + ("" + this.Random() * 100000 + "").substring(0, 5);

        this.Players.push(player);

        return player;

    }
    public LeaveGame(key: number, roomId: number = null) {
        let player = this.Players.find(e => e.Key === key);
        let room = this.Rooms.find(e => e.Id === roomId);

        if (player != null && room != null) {
            let playerState = room.Players.find(e => e.player.Key === key);
            this.Leave(room, playerState);
        }

        if (player != null) {
            this.Players = this.Players.filter(e => e.Key !== key);
        }
    }

    //Server Sends
    private PlayerLog(sendToPlayerId: number, playerId: number, playerLog: LogItem[]) {
        this.LogNetworkCall("PlayerLog", sendToPlayerId, {
            playerId: playerId,
            playerLog: playerLog
        });
        return {
            playerId: playerId,
            playerLog: playerLog
        }
    }
    private Start(sendToPlayerId: number, PlayersSeedData: PlayersSeedData[]) {
        this.LogNetworkCall("Start", sendToPlayerId, PlayersSeedData);
        return PlayersSeedData;
    }
    private RoomActiveUpdate(sendToPlayerId: number, roomId: number, active: GameActive) {
        this.LogNetworkCall("RoomActiveUpdate", sendToPlayerId, active);
        return active;
    }
    private UpdatePlayerName(sendToPlayerId: number, playerNameUpdate: PlayerNameUpdate) {
        this.LogNetworkCall("UpdatePlayerName", sendToPlayerId, playerNameUpdate);
        return playerNameUpdate;
    }
    private ReceiveMessage(sendToPlayerId: number, message: Message) {
        this.LogNetworkCall("ReceiveMessage", sendToPlayerId, message);
        return message;
    }
    private PlayerJoinedRoom(sendToPlayerId: number, player: PlayerJoined) {
        this.LogNetworkCall("PlayerJoinedRoom", sendToPlayerId, player);
        return player;
    }
    private PlayerLeftRoom(sendToPlayerId: number, player: number) {
        this.LogNetworkCall("PlayerLeftRoom", sendToPlayerId, player);
        return player;
    }
    private GameEnded(sendToPlayerId: number, winningPlayerId: number) {
        this.LogNetworkCall("GameEnded", sendToPlayerId, winningPlayerId);
        return winningPlayerId;
    }

    private LogNetworkCall(action: string, sendToPlayerId: number, data: any) {
        this.NetworkCallsOut.push({ action: action, playerId: sendToPlayerId, data: data });
    }
}

export { Application };
