"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataTypes_js_1 = require("./dataTypes.js");
const puzzleLogic_js_1 = require("./puzzleLogic.js");
const puzzleLoader_js_1 = require("./puzzleLoader.js");
const seedrandom = require("seedrandom");
class Application {
    constructor() {
        this.NetworkCallsOut = [];
        this.Rooms = [];
        this.Players = [];
        this.NetworkCallsOut = [];
        this.Random = seedrandom(null, { state: true });
        this.PuzzleLogic = new puzzleLogic_js_1.PuzzleLogic();
        this.PuzzleLoader = new puzzleLoader_js_1.PuzzleLoader();
        this.InActiveTimer = setTimeout(this.CheckForInactiveRooms, 250);
    }
    CreateRoom() {
        let room = new dataTypes_js_1.Room();
        room.Active = dataTypes_js_1.GameActive.WaitingForPlayers;
        room.ActiveTime = new Date();
        room.Random = seedrandom(null, { state: true });
        room.Id = room.Random();
        room.Players = [];
        return room;
    }
    MergeLog(state, player, logItems) {
        if (state.Active !== dataTypes_js_1.GameActive.GameRunning || logItems.length === 0) {
            return;
        }
        let desync = false;
        let userTick = logItems[logItems.length - 1].Tick;
        let currentTick = this.CurrentTick(state);
        let serverLogId = player.PuzzleLogState.Log[player.PuzzleLogState.Log.length - 1].Id;
        let serverTick = player.PuzzleLogState.CurrentTick;
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
    AutoPlayCheck(state) {
        if (state.Active !== dataTypes_js_1.GameActive.GameRunning) {
            return;
        }
        for (let i = 0; state.Players.length; i++) {
            let player = state.Players[i];
            let serverTick = state.Players[i].PuzzleLogState.CurrentTick;
            let serverLogId = player.PuzzleLogState.Log[player.PuzzleLogState.Log.length - 1].Id;
            let currentTick = this.CurrentTick(state);
            if ((currentTick - serverTick) > 180) {
                this.PuzzleLoader.AdvanceTicks(this.PuzzleLogic, player.PuzzleLogicState, player.PuzzleLogState, (currentTick - serverTick), true);
            }
            for (let j = 0; state.Players.length; j++) {
                this.PlayerLog(state.Players[i].player.Id, player.player.Id, player.PuzzleLogState.Log.slice(serverLogId));
            }
        }
        this.CheckGameEnd(state);
    }
    StartGame(state) {
        state.GameStarted = new Date();
        state.Timer = setTimeout(this.AutoPlayCheck, 250);
        state.Active = dataTypes_js_1.GameActive.GameRunning;
        for (let i = 0; i < state.Players.length; i++) {
            this.PuzzleLogic.Reset(state.Players[i].PuzzleLogicState, true);
        }
        let playersSeedData = state.Players.map(e => {
            let item = new dataTypes_js_1.PlayersSeedData();
            item.Id = e.player.Id,
                item.Seed = e.PuzzleLogicState.Seed;
            return item;
        });
        for (let i = 0; i < state.Players.length; i++) {
            this.Start(state.Players[i].player.Id, playersSeedData);
        }
    }
    Join(player, state = null) {
        let playerJoined = new dataTypes_js_1.PlayerJoined();
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
            let playerState = new dataTypes_js_1.PlayerState();
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
                    };
                })
            };
        }
        else {
            state.Players.push(new dataTypes_js_1.PlayerState());
            return {
                RoomId: state.Id,
                Player: false,
                Active: state.Active,
                Players: state.Players.map(e => {
                    return {
                        Id: e.player.Id,
                        Name: e.player.Name
                    };
                })
            };
        }
        this.StartGame(state);
    }
    Leave(room, player) {
        room.Players = room.Players.filter(e => e.player.Id !== player.player.Id);
        for (let i = 0; room.Players.length; i++) {
            this.PlayerLeftRoom(room.Players[i].player.Id, player.player.Id);
        }
        this.CheckGameEnd(room);
    }
    CurrentTick(state) {
        let endTime = new Date();
        return Math.floor(((state.GameStarted.getTime() - endTime.getTime()) / 1000) * 16.66666666);
    }
    CheckForInactiveRooms() {
        let currentDateTime = new Date().getTime();
        for (let i = 0; this.Rooms.length; i++) {
            if (((currentDateTime - this.Rooms[i].ActiveTime.getTime()) / 1000) > (180 * 1000)) {
                this.Rooms[i].Active = dataTypes_js_1.GameActive.Inactive;
                for (let j = 0; this.Rooms[i].Players.length; j++) {
                    this.RoomActiveUpdate(this.Rooms[i].Players[j].player.Id, this.Rooms[i].Id, dataTypes_js_1.GameActive.Inactive);
                }
            }
        }
        this.Rooms = this.Rooms.filter(e => e.Active !== dataTypes_js_1.GameActive.Inactive);
    }
    CheckGameEnd(state) {
        let puzzlesActive = state.Players.filter(e => e.PuzzleLogicState.Active.Puzzle === true);
        let puzzlesInactive = state.Players.filter(e => e.PuzzleLogicState.Active.Puzzle === false);
        if (puzzlesInactive.length > 0 &&
            puzzlesActive.length <= 1) {
            let maxTick = Math.max(...puzzlesInactive.map(e => { return e.PuzzleLogicState.Ticks.Puzzle; }));
            if (puzzlesActive.length === 0) {
            }
            else if (puzzlesActive[0].PuzzleLogicState.Ticks.Puzzle >= maxTick) {
                state.Active = dataTypes_js_1.GameActive.GameEnded;
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
    updateName(player, state, name) {
        player.Name = name;
        for (let i = 0; state.Players.length; i++) {
            let updateName = new dataTypes_js_1.PlayerNameUpdate();
            updateName.Id = player.Id;
            updateName.Name = name;
            this.UpdatePlayerName(state.Players[i].player.Id, updateName);
        }
    }
    //Player Sends
    UpdateName(roomId, key, name) {
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
    SendMessage(roomId, key, message) {
        let player = this.Players.find(e => e.Key === key);
        let room = this.Rooms.find(e => e.Id === roomId);
        if (player != null && room != null && message.length <= 256) {
            let msg = new dataTypes_js_1.Message();
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
    SendLog(roomId, key, logItems) {
        let room = this.Rooms.find(e => e.Id === roomId);
        let playerState = null;
        if (room != null) {
            playerState = room.Players.find(e => e.player.Key === key);
        }
        if (playerState != null && room != null) {
            this.MergeLog(room, playerState, logItems);
            return 1;
        }
        return 0;
    }
    JoinRoom(key, roomId = null) {
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
    LeaveRoom(roomId, key) {
        let room = this.Rooms.find(e => e.Id === roomId);
        let playerState = null;
        if (room != null) {
            playerState = room.Players.find(e => e.player.Key === key);
        }
        if (playerState != null && room != null) {
            this.Leave(room, playerState);
            return 1;
        }
        return 0;
    }
    JoinGame() {
        let player = new dataTypes_js_1.Player();
        player.Id = this.Random();
        player.Key = this.Random();
        player.Name = "Player" + ("" + this.Random() * 100000 + "").substring(0, 5);
        this.Players.push(player);
        return player;
    }
    LeaveGame(key, roomId = null) {
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
    PlayerLog(sendToPlayerId, playerId, playerLog) {
        this.LogNetworkCall("PlayerLog", sendToPlayerId, {
            playerId: playerId,
            playerLog: playerLog
        });
        return {
            playerId: playerId,
            playerLog: playerLog
        };
    }
    Start(sendToPlayerId, PlayersSeedData) {
        this.LogNetworkCall("Start", sendToPlayerId, PlayersSeedData);
        return PlayersSeedData;
    }
    RoomActiveUpdate(sendToPlayerId, roomId, active) {
        this.LogNetworkCall("RoomActiveUpdate", sendToPlayerId, active);
        return active;
    }
    UpdatePlayerName(sendToPlayerId, playerNameUpdate) {
        this.LogNetworkCall("UpdatePlayerName", sendToPlayerId, playerNameUpdate);
        return playerNameUpdate;
    }
    ReceiveMessage(sendToPlayerId, message) {
        this.LogNetworkCall("ReceiveMessage", sendToPlayerId, message);
        return message;
    }
    PlayerJoinedRoom(sendToPlayerId, player) {
        this.LogNetworkCall("PlayerJoinedRoom", sendToPlayerId, player);
        return player;
    }
    PlayerLeftRoom(sendToPlayerId, player) {
        this.LogNetworkCall("PlayerLeftRoom", sendToPlayerId, player);
        return player;
    }
    GameEnded(sendToPlayerId, winningPlayerId) {
        this.LogNetworkCall("GameEnded", sendToPlayerId, winningPlayerId);
        return winningPlayerId;
    }
    LogNetworkCall(action, sendToPlayerId, data) {
        this.NetworkCallsOut.push({ action: action, playerId: sendToPlayerId, data: data });
    }
}
exports.Application = Application;
//# sourceMappingURL=GameLogic.js.map