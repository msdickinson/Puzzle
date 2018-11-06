var SetType;
(function (SetType) {
    SetType[SetType["Mixed"] = 0] = "Mixed";
    SetType[SetType["Row"] = 1] = "Row";
    SetType[SetType["Col"] = 2] = "Col";
})(SetType || (SetType = {}));
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
var KeyState;
(function (KeyState) {
    KeyState[KeyState["Down"] = 0] = "Down";
    KeyState[KeyState["Up"] = 1] = "Up";
})(KeyState || (KeyState = {}));
var BlockColor;
(function (BlockColor) {
    BlockColor[BlockColor["Green"] = 0] = "Green";
    BlockColor[BlockColor["Blue"] = 1] = "Blue";
    BlockColor[BlockColor["Red"] = 2] = "Red";
    BlockColor[BlockColor["Purple"] = 3] = "Purple";
    BlockColor[BlockColor["Yellow"] = 4] = "Yellow";
    BlockColor[BlockColor["Brown"] = 5] = "Brown";
})(BlockColor || (BlockColor = {}));
var InputOptions;
(function (InputOptions) {
    InputOptions[InputOptions["Up"] = 0] = "Up";
    InputOptions[InputOptions["Down"] = 1] = "Down";
    InputOptions[InputOptions["Left"] = 2] = "Left";
    InputOptions[InputOptions["Right"] = 3] = "Right";
    InputOptions[InputOptions["A"] = 4] = "A";
})(InputOptions || (InputOptions = {}));
var InputSet;
(function (InputSet) {
    InputSet[InputSet["LeftKeyboard"] = 0] = "LeftKeyboard";
    InputSet[InputSet["RightKeyboard"] = 1] = "RightKeyboard";
    InputSet[InputSet["JoyPadOne"] = 2] = "JoyPadOne";
    InputSet[InputSet["JoyPadTwo"] = 3] = "JoyPadTwo";
    InputSet[InputSet["JoyPadThree"] = 4] = "JoyPadThree";
    InputSet[InputSet["JoyPadFour"] = 5] = "JoyPadFour";
})(InputSet || (InputSet = {}));
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
var GameActive;
(function (GameActive) {
    GameActive[GameActive["WaitingForPlayers"] = 0] = "WaitingForPlayers";
    GameActive[GameActive["GameRunning"] = 1] = "GameRunning";
    GameActive[GameActive["GameEnded"] = 2] = "GameEnded";
    GameActive[GameActive["Inactive"] = 3] = "Inactive";
})(GameActive || (GameActive = {}));
class LogItem {
    constructor() {
        this.ValueOne = 0;
        this.ValueTwo = 0;
    }
}
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
class HoverBlock {
    constructor() {
        this.Row = 0;
        this.Col = 0;
    }
}
class FallBlock {
    constructor() {
        this.Row = 0;
        this.Col = 0;
    }
}
class RemovalInstance {
    constructor() {
        this.Chain = 0;
        this.Tick = 0;
        this.EndTick = 0;
    }
}
class Effect {
    constructor() {
        this.StartTick = 0;
        this.EndTick = 0;
        this.Row = 0;
        this.Col = 0;
    }
}
class Tick {
    constructor() {
        this.Puzzle = 0;
        this.MoveBlocksUp = 0;
        this.Swap = 0;
    }
}
class Active {
    constructor() {
        this.Puzzle = false;
        this.Hover = false;
        this.Swap = false;
        this.BlocksRemoving = false;
        this.Falling = false;
    }
}
class Selector {
    constructor() {
        this.Row = 0;
        this.Col = 0;
    }
}
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
class LogState {
    constructor() {
        this.CurrentTick = 0;
        this.TicksPerSecound = 60;
        this.currentLogItem = 0;
        this.currentLogItemCount = 0;
        this.LogId = -1;
        this.Log = [];
    }
}
class LogicState {
    constructor() {
        this.Paused = false;
        this.Log = false;
        this.LogItems = [];
        this.SoundRequests = [];
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
class SoundState {
    constructor() {
        this.SoundMute = true;
    }
}
class Player {
    constructor() {
        this.ViewState = null;
        this.SoundState = null;
        this.LogicState = null;
        this.NetworkState = null;
    }
}
class NetworkState {
    constructor() {
        this.Name = null;
        this.Id = null;
        this.Key = null;
        this.Inactive = false;
        this.DateTimeLastMessageRecived = null;
        this.TickSentServer = null;
        this.Spectator = false;
        this.LocalPlayer = false;
        this.Room = null;
        this.ToServerLog = [];
        this.FromServerLog = [];
    }
}
class PlayersSeedData {
}
class PlayerIdAndName {
}
class Message {
}
class RoomClient {
    constructor() {
        this.Players = [];
        this.Messeages = [];
    }
}
class Room {
    constructor() {
        this.Players = [];
        this.Messeages = [];
        this.FromServerLog = [];
        this.ToServerLog = [];
    }
}
class NetworkLogUser {
}
class NetworkLogRoom {
}
class JoinGameRequest {
    constructor() {
        this.Name = null;
    }
}
class LeaveGameRequest {
    constructor() {
        this.RoomId = null;
    }
}
class JoinRoomRequest {
    constructor() {
        this.RoomId = null;
    }
}
class LeaveRoomRequest {
    constructor() {
        this.RoomId = null;
    }
}
class UpdateNameRequest {
    constructor() {
        this.RoomId = null;
        this.Name = null;
    }
}
class SendMessageRequest {
    constructor() {
        this.RoomId = null;
        this.Message = null;
    }
}
class SendLogRequest {
}
class JoinGameResponse {
    constructor() {
        this.Name = null;
        this.Id = null;
    }
}
class JoinRoomResponse {
    constructor() {
        this.RoomId = null;
        this.Spectator = null;
        this.Active = null;
        this.Players = null;
    }
}
class PlayerJoinedRoomData {
    constructor() {
        this.Id = null;
        this.Name = null;
    }
}
class PlayerLeftRoomData {
    constructor() {
        this.Id = null;
    }
}
class UpdatePlayerNameData {
    constructor() {
        this.Id = null;
        this.Name = null;
    }
}
class SendMessageData {
    constructor() {
        this.Id = null;
        this.Message = null;
    }
}
class UpdateLogData {
    constructor() {
        this.Id = null;
        this.LogItems = null;
    }
}
class StartData {
    constructor() {
        this.PlayersSeedData = null;
    }
}
class RoomClosedData {
    constructor() {
        this.RoomId = null;
    }
}
class GameActiveChange {
    constructor() {
        this.GameActive = null;
    }
}
class GameEnded {
    constructor() {
        this.WinnerIds = null;
    }
}
class ViewState {
    constructor() {
        this.BlocksSprite = [];
        this.Textures = [];
    }
}
export { SetType, BlockState, KeyState, BlockColor, InputOptions, InputSet, SoundRequest, GameActive, Block, LogItem, HoverBlock, FallBlock, RemovalInstance, Effect, Tick, Active, Selector, BlockSet, Constants, LogicState, LogState, Room, Player, PlayersSeedData, Message, PlayerIdAndName, RoomClient, JoinGameRequest, LeaveGameRequest, JoinRoomRequest, LeaveRoomRequest, UpdateNameRequest, SendMessageRequest, SendLogRequest, SoundState, NetworkState, NetworkLogUser, NetworkLogRoom, JoinGameResponse, JoinRoomResponse, PlayerJoinedRoomData, PlayerLeftRoomData, UpdatePlayerNameData, SendMessageData, UpdateLogData, StartData, RoomClosedData, GameActiveChange, GameEnded, ViewState };
//# sourceMappingURL=dataTypes.js.map