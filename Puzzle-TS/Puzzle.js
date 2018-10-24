"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataTypes_js_1 = require("./dataTypes.js");
const seedrandom_js_1 = require("./lib/seedrandom.js");
class Puzzle {
    constructor(View, soundService, textures, mute, log, seed, name) {
        this.debug = true;
        this.random = null;
        this.logic = new PuzzleLogic();
        this.logic.Reset(log, seed);
        this.PuzzleLoader = new PuzzleLoader(this);
        this.soundService = soundService;
        this.mute = mute;
        this.View = View;
        this.view = new PuzzleView(name, this.View, textures);
    }
    Tick() {
        this.logic.Tick();
    }
    ViewUpdate() {
        this.view.Update(this.logic);
    }
    SoundUpdate() {
        if (!this.mute) {
            for (var i = 0; i < this.logic.State.SoundRequests.length; i++) {
                if (this.logic.State.SoundRequests[i] === dataTypes_js_1.SoundRequest.Swap) {
                    this.soundService.swap.play();
                }
                if (this.logic.State.SoundRequests[i] === dataTypes_js_1.SoundRequest.Fall) {
                    this.soundService.swap.play();
                }
                if (this.logic.State.SoundRequests[i] === dataTypes_js_1.SoundRequest.Remove) {
                    this.soundService.swap.play();
                }
            }
        }
        this.logic.State.SoundRequests.length = 0;
    }
    InputAction(input) {
        if (input === dataTypes_js_1.InputOptions.Up) {
            this.logic.RequestMoveSelector(this.logic.State.Selector.Row + 1, this.logic.State.Selector.Col);
        }
        else if (input === dataTypes_js_1.InputOptions.Left) {
            this.logic.RequestMoveSelector(this.logic.State.Selector.Row, this.logic.State.Selector.Col - 1);
        }
        else if (input === dataTypes_js_1.InputOptions.Down) {
            this.logic.RequestMoveSelector(this.logic.State.Selector.Row - 1, this.logic.State.Selector.Col);
        }
        else if (input === dataTypes_js_1.InputOptions.Right) {
            this.logic.RequestMoveSelector(this.logic.State.Selector.Row, this.logic.State.Selector.Col + 1);
        }
        else if (input === dataTypes_js_1.InputOptions.A) {
            this.logic.RequestSwitch();
        }
        if (this.debug) {
            this.ViewUpdate();
        }
    }
}
exports.Puzzle = Puzzle;
class PuzzleLogic {
    constructor() {
    }
    //|Public|
    Reset(log = false, seed = null) {
        this.State = new dataTypes_js_1.PuzzleLogicState();
        //Seed
        if (seed != null) {
            this.State.Seed = seed;
        }
        else {
            this.State.Seed = seedrandom_js_1.seedRandom.seedrandom(Math.random());
        }
        this.State.Random = seedrandom_js_1.seedRandom.seedrandom(this.State.Seed, { state: true });
        //Log
        this.State.Log = log;
        this.State.LogItems = [];
        if (this.State.Log) {
            let logItem = new dataTypes_js_1.LogItem();
            logItem.Id = this.State.LogItems.length;
            logItem.Action = "Seed";
            logItem.ValueOne = this.State.Seed;
            this.State.LogItems.push(logItem);
        }
        this.State.SoundRequests = [];
        this.State.Active.Puzzle = true;
        this.State.Active.Hover = false;
        this.State.Active.Swap = false;
        this.State.Active.Falling = false;
        this.State.SwapOverRide = false;
        this.State.Ticks.Puzzle = 0;
        this.State.WaitForSwap = false;
        this.State.Ticks.MoveBlocksUp = 0;
        this.State.Ticks.Swap = 0;
        this.State.BlockInc = 0;
        this.State.Blocks = [];
        for (var row = 0; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            this.State.Blocks[row] = [];
            this.State.HoverBlocks[row] = [];
            this.State.FallBlocks[row] = [];
            for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                const block = new dataTypes_js_1.Block();
                block.State = dataTypes_js_1.BlockState.None;
                block.Color = dataTypes_js_1.BlockColor.Red;
                block.FallGroupTicks = 0;
                block.Tick = 0;
                block.groupId = 0;
                this.State.Blocks[row][col] = new dataTypes_js_1.Block();
                this.State.HoverBlocks[row][col] = new dataTypes_js_1.HoverBlock();
                this.State.FallBlocks[row][col] = new dataTypes_js_1.FallBlock();
            }
        }
        for (var i = 0; i < dataTypes_js_1.Constants.MAX_ROWS * dataTypes_js_1.Constants.MAX_COLS; i++) {
            this.State.BlockSets[i] = 0;
            this.State.Set[i] = new dataTypes_js_1.BlockSet();
        }
        this.State.Score = 0;
        this.State.Level = 1;
        this.State.groupId = 1;
        this.State.Selector.Row = 2;
        this.State.Selector.Col = 2;
        this.CreateSetupBlocks();
    }
    Tick() {
        if (this.State.Active.Puzzle) {
            if (this.State.Log) {
                if (this.State.LogItems[this.State.LogItems.length - 1].Action !== "Tick") {
                    let logItem = new dataTypes_js_1.LogItem();
                    logItem.Id = this.State.LogItems.length;
                    logItem.Action = "Tick";
                    logItem.ValueOne = 1;
                    this.State.LogItems.push(logItem);
                }
                else {
                    this.State.LogItems[this.State.LogItems.length - 1].ValueOne++;
                }
            }
            this.State.Ticks.Puzzle++;
            if (this.State.Active.Falling) {
                this.FallTick();
            }
            if (this.State.Active.Hover) {
                this.HoverTick();
            }
            if (this.State.Active.BlocksRemoving) {
                this.RemoveBlocksTick();
            }
            if (this.State.Active.Swap) {
                this.SwapBlocksTick();
            }
            if (!this.State.Active.BlocksRemoving && !this.State.Active.Hover) {
                this.MoveBlocksUpTick();
            }
            if (this.State.Ticks.Puzzle % (60 * 20) == 0)
                this.State.Level++;
            this.UpdateActive();
        }
    }
    RequestMoveSelector(row, col) {
        if (col >= 0 && col < (dataTypes_js_1.Constants.MAX_COLS - 1) && row >= 1 && row < dataTypes_js_1.Constants.MAX_ROWS) {
            if (this.State.Log) {
                let logItem = new dataTypes_js_1.LogItem();
                logItem.Id = this.State.LogItems.length;
                logItem.Action = "RequestMoveSelector";
                logItem.ValueOne = row;
                logItem.ValueTwo = col;
                this.State.LogItems.push(logItem);
            }
            this.State.Selector.Row = row;
            this.State.Selector.Col = col;
        }
    }
    RequestSwitch() {
        if (!this.State.Active.Swap) {
            if ((this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col].State == dataTypes_js_1.BlockState.None || this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col].State == dataTypes_js_1.BlockState.Exist) && (this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col + 1].State == dataTypes_js_1.BlockState.None || this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col + 1].State == dataTypes_js_1.BlockState.Exist) && (this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col].State != dataTypes_js_1.BlockState.None || this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col + 1].State != dataTypes_js_1.BlockState.None)) {
                if (this.State.Log) {
                    let logItem = new dataTypes_js_1.LogItem();
                    logItem.Id = this.State.LogItems.length;
                    logItem.Action = "RequestSwitch";
                    this.State.LogItems.push(logItem);
                }
                this.State.SoundRequests.push(dataTypes_js_1.SoundRequest.Swap);
                this.State.WaitForSwap = false;
                this.State.Active.Swap = true;
                this.State.SwitchLeftBlockRow = this.State.Selector.Row;
                this.State.SwitchLeftBlockCol = this.State.Selector.Col;
                this.State.SwitchRightBlockRow = this.State.Selector.Row;
                this.State.SwitchRightBlockCol = this.State.Selector.Col + 1;
                if (this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State == dataTypes_js_1.BlockState.Exist) {
                    this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = dataTypes_js_1.BlockState.Switch;
                }
                else {
                    this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = dataTypes_js_1.BlockState.SwitchNone;
                }
                if (this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State == dataTypes_js_1.BlockState.Exist) {
                    this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = dataTypes_js_1.BlockState.Switch;
                }
                else {
                    this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = dataTypes_js_1.BlockState.SwitchNone;
                }
            }
        }
    }
    UpdateActive() {
        this.State.Active.BlocksRemoving = false;
        this.State.Active.Falling = false;
        this.State.Active.Hover = false;
        for (var row = 0; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                if (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Falling || this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.LockedForFall) {
                    this.State.Active.Falling = true;
                }
                else if (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Hover || this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.HoverSwap) {
                    this.State.Active.Hover = true;
                }
                else if (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Remove) {
                    this.State.Active.BlocksRemoving = true;
                }
            }
        }
    }
    SaveState() {
        return JSON.parse(JSON.stringify({
            Paused: this.State.Paused,
            Log: this.State.Log,
            LogItems: this.State.LogItems,
            SoundRequests: this.State.SoundRequests,
            Blocks: this.State.Blocks,
            Random: this.State.Random.state(),
            HoverBlocks: this.State.HoverBlocks,
            FallBlocks: this.State.FallBlocks,
            BlocksMoveFast: this.State.BlocksMoveFast,
            SwitchLeftBlockRow: this.State.SwitchLeftBlockRow,
            SwitchLeftBlockCol: this.State.SwitchLeftBlockCol,
            SwitchRightBlockRow: this.State.SwitchRightBlockRow,
            SwitchRightBlockCol: this.State.SwitchRightBlockCol,
            SwapOverRide: this.State.SwapOverRide,
            WaitForSwap: this.State.WaitForSwap,
            BlockInc: this.State.BlockInc,
            Score: this.State.Score,
            Level: this.State.Level,
            Chain: this.State.Chain,
            groupId: this.State.groupId,
            Selector: this.State.Selector,
            Active: this.State.Active,
            Ticks: this.State.Ticks,
            SetCount: this.State.SetCount,
            Set: this.State.Set,
            BlockSetsCount: this.State.BlockSetsCount,
            BlockSets: this.State.BlockSets
        }));
    }
    LoadState(state) {
        this.State.Paused = state.Paused;
        this.State.Log = state.Log;
        this.State.LogItems = state.LogItems;
        this.State.SoundRequests = state.SoundRequests;
        this.State.Blocks = state.Blocks;
        this.State.Random = seedrandom_js_1.seedRandom.seedrandom("", { state: state.Random });
        this.State.HoverBlocks = state.HoverBlocks;
        this.State.FallBlocks = state.FallBlocks;
        this.State.BlocksMoveFast = state.BlocksMoveFast;
        this.State.SwitchLeftBlockRow = state.SwitchLeftBlockRow;
        this.State.SwitchLeftBlockCol = state.SwitchLeftBlockCol;
        this.State.SwitchRightBlockRow = state.SwitchRightBlockRow;
        this.State.SwitchRightBlockCol = state.SwitchRightBlockCol;
        this.State.SwapOverRide = state.SwapOverRide;
        this.State.WaitForSwap = state.WaitForSwap;
        this.State.BlockInc = state.BlockInc;
        this.State.Score = state.Score;
        this.State.Level = state.Level;
        this.State.Chain = state.Chain;
        this.State.groupId = state.groupId;
        this.State.Selector = state.Selector;
        this.State.Active = state.Active;
        this.State.Ticks = state.Ticks;
        this.State.SetCount = state.SetCount;
        this.State.Set = state.Set;
        this.State.BlockSetsCount = state.BlockSetsCount;
        this.State.BlockSets = state.BlockSets;
    }
    //Private
    //Ticks
    HoverTick() {
        var falling = false;
        for (var row = 0; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                if ((this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Hover || this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.HoverSwap)) {
                    this.State.Blocks[row][col].Tick++;
                    if ((this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Hover && this.State.Blocks[row][col].Tick == dataTypes_js_1.Constants.TICKS_FOR_HOVER) || (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.HoverSwap && this.State.Blocks[row][col].Tick == dataTypes_js_1.Constants.TICKS_FOR_HOVER_SWAP)) {
                        this.State.Blocks[row][col].Tick = 0;
                        this.State.Blocks[row][col].State = dataTypes_js_1.BlockState.Falling;
                        this.State.Blocks[row][col].groupId = 0;
                        falling = true;
                    }
                }
            }
        }
        if (falling) {
            this.CheckForFalling();
        }
    }
    FallTick() {
        var blocksFall = false;
        var largetChain = 0;
        for (var row = 0; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                this.State.SoundRequests.push(dataTypes_js_1.SoundRequest.Fall);
                if (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Falling || this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.LockedForFall) {
                    this.State.Blocks[row][col].Tick++;
                    if (this.State.Blocks[row][col].Tick == this.State.Blocks[row][col].FallGroupTicks) {
                        blocksFall = true;
                        this.State.Blocks[row][col].Tick = 0;
                        this.State.Blocks[row][col].FallGroupTicks = 0;
                        this.State.Blocks[row][col].groupId = 0;
                        if (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Falling) {
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].State = dataTypes_js_1.BlockState.Exist;
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].Color = this.State.Blocks[row][col].Color;
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].Tick = 0;
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].groupId = 0;
                            if (this.State.Blocks[row][col].TotalChain > largetChain) {
                                largetChain = this.State.Blocks[row][col].TotalChain;
                            }
                            this.State.Blocks[row][col].TotalChain = 0;
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].TotalChain = 0;
                        }
                        this.State.Blocks[row][col].State = dataTypes_js_1.BlockState.None;
                    }
                }
            }
        }
        if (blocksFall && !this.State.WaitForSwap) {
            this.CheckForSets(largetChain);
        }
    }
    MoveBlocksUpTick() {
        this.State.Ticks.MoveBlocksUp++;
        if (!this.State.BlocksMoveFast) {
            this.State.BlockInc += 50 / (450 - ((this.State.Level - 1) * 15));
        }
        else {
            if (this.State.Ticks.MoveBlocksUp % 1 == 0 && this.State.BlockInc >= 50) {
                this.State.BlockInc += 2.5;
            }
        }
        if (this.State.BlockInc >= 50) {
            this.CheckForGameOver();
            if (this.State.Active.Puzzle) {
                this.State.BlockInc = 0;
                this.State.Ticks.MoveBlocksUp = 0;
                this.RowChange();
                this.CheckForSets(0);
            }
        }
    }
    SwapBlocksTick() {
        this.State.Ticks.Swap++;
        if (this.State.Ticks.Swap == dataTypes_js_1.Constants.TICKS_FOR_SWAP) {
            var newRightState = this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State;
            var newRightColor = this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].Color;
            this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State;
            this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].Color = this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].Color;
            this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = newRightState;
            this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].Color = newRightColor;
            if (this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State == dataTypes_js_1.BlockState.Switch) {
                this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = dataTypes_js_1.BlockState.Exist;
            }
            else {
                this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = dataTypes_js_1.BlockState.None;
            }
            if (this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State == dataTypes_js_1.BlockState.Switch) {
                this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = dataTypes_js_1.BlockState.Exist;
            }
            else {
                this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = dataTypes_js_1.BlockState.None;
            }
            this.State.Ticks.Swap = 0;
            this.State.Active.Swap = false;
            if (!this.State.SwapOverRide) {
                this.CheckForSets(0);
            }
            if (this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].TotalChain > this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].TotalChain) {
                this.CheckForHover(this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].TotalChain, !this.State.SwapOverRide);
            }
            else {
                this.CheckForHover(this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].TotalChain, !this.State.SwapOverRide);
            }
        }
    }
    RemoveBlocksTick() {
        var totalChain = 0;
        for (var row = 0; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                if (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Remove) {
                    this.State.Blocks[row][col].Tick++;
                    if (this.State.Blocks[row][col].Tick == dataTypes_js_1.Constants.TICKS_FOR_REMOVING_BLOCKS) {
                        if (totalChain < this.State.Blocks[row][col].TotalChain) {
                            totalChain = this.State.Blocks[row][col].TotalChain;
                        }
                        this.State.Blocks[row][col].State = dataTypes_js_1.BlockState.None;
                        this.State.Blocks[row][col].TotalChain = 0;
                        this.State.Blocks[row][col].Tick = 0;
                        this.State.Blocks[row][col].groupId = 0;
                    }
                }
            }
        }
        this.UpdateActive();
        this.CheckForHover(totalChain, false);
    }
    //Checks
    CheckForSets(chain) {
        chain++;
        var setCount = 0;
        var currentBlockRow = 0;
        var currentBlockCol = 0;
        this.State.SetCount = 0;
        for (var row = 1; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            currentBlockCol = 0;
            setCount = 1;
            for (var col = 1; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                if ((this.State.Blocks[row][currentBlockCol].State == dataTypes_js_1.BlockState.Exist && this.State.Blocks[row][currentBlockCol].groupId == 0) &&
                    (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Exist && this.State.Blocks[row][col].groupId == 0) &&
                    this.State.Blocks[row][col].Color == this.State.Blocks[row][currentBlockCol].Color) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k = 0; k < setCount; k++) {
                            this.State.Blocks[row][currentBlockCol + k].State = dataTypes_js_1.BlockState.Remove;
                            this.State.Blocks[row][currentBlockCol + k].TotalChain = chain;
                            this.State.Blocks[row][currentBlockCol + k].Tick = 0;
                            this.State.Blocks[row][currentBlockCol + k].Tick = 0;
                        }
                        this.State.Set[this.State.SetCount].Row = row;
                        this.State.Set[this.State.SetCount].Col = currentBlockCol;
                        this.State.Set[this.State.SetCount].Count = setCount;
                        this.State.Set[this.State.SetCount].NewSetIndex = -1;
                        this.State.Set[this.State.SetCount].Intersects = 0;
                        this.State.Set[this.State.SetCount].Type = dataTypes_js_1.SetType.Col;
                        this.State.SetCount++;
                    }
                    while (col != dataTypes_js_1.Constants.MAX_COLS - 1) {
                        if (this.State.Blocks[row][col + 1].State == dataTypes_js_1.BlockState.Exist) {
                            currentBlockCol = col;
                            setCount = 1;
                            break;
                        }
                        else {
                            col++;
                        }
                    }
                }
            }
            if (setCount >= 3) {
                for (var k = 0; k < setCount; k++) {
                    this.State.Blocks[row][currentBlockCol + k].State = dataTypes_js_1.BlockState.Remove;
                    this.State.Blocks[row][currentBlockCol + k].TotalChain = chain;
                    this.State.Blocks[row][currentBlockCol + k].Tick = 0;
                }
                this.State.Set[this.State.SetCount].Row = row;
                this.State.Set[this.State.SetCount].Col = currentBlockCol;
                this.State.Set[this.State.SetCount].Count = setCount;
                this.State.Set[this.State.SetCount].NewSetIndex = -1;
                this.State.Set[this.State.SetCount].Intersects = 0;
                this.State.Set[this.State.SetCount].Type = dataTypes_js_1.SetType.Col;
                this.State.SetCount++;
            }
        }
        for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
            currentBlockRow = 1;
            setCount = 1;
            for (var row = 2; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
                if (((this.State.Blocks[currentBlockRow][col].State == dataTypes_js_1.BlockState.Exist || this.State.Blocks[currentBlockRow][col].State == dataTypes_js_1.BlockState.Remove) && this.State.Blocks[currentBlockRow][col].groupId == 0) && ((this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Exist || this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Remove) && this.State.Blocks[row][col].groupId == 0) && (this.State.Blocks[row][col].Color == this.State.Blocks[currentBlockRow][col].Color)) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k = 0; k < setCount; k++) {
                            this.State.Blocks[currentBlockRow + k][col].State = dataTypes_js_1.BlockState.Remove;
                            this.State.Blocks[currentBlockRow + k][col].TotalChain = chain;
                            this.State.Blocks[currentBlockRow + k][col].Tick = 0;
                        }
                        this.State.Set[this.State.SetCount].Row = currentBlockRow;
                        this.State.Set[this.State.SetCount].Col = col;
                        this.State.Set[this.State.SetCount].Count = setCount;
                        this.State.Set[this.State.SetCount].NewSetIndex = -1;
                        this.State.Set[this.State.SetCount].Intersects = 0;
                        this.State.Set[this.State.SetCount].Type = dataTypes_js_1.SetType.Row;
                        this.State.SetCount++;
                    }
                    while (row != dataTypes_js_1.Constants.MAX_ROWS - 1) {
                        if (this.State.Blocks[row + 1][col].State == dataTypes_js_1.BlockState.Exist) {
                            currentBlockRow = row;
                            setCount = 1;
                            break;
                        }
                        else {
                            row++;
                        }
                    }
                }
            }
            if (setCount >= 3) {
                for (var k = 0; k < setCount; k++) {
                    this.State.Blocks[currentBlockRow + k][col].State = dataTypes_js_1.BlockState.Remove;
                    this.State.Blocks[currentBlockRow + k][col].TotalChain = chain;
                    this.State.Blocks[currentBlockRow + k][col].Tick = 0;
                }
                this.State.Set[this.State.SetCount].Row = currentBlockRow;
                this.State.Set[this.State.SetCount].Col = col;
                this.State.Set[this.State.SetCount].Count = setCount;
                this.State.Set[this.State.SetCount].NewSetIndex = -1;
                this.State.Set[this.State.SetCount].Intersects = 0;
                this.State.Set[this.State.SetCount].Type = dataTypes_js_1.SetType.Row;
                this.State.SetCount++;
            }
        }
        for (var i = 0; i < this.State.SetCount; i++) {
        }
        var NewSetIndex = 0;
        this.State.BlockSetsCount = this.State.SetCount;
        for (var i = 0; i < this.State.SetCount; i++) {
            if (this.State.Set[i].NewSetIndex == -1) {
                this.State.Set[i].NewSetIndex = NewSetIndex;
                this.State.BlockSets[NewSetIndex] = 0;
                NewSetIndex++;
            }
            for (var j = i; j < this.State.SetCount; j++) {
                if (i == j || this.State.Set[j].NewSetIndex == this.State.Set[i].NewSetIndex) {
                    continue;
                }
                if (this.State.Set[i].Type == dataTypes_js_1.SetType.Col && this.State.Set[j].Type == dataTypes_js_1.SetType.Row && this.State.Set[j].Row == this.State.Set[i].Row && this.State.Set[j].Col >= this.State.Set[i].Col && this.State.Set[j].Col <= (this.State.Set[i].Col + this.State.Set[i].Count)) {
                    this.State.Set[j].Intersects++;
                    this.State.Set[j].NewSetIndex = this.State.Set[i].NewSetIndex;
                    this.State.BlockSetsCount = this.State.BlockSetsCount - 1;
                }
                if (this.State.Set[j].Type == dataTypes_js_1.SetType.Col && this.State.Set[i].Type == dataTypes_js_1.SetType.Row && this.State.Set[j].Col >= this.State.Set[i].Col && this.State.Set[j].Col <= (this.State.Set[i].Col + this.State.Set[i].Count)) {
                    this.State.Set[i].Intersects++;
                    this.State.Set[i].NewSetIndex = this.State.Set[j].NewSetIndex;
                    this.State.BlockSetsCount = this.State.BlockSetsCount - 1;
                }
            }
        }
        for (var i = 0; i < this.State.SetCount; i++) {
            this.State.BlockSets[this.State.Set[i].NewSetIndex] += this.State.Set[i].Count - this.State.Set[i].Intersects;
        }
        if (this.State.SetCount > 0) {
            this.State.SoundRequests.push(dataTypes_js_1.SoundRequest.Remove);
            this.State.groupId++;
            for (var row = 0; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
                for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                    if (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Remove && this.State.Blocks[row][col].groupId == 0) {
                        this.State.Blocks[row][col].groupId = this.State.groupId;
                    }
                }
            }
            this.State.Active.BlocksRemoving = true;
            this.GetScore(chain);
        }
    }
    CheckForHover(chain, switchedBlocks) {
        var oneHoverFound = false;
        for (var row = 1; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                if (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Exist && this.State.Blocks[row][col].State != dataTypes_js_1.BlockState.Hover && this.State.Blocks[row][col].State != dataTypes_js_1.BlockState.HoverSwap) {
                    if (this.State.Blocks[row - 1][col].State == dataTypes_js_1.BlockState.None || this.State.Blocks[row - 1][col].State == dataTypes_js_1.BlockState.Hover || this.State.Blocks[row - 1][col].State == dataTypes_js_1.BlockState.HoverSwap) {
                        if (oneHoverFound == false) {
                            this.State.groupId++;
                            oneHoverFound = true;
                        }
                        this.State.Blocks[row][col].groupId = this.State.groupId;
                        this.State.Blocks[row][col].Tick = 0;
                        this.State.Blocks[row][col].TotalChain = chain;
                        if (switchedBlocks) {
                            this.State.Blocks[row][col].State = dataTypes_js_1.BlockState.HoverSwap;
                        }
                        else {
                            this.State.Blocks[row][col].State = dataTypes_js_1.BlockState.Hover;
                        }
                        for (var k = row; k > 0; k--) {
                            if (this.State.Blocks[k - 1][col].State == dataTypes_js_1.BlockState.None) {
                                this.State.HoverBlocks[row][col].Row = k - 1;
                            }
                            if (this.State.Blocks[k - 1][col].State == dataTypes_js_1.BlockState.Hover || this.State.Blocks[k - 1][col].State == dataTypes_js_1.BlockState.HoverSwap) {
                                this.State.HoverBlocks[row][col].Row = this.State.HoverBlocks[k - 1][col].Row + 1;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    CheckForFalling() {
        var chain = 0;
        for (var row = 1; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                if (this.State.Blocks[row][col].State == dataTypes_js_1.BlockState.Falling) {
                    if (this.State.Blocks[row - 1][col].State == dataTypes_js_1.BlockState.None || this.State.Blocks[row - 1][col].State == dataTypes_js_1.BlockState.Falling || this.State.Blocks[row - 1][col].State == dataTypes_js_1.BlockState.LockedForFall) {
                        if (this.State.Blocks[row][col].TotalChain > chain) {
                            chain = this.State.Blocks[row][col].TotalChain;
                        }
                        this.State.Blocks[row][col].FallGroupTicks = dataTypes_js_1.Constants.TICKS_FOR_FALL;
                        for (var k = row; k > 0; k--) {
                            if (this.State.Active.Swap && k - 2 >= 0 && this.State.Blocks[k - 1][col].State == dataTypes_js_1.BlockState.Switch || this.State.Blocks[k - 1][col].State == dataTypes_js_1.BlockState.SwitchNone && this.State.Blocks[k - 2][col].State == dataTypes_js_1.BlockState.None) {
                                this.State.WaitForSwap = true;
                            }
                            if (this.State.Blocks[k - 1][col].State == dataTypes_js_1.BlockState.None) {
                                this.State.FallBlocks[row][col].Row = k - 1;
                                this.State.Blocks[k - 1][col].State = dataTypes_js_1.BlockState.LockedForFall;
                                this.State.Blocks[k - 1][col].FallGroupTicks = dataTypes_js_1.Constants.TICKS_FOR_FALL;
                                this.State.Blocks[k - 1][col].groupId = this.State.Blocks[row][col].groupId;
                            }
                            if (this.State.Blocks[k - 1][col].State == dataTypes_js_1.BlockState.LockedForFall) {
                                this.State.FallBlocks[row][col].Row = k - 1;
                            }
                            if (this.State.Blocks[k - 1][col].State == dataTypes_js_1.BlockState.Falling) {
                                this.State.FallBlocks[row][col].Row = this.State.FallBlocks[k - 1][col].Row + 1;
                                break;
                            }
                        }
                    }
                    else {
                        this.State.Blocks[row][col].State = dataTypes_js_1.BlockState.Exist;
                        this.State.Blocks[row][col].groupId = 0;
                        this.State.Blocks[row][col].Tick = 0;
                    }
                }
            }
        }
        if (this.State.WaitForSwap) {
            this.State.SwapOverRide = true;
            if (this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State == dataTypes_js_1.BlockState.Switch) {
                this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].TotalChain = chain;
            }
            else {
                this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].TotalChain = chain;
            }
        }
    }
    //Other
    CreateSetupBlocks() {
        for (var i = 0; i < dataTypes_js_1.Constants.STARTING_ROWS; i++) {
            this.AddBlockRow(i);
        }
    }
    RowChange() {
        this.MoveBlocksUpOneRow();
        this.AddBlockRow(0);
        this.State.Selector.Row = this.State.Selector.Row + 1;
        this.State.SwitchLeftBlockRow++;
        this.State.SwitchRightBlockRow++;
    }
    MoveBlocksUpOneRow() {
        for (var row = dataTypes_js_1.Constants.MAX_ROWS - 1; row >= 1; row--) {
            for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                this.State.Blocks[row][col].Color = this.State.Blocks[row - 1][col].Color;
                this.State.Blocks[row][col].State = this.State.Blocks[row - 1][col].State;
            }
        }
    }
    AddBlockRow(row) {
        for (var col = 0; col < 6; col++) {
            var blockColor;
            do {
                blockColor = (Math.floor(this.State.Random() * Math.floor(5)));
            } while (!this.IsNewBlockVaild(row, col, blockColor));
            this.State.Blocks[row][col].Color = blockColor;
            this.State.Blocks[row][col].State = dataTypes_js_1.BlockState.Exist;
            this.State.Blocks[row][col].groupId = 0;
            this.State.Blocks[row][col].Tick = 0;
            this.State.Blocks[row][col].FallGroupTicks = 0;
        }
    }
    //Condtional
    CheckForGameOver() {
        for (var col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
            if (this.State.Blocks[dataTypes_js_1.Constants.MAX_ROWS - 1][col].State == dataTypes_js_1.BlockState.Exist) {
                this.State.Active.Puzzle = false;
            }
        }
    }
    IsNewBlockVaild(blockRow, blockCol, blockColor) {
        var foundValue = false;
        var i = 0;
        var rowSameColor = 0;
        i = 1;
        do {
            foundValue = false;
            if ((blockRow - i) >= 0 && this.State.Blocks[blockRow - i][blockCol].State == dataTypes_js_1.BlockState.Exist && this.State.Blocks[blockRow - i][blockCol].Color == blockColor) {
                rowSameColor++;
                foundValue = true;
            }
            i++;
        } while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockRow + i) <= (dataTypes_js_1.Constants.MAX_ROWS - 1) && this.State.Blocks[blockRow + i][blockCol].State == dataTypes_js_1.BlockState.Exist && this.State.Blocks[blockRow + i][blockCol].Color == blockColor) {
                rowSameColor++;
                foundValue = true;
            }
            i++;
        } while (foundValue);
        if (rowSameColor >= 2) {
            return false;
        }
        var colSameColor = 0;
        i = 1;
        do {
            foundValue = false;
            if ((blockCol - i) >= 0 && this.State.Blocks[blockRow][blockCol - i].State == dataTypes_js_1.BlockState.Exist && this.State.Blocks[blockRow][blockCol - i].Color == blockColor) {
                colSameColor++;
                foundValue = true;
            }
            i++;
        } while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockCol + i) <= (dataTypes_js_1.Constants.MAX_COLS - 1) && this.State.Blocks[blockRow][blockCol + i].State == dataTypes_js_1.BlockState.Exist && this.State.Blocks[blockRow][blockCol + i].Color == blockColor) {
                colSameColor++;
                foundValue = true;
            }
            i++;
        } while (foundValue);
        if (colSameColor >= 2) {
            return false;
        }
        return true;
    }
    //Score
    GetScore(chain) {
        this.ChainScore(chain);
        for (var i = 0; i < this.State.SetCount; i++) {
            this.TotalBlockScore(this.State.BlockSets[i]);
        }
    }
    ChainScore(chain) {
        let addtionalScore = 0;
        if (chain == 2) {
            addtionalScore = 50;
        }
        if (chain == 3) {
            addtionalScore = 130;
        }
        if (chain == 4) {
            addtionalScore = 280;
        }
        if (chain == 5) {
            addtionalScore = 580;
        }
        if (chain == 6) {
            addtionalScore = 980;
        }
        if (chain == 7) {
            addtionalScore = 1480;
        }
        if (chain == 8) {
            addtionalScore = 2180;
        }
        if (chain == 9) {
            addtionalScore = 3080;
        }
        if (chain == 10) {
            addtionalScore = 4180;
        }
        if (chain == 11) {
            addtionalScore = 5480;
        }
        if (chain == 12) {
            addtionalScore = 6980;
        }
        if (chain > 12) {
            addtionalScore = 6980 + ((chain - 12) * 1800);
        }
        this.State.Score += addtionalScore;
    }
    TotalBlockScore(totalBlocks) {
        var addtionalScore = 0;
        if (totalBlocks == 3) {
            addtionalScore = 30;
        }
        if (totalBlocks == 4) {
            addtionalScore = 70;
        }
        if (totalBlocks == 5) {
            addtionalScore = 100;
        }
        if (totalBlocks == 6) {
            addtionalScore = 210;
        }
        if (totalBlocks == 7) {
            addtionalScore = 260;
        }
        if (totalBlocks == 8) {
            addtionalScore = 310;
        }
        if (totalBlocks == 9) {
            addtionalScore = 360;
        }
        if (totalBlocks == 10) {
            addtionalScore = 410;
        }
        if (totalBlocks == 11) {
            addtionalScore = 510;
        }
        if (totalBlocks == 12) {
            addtionalScore = 570;
        }
        if (totalBlocks == 13) {
            addtionalScore = 630;
        }
        if (totalBlocks == 14) {
            addtionalScore = 690;
        }
        if (totalBlocks == 15) {
            addtionalScore = 850;
        }
        if (totalBlocks == 16) {
            addtionalScore = 920;
        }
        if (totalBlocks == 17) {
            addtionalScore = 1020;
        }
        if (totalBlocks == 18) {
            addtionalScore = 1150;
        }
        if (totalBlocks == 19) {
            addtionalScore = 1310;
        }
        if (totalBlocks == 20) {
            addtionalScore = 1500;
        }
        if (totalBlocks == 21) {
            addtionalScore = 1720;
        }
        if (totalBlocks == 22) {
            addtionalScore = 1970;
        }
        if (totalBlocks == 23) {
            addtionalScore = 2250;
        }
        if (totalBlocks == 24) {
            addtionalScore = 2560;
        }
        if (totalBlocks == 25) {
            addtionalScore = 2900;
        }
        if (totalBlocks == 26) {
            addtionalScore = 3270;
        }
        if (totalBlocks == 27) {
            addtionalScore = 3670;
        }
        if (totalBlocks == 28) {
            addtionalScore = 4100;
        }
        if (totalBlocks == 29) {
            addtionalScore = 4560;
        }
        if (totalBlocks == 30) {
            addtionalScore = 5050;
        }
        if (totalBlocks == 31) {
            addtionalScore = 5570;
        }
        if (totalBlocks == 32) {
            addtionalScore = 15320;
        }
        if (totalBlocks == 33) {
            addtionalScore = 15900;
        }
        if (totalBlocks == 34) {
            addtionalScore = 16510;
        }
        if (totalBlocks == 35) {
            addtionalScore = 17150;
        }
        if (totalBlocks == 36) {
            addtionalScore = 17820;
        }
        if (totalBlocks == 37) {
            addtionalScore = 18520;
        }
        if (totalBlocks == 38) {
            addtionalScore = 19250;
        }
        if (totalBlocks == 39) {
            addtionalScore = 20010;
        }
        if (totalBlocks == 40) {
            addtionalScore = 20800;
        }
        if (totalBlocks > 40) {
            addtionalScore = 20400 + ((totalBlocks - 40) * 800) + (totalBlocks * 10);
        }
        this.State.Score += addtionalScore;
    }
}
class PuzzleView {
    constructor(name, container, textures) {
        this.blocksSprite = [];
        this.textures = [];
        this.container = container;
        this.textures = textures;
        ////let nameTextStyle = new PIXI.TextStyle({
        ////    fontSize: 24,
        ////    fontWeight: 'bold',
        ////    fill: "#fdfdfd"
        ////});
        ////this.name = new PIXI.Text(name, nameTextStyle);
        ////this.name.x = 27;
        ////this.name.y = 15;
        let levelTextStyle = new PIXI.TextStyle({
            fontSize: 24,
            fontWeight: 'bold',
            fill: "#fdfdfd"
        });
        this.level = new PIXI.Text('', levelTextStyle);
        this.level.x = 27;
        this.level.y = 15;
        let scoreTextStyle = new PIXI.TextStyle({
            fontSize: 24,
            fontWeight: 'bold',
            fill: "#fdfdfd"
        });
        this.score = new PIXI.Text('00000', levelTextStyle);
        this.score.x = 200;
        this.score.y = 15;
        //Layout
        this.layoutSprite = new PIXI.Sprite(textures["Layout.png"]);
        //Selector
        this.selectorSprite = new PIXI.Sprite(textures["Selector.png"]);
        //Blocks
        this.blocksContainer = new PIXI.Container();
        this.blocksContainer.x = 0;
        this.blocksContainer.y = 0;
        var thing = new PIXI.Graphics();
        thing.x = 0;
        thing.y = 0;
        thing.lineStyle(0);
        thing.beginFill(0x8bc5ff, 0.4);
        thing.moveTo(3, 0);
        thing.lineTo(3, (dataTypes_js_1.Constants.MAX_ROWS - 1) * 50 + 106);
        thing.lineTo(dataTypes_js_1.Constants.MAX_COLS * 50 + 3, (dataTypes_js_1.Constants.MAX_ROWS - 1) * 50 + 106);
        thing.lineTo(dataTypes_js_1.Constants.MAX_COLS * 50 + 3, 0);
        this.blocksContainer.mask = thing;
        for (let row = 0; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            this.blocksSprite[row] = [];
            for (let col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                this.blocksSprite[row][col] = new PIXI.Sprite(this.textures["BlockBrown.png"]);
                this.blocksSprite[row][col].x = (col) * 50 + 3 + 25;
                this.blocksSprite[row][col].y = ((dataTypes_js_1.Constants.MAX_ROWS - 1) - row) * 50 + 106 + 25;
                this.blocksSprite[row][col].visible = false;
                this.blocksSprite[row][col].pivot.set(25, 25);
                this.blocksContainer.addChild(this.blocksSprite[row][col]);
            }
        }
        this.blocksContainer.addChild(this.selectorSprite);
        //Order Of Sprite (z)
        this.container.addChild(thing);
        this.container.addChild(this.layoutSprite);
        this.container.addChild(this.blocksContainer);
        this.container.addChild(this.level);
        this.container.addChild(this.score); //score Should be here
    }
    Update(puzzleLogic) {
        this.UpdateSelector(puzzleLogic.State.Selector);
        this.UpdateBlockStates(puzzleLogic.State.Blocks, puzzleLogic.State.Ticks.Swap, puzzleLogic.State.SwitchLeftBlockCol, puzzleLogic.State.FallBlocks);
        this.UpdateBlockContainerState(puzzleLogic.State.BlockInc);
        this.UpdateLevel(puzzleLogic.State.Level);
        this.UpdateScore(puzzleLogic.State.Score);
    }
    UpdateBlockContainerState(y) {
        this.blocksContainer.y = -y;
    }
    UpdateBlockStates(Blocks, swapTick, leftSwapCol, fallBlocks) {
        for (let row = 0; row < dataTypes_js_1.Constants.MAX_ROWS; row++) {
            for (let col = 0; col < dataTypes_js_1.Constants.MAX_COLS; col++) {
                this.blocksSprite[row][col].x = (col) * 50 + 3 + 25;
                this.blocksSprite[row][col].y = ((dataTypes_js_1.Constants.MAX_ROWS - 1) - row) * 50 + 106 + 25;
                this.blocksSprite[row][col].rotation = 0;
                this.blocksSprite[row][col].scale.x = 1;
                this.blocksSprite[row][col].scale.y = 1;
                if (Blocks[row][col].State == dataTypes_js_1.BlockState.None ||
                    Blocks[row][col].State == dataTypes_js_1.BlockState.SwitchNone ||
                    Blocks[row][col].State == dataTypes_js_1.BlockState.LockedForFall) {
                    this.blocksSprite[row][col].visible = false;
                }
                else {
                    this.blocksSprite[row][col].visible = true;
                }
                if (Blocks[row][col].State == dataTypes_js_1.BlockState.Switch) {
                    this.blocksSprite[row][col].x += swapTick / dataTypes_js_1.Constants.TICKS_FOR_SWAP * 50 * (leftSwapCol === col ? 1 : -1);
                }
                if (Blocks[row][col].State == dataTypes_js_1.BlockState.Remove) {
                    this.blocksSprite[row][col].scale.x = (dataTypes_js_1.Constants.TICKS_FOR_REMOVING_BLOCKS - Blocks[row][col].Tick) / dataTypes_js_1.Constants.TICKS_FOR_REMOVING_BLOCKS;
                    this.blocksSprite[row][col].scale.y = (dataTypes_js_1.Constants.TICKS_FOR_REMOVING_BLOCKS - Blocks[row][col].Tick) / dataTypes_js_1.Constants.TICKS_FOR_REMOVING_BLOCKS;
                    this.blocksSprite[row][col].rotation = Blocks[row][col].Tick / dataTypes_js_1.Constants.TICKS_FOR_REMOVING_BLOCKS * -6.28319;
                }
                if (Blocks[row][col].State == dataTypes_js_1.BlockState.Falling) {
                    this.blocksSprite[row][col].y += (Blocks[row][col].Tick / dataTypes_js_1.Constants.TICKS_FOR_FALL) * (fallBlocks[row][col].Row - row) * -50;
                }
                //Set Texture
                if (Blocks[row][col].Color == dataTypes_js_1.BlockColor.Green) {
                    this.blocksSprite[row][col].texture = this.textures["BlockGreen.png"];
                }
                else if (Blocks[row][col].Color == dataTypes_js_1.BlockColor.Blue) {
                    this.blocksSprite[row][col].texture = this.textures["BlockBlue.png"];
                }
                else if (Blocks[row][col].Color == dataTypes_js_1.BlockColor.Red) {
                    this.blocksSprite[row][col].texture = this.textures["BlockRed.png"];
                }
                else if (Blocks[row][col].Color == dataTypes_js_1.BlockColor.Purple) {
                    this.blocksSprite[row][col].texture = this.textures["BlockPurple.png"];
                }
                else if (Blocks[row][col].Color == dataTypes_js_1.BlockColor.Yellow) {
                    this.blocksSprite[row][col].texture = this.textures["BlockYellow.png"];
                }
                else if (Blocks[row][col].Color == dataTypes_js_1.BlockColor.Brown) {
                    this.blocksSprite[row][col].texture = this.textures["BlockBrown.png"];
                }
            }
        }
    }
    UpdateSelector(selector) {
        this.selectorSprite.x = (selector.Col) * 50 + 3;
        this.selectorSprite.y = ((dataTypes_js_1.Constants.MAX_ROWS - 1) - selector.Row) * 50 + 106;
    }
    UpdateLevel(level) {
        this.level.text = String(level);
    }
    UpdateScore(score) {
        this.score.text = String(score);
    }
}
class PuzzleLoader {
    constructor(puzzle) {
        this.CurrentTick = 0;
        this.TotalTicks = 0;
        this.LogId = -1;
        this.TicksPerSecound = 60;
        this.Log = [];
        this.currentLogItem = 0;
        this.currentLogItemCount = 0;
        this.puzzle = puzzle;
        this.Reset();
    }
    Reset() {
        this.CurrentTick = 0;
        //this.TotalTicks = 0;
        this.TicksPerSecound = 60;
        this.currentLogItem = 0;
        this.currentLogItemCount = 0;
        this.LogId = -1;
        this.Log = [];
    }
    MergeLogItems(logItems) {
        if (logItems.length === 0) {
            return;
        }
        if (this.LogId === -1) {
            this.Log = logItems;
        }
        else if (logItems[0].Id === this.LogId + 1) {
            this.Log.concat(logItems);
            this.LogId = this.Log[this.Log.length - 1].Id;
        }
        else if (logItems[0].Id < this.LogId + 1) {
            this.Log = this.Log.filter(e => e.Id < logItems[0].Id);
            this.Log.concat(logItems);
            this.LogId = this.Log[this.Log.length - 1].Id;
        }
        //Determine Total Ticks;
    }
    //public Tick(ticks: number) {
    //    for (var i = 0; i < ticks; i++) {
    //        this.puzzle.logic.Tick();
    //    }
    //    this.puzzle.ViewUpdate();
    //    this.puzzle.logic.SoundRequests.length = 0;
    //}
    AdvanceTicks(tick, useLog = true) {
        let log;
        if (tick === 0) {
            return;
        }
        else if (useLog) {
            log = this.Log;
            if (tick < 0) {
                if ((this.CurrentTick + tick) < 0) {
                    tick = 0;
                }
                else {
                    tick = this.CurrentTick + tick;
                }
                this.CurrentTick = 0;
                this.currentLogItem = 0;
                this.currentLogItemCount = 0;
            }
        }
        else if (!useLog && this.puzzle.logic.State.Log && tick < 0) {
            if ((this.puzzle.logic.State.Ticks.Puzzle + tick) < 0) {
                tick = 0;
            }
            else {
                tick = this.puzzle.logic.State.Ticks.Puzzle + tick;
            }
            log = JSON.parse(JSON.stringify(this.puzzle.logic.State.LogItems));
            this.CurrentTick = 0;
            this.currentLogItem = 0;
            this.currentLogItemCount = 0;
        }
        else if (!useLog) {
            for (let i = 0; i < tick; i++) {
                this.puzzle.logic.Tick();
            }
            return;
        }
        else {
            return;
        }
        let goalTick = this.CurrentTick + tick;
        while (this.CurrentTick != goalTick && log.length != this.currentLogItem) {
            let item = log[this.currentLogItem];
            if (item.Action === "Tick") {
                this.puzzle.logic.Tick();
                this.CurrentTick++;
                this.currentLogItemCount++;
                if (item.ValueOne == this.currentLogItemCount) {
                    this.currentLogItem++;
                    this.currentLogItemCount = 0;
                }
            }
            else if (item.Action === "RequestMoveSelector") {
                this.puzzle.logic.RequestMoveSelector(item.ValueOne, item.ValueTwo);
                this.currentLogItem++;
            }
            else if (item.Action === "RequestSwitch") {
                this.puzzle.logic.RequestSwitch();
                this.currentLogItem++;
            }
            else if (item.Action === "Seed") {
                this.puzzle.logic.Reset(item.ValueOne);
                this.currentLogItem++;
            }
        }
        ;
        if (!useLog) {
            this.CurrentTick = 0;
        }
        this.puzzle.ViewUpdate();
        this.puzzle.logic.State.SoundRequests.length = 0;
    }
    Pause() {
    }
    Resume() {
    }
    ClearLogItems() {
        this.Log = [];
    }
}
//# sourceMappingURL=Puzzle.js.map