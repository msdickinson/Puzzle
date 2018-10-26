"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SetType;
(function (SetType) {
    SetType[SetType["Mixed"] = 0] = "Mixed";
    SetType[SetType["Row"] = 1] = "Row";
    SetType[SetType["Col"] = 2] = "Col";
})(SetType || (SetType = {}));
exports.SetType = SetType;
var BlockState;
(function (BlockState) {
    BlockState[BlockState["None"] = 0] = "None";
    BlockState[BlockState["Exist"] = 1] = "Exist";
    BlockState[BlockState["Hover"] = 2] = "Hover";
    BlockState[BlockState["HoverSwap"] = 3] = "HoverSwap";
    BlockState[BlockState["Switch"] = 4] = "Switch";
    BlockState[BlockState["SwitchNone"] = 5] = "SwitchNone";
    BlockState[BlockState["Remove"] = 6] = "Remove";
    BlockState[BlockState["Falling"] = 7] = "Falling";
    BlockState[BlockState["LockedForFall"] = 8] = "LockedForFall";
})(BlockState || (BlockState = {}));
exports.BlockState = BlockState;
var KeyState;
(function (KeyState) {
    KeyState[KeyState["Down"] = 0] = "Down";
    KeyState[KeyState["Up"] = 1] = "Up";
})(KeyState || (KeyState = {}));
exports.KeyState = KeyState;
var BlockColor;
(function (BlockColor) {
    BlockColor[BlockColor["Green"] = 0] = "Green";
    BlockColor[BlockColor["Blue"] = 1] = "Blue";
    BlockColor[BlockColor["Red"] = 2] = "Red";
    BlockColor[BlockColor["Purple"] = 3] = "Purple";
    BlockColor[BlockColor["Yellow"] = 4] = "Yellow";
    BlockColor[BlockColor["Brown"] = 5] = "Brown";
})(BlockColor || (BlockColor = {}));
exports.BlockColor = BlockColor;
var InputOptions;
(function (InputOptions) {
    InputOptions[InputOptions["Up"] = 0] = "Up";
    InputOptions[InputOptions["Down"] = 1] = "Down";
    InputOptions[InputOptions["Left"] = 2] = "Left";
    InputOptions[InputOptions["Right"] = 3] = "Right";
    InputOptions[InputOptions["A"] = 4] = "A";
})(InputOptions || (InputOptions = {}));
exports.InputOptions = InputOptions;
var InputSet;
(function (InputSet) {
    InputSet[InputSet["LeftKeyboard"] = 0] = "LeftKeyboard";
    InputSet[InputSet["RightKeyboard"] = 1] = "RightKeyboard";
    InputSet[InputSet["JoyPadOne"] = 2] = "JoyPadOne";
    InputSet[InputSet["JoyPadTwo"] = 3] = "JoyPadTwo";
    InputSet[InputSet["JoyPadThree"] = 4] = "JoyPadThree";
    InputSet[InputSet["JoyPadFour"] = 5] = "JoyPadFour";
})(InputSet || (InputSet = {}));
exports.InputSet = InputSet;
var SoundRequest;
(function (SoundRequest) {
    SoundRequest[SoundRequest["Swap"] = 0] = "Swap";
    SoundRequest[SoundRequest["Remove"] = 1] = "Remove";
    SoundRequest[SoundRequest["Fall"] = 2] = "Fall";
    SoundRequest[SoundRequest["Hover"] = 3] = "Hover";
    SoundRequest[SoundRequest["MusicOn"] = 4] = "MusicOn";
    SoundRequest[SoundRequest["MusicOff"] = 5] = "MusicOff";
    SoundRequest[SoundRequest["Combo"] = 6] = "Combo";
    SoundRequest[SoundRequest["LargeCombo"] = 7] = "LargeCombo";
})(SoundRequest || (SoundRequest = {}));
exports.SoundRequest = SoundRequest;
var GameActive;
(function (GameActive) {
    GameActive[GameActive["WaitingForPlayers"] = 0] = "WaitingForPlayers";
    GameActive[GameActive["GameRunning"] = 1] = "GameRunning";
    GameActive[GameActive["GameEnded"] = 2] = "GameEnded";
    GameActive[GameActive["Inactive"] = 3] = "Inactive";
})(GameActive || (GameActive = {}));
exports.GameActive = GameActive;
class LogItem {
    constructor() {
        this.ValueOne = 0;
        this.ValueTwo = 0;
    }
}
exports.LogItem = LogItem;
class Block {
    constructor() {
        this.Color = BlockColor.Brown;
        this.State = BlockState.None;
        this.TotalChain = 0;
        this.Tick = 0;
        this.FallGroupTicks = 0;
        this.groupId = 0;
    }
}
exports.Block = Block;
class HoverBlock {
    constructor() {
        this.Row = 0;
        this.Col = 0;
    }
}
exports.HoverBlock = HoverBlock;
class FallBlock {
    constructor() {
        this.Row = 0;
        this.Col = 0;
    }
}
exports.FallBlock = FallBlock;
class RemovalInstance {
    constructor() {
        this.Chain = 0;
        this.Tick = 0;
        this.EndTick = 0;
    }
}
exports.RemovalInstance = RemovalInstance;
class Effect {
    constructor() {
        this.StartTick = 0;
        this.EndTick = 0;
        this.Row = 0;
        this.Col = 0;
    }
}
exports.Effect = Effect;
class Tick {
    constructor() {
        this.Puzzle = 0;
        this.MoveBlocksUp = 0;
        this.Swap = 0;
    }
}
exports.Tick = Tick;
class Active {
    constructor() {
        this.Puzzle = false;
        this.Hover = false;
        this.Swap = false;
        this.BlocksRemoving = false;
        this.Falling = false;
    }
}
exports.Active = Active;
class Selector {
    constructor() {
        this.Row = 0;
        this.Col = 0;
    }
}
exports.Selector = Selector;
class BlockSet {
    constructor() {
        this.Row = 0;
        this.Col = 0;
        this.Count = 0;
        this.NewSetIndex = 0;
        this.Intersects = 0;
        this.Type = SetType.Col;
    }
}
exports.BlockSet = BlockSet;
class Constants {
}
Constants.MAX_ROWS = 12;
Constants.MAX_COLS = 6;
Constants.STARTING_ROWS = 4;
Constants.TICKS_FOR_SWAP = 10;
Constants.TICKS_FOR_REMOVING_BLOCKS = 30;
Constants.TICKS_FOR_HOVER = 5;
Constants.TICKS_FOR_HOVER_SWAP = 5;
Constants.TICKS_FOR_FALL = 3;
exports.Constants = Constants;
class PuzzleLogState {
    constructor() {
        this.CurrentTick = 0;
        this.TicksPerSecound = 60;
        this.currentLogItem = 0;
        this.currentLogItemCount = 0;
        this.LogId = -1;
        this.Log = [];
    }
}
exports.PuzzleLogState = PuzzleLogState;
class PuzzleLogicState {
    constructor() {
        this.Paused = false;
        this.Log = false;
        this.LogItems = [];
        this.Blocks = [];
        this.HoverBlocks = [];
        this.FallBlocks = [];
        this.BlocksMoveFast = false;
        //Switch
        this.SwitchLeftBlockRow = 0;
        this.SwitchLeftBlockCol = 0;
        this.SwitchRightBlockRow = 0;
        this.SwitchRightBlockCol = 0;
        this.SwapOverRide = false;
        this.WaitForSwap = false;
        this.BlockInc = 0;
        this.Score = 0;
        this.Level = 1;
        this.Chain = 0;
        this.groupId = 1;
        this.Selector = new Selector();
        this.Active = new Active();
        this.Ticks = new Tick();
        this.SetCount = 0;
        this.Set = [];
        this.BlockSets = [];
    }
}
exports.PuzzleLogicState = PuzzleLogicState;
class InputState {
    constructor() {
        this.InputSet = null;
    }
}
class SoundState {
    constructor() {
        this.SoundMute = true;
    }
}
exports.SoundState = SoundState;
class Player {
    constructor() {
        this.ViewState = null;
        this.SoundState = null;
        this.InputState = null;
        this.LogicState = null;
        this.NetworkState = null;
        this.Socket = null;
    }
}
exports.Player = Player;
class NetworkState {
    constructor() {
        this.Name = null;
        this.Id = null;
        this.Key = null;
        this.TickSentServer = null;
        this.Spectator = false;
        this.LocalPlayer = false;
        this.Room = null;
    }
}
exports.NetworkState = NetworkState;
class PlayersSeedData {
}
exports.PlayersSeedData = PlayersSeedData;
class PlayerIdAndName {
}
exports.PlayerIdAndName = PlayerIdAndName;
class Message {
}
exports.Message = Message;
class RoomClient {
    constructor() {
        this.Players = [];
        this.Messeages = [];
    }
}
exports.RoomClient = RoomClient;
class Room {
    constructor() {
        this.Players = [];
        this.Messeages = [];
    }
}
exports.Room = Room;
class JoinGameRequest {
    constructor() {
        this.Name = null;
    }
}
exports.JoinGameRequest = JoinGameRequest;
class LeaveGameRequest {
    constructor() {
        this.RoomId = null;
    }
}
exports.LeaveGameRequest = LeaveGameRequest;
class JoinRoomRequest {
    constructor() {
        this.RoomId = null;
    }
}
exports.JoinRoomRequest = JoinRoomRequest;
class LeaveRoomRequest {
    constructor() {
        this.RoomId = null;
    }
}
exports.LeaveRoomRequest = LeaveRoomRequest;
class UpdateNameRequest {
    constructor() {
        this.RoomId = null;
        this.Name = null;
    }
}
exports.UpdateNameRequest = UpdateNameRequest;
class SendMessageRequest {
    constructor() {
        this.RoomId = null;
        this.Message = null;
    }
}
exports.SendMessageRequest = SendMessageRequest;
class SendLogRequest {
}
exports.SendLogRequest = SendLogRequest;
class JoinGameResponse {
    constructor() {
        this.Name = null;
        this.Id = null;
    }
}
exports.JoinGameResponse = JoinGameResponse;
class JoinRoomResponse {
    constructor() {
        this.RoomId = null;
        this.Spectator = null;
        this.Active = null;
        this.Players = null;
    }
}
exports.JoinRoomResponse = JoinRoomResponse;
class PlayerJoinedRoomData {
    constructor() {
        this.Id = null;
        this.Name = null;
    }
}
exports.PlayerJoinedRoomData = PlayerJoinedRoomData;
class PlayerLeftRoomData {
    constructor() {
        this.Id = null;
    }
}
exports.PlayerLeftRoomData = PlayerLeftRoomData;
class UpdatePlayerNameData {
    constructor() {
        this.Id = null;
        this.Name = null;
    }
}
exports.UpdatePlayerNameData = UpdatePlayerNameData;
class SendMessageData {
    constructor() {
        this.Id = null;
        this.Message = null;
    }
}
exports.SendMessageData = SendMessageData;
class UpdateLogData {
    constructor() {
        this.Id = null;
        this.LogItems = null;
    }
}
exports.UpdateLogData = UpdateLogData;
class StartData {
    constructor() {
        this.PlayersSeedData = null;
    }
}
exports.StartData = StartData;
class RoomClosedData {
    constructor() {
        this.RoomId = null;
    }
}
exports.RoomClosedData = RoomClosedData;
class GameActiveChange {
    constructor() {
        this.GameActive = null;
    }
}
exports.GameActiveChange = GameActiveChange;
class GameEnded {
    constructor() {
        this.WinnerIds = null;
    }
}
exports.GameEnded = GameEnded;
class PuzzleViewState {
}
//# sourceMappingURL=dataTypes.js.map