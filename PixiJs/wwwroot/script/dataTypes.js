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
Constants.STARTING_ROWS = 8;
Constants.TICKS_FOR_SWAP = 2;
Constants.TICKS_FOR_REMOVING_BLOCKS = 10;
Constants.TICKS_FOR_HOVER = 5;
Constants.TICKS_FOR_HOVER_SWAP = 10;
export { SetType, BlockState, KeyState, BlockColor, InputOptions, InputSet, SoundRequest, Block, HoverBlock, FallBlock, RemovalInstance, Effect, Tick, Active, Selector, BlockSet, Constants };
//# sourceMappingURL=dataTypes.js.map