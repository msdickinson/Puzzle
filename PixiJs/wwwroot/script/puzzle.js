import { SetType, BlockState, BlockColor, InputOptions, SoundRequest, Block, HoverBlock, FallBlock, Tick, Active, Selector, BlockSet, Constants, LogItem } from './dataTypes.js';
import { seedRandom } from "./lib/seedrandom.js";
class Puzzle {
    constructor(View, soundService, textures, mute, log, seed, name) {
        this.debug = true;
        this.random = null;
        this.logic = new PuzzleLogic(log, seed);
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
            for (var i = 0; i < this.logic.SoundRequests.length; i++) {
                if (this.logic.SoundRequests[i] === SoundRequest.Swap) {
                    this.soundService.swap.play();
                }
                if (this.logic.SoundRequests[i] === SoundRequest.Fall) {
                    this.soundService.swap.play();
                }
                if (this.logic.SoundRequests[i] === SoundRequest.Remove) {
                    this.soundService.swap.play();
                }
            }
        }
        this.logic.SoundRequests.length = 0;
    }
    InputAction(input) {
        if (input === InputOptions.Up) {
            this.logic.RequestMoveSelector(this.logic.Selector.Row + 1, this.logic.Selector.Col);
        }
        else if (input === InputOptions.Left) {
            this.logic.RequestMoveSelector(this.logic.Selector.Row, this.logic.Selector.Col - 1);
        }
        else if (input === InputOptions.Down) {
            this.logic.RequestMoveSelector(this.logic.Selector.Row - 1, this.logic.Selector.Col);
        }
        else if (input === InputOptions.Right) {
            this.logic.RequestMoveSelector(this.logic.Selector.Row, this.logic.Selector.Col + 1);
        }
        else if (input === InputOptions.A) {
            this.logic.RequestSwitch();
        }
        if (this.debug) {
            this.ViewUpdate();
        }
    }
}
class PuzzleLogic {
    constructor(log, seed) {
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
        this.Log = log;
        this.Seed = seed;
        this.Random = seedRandom.seedrandom(this.Seed, { state: true });
        this.Reset(this.Seed);
        if (this.Log) {
            let logItem = new LogItem();
            logItem.Id = this.LogItems.length;
            logItem.Action = "Seed";
            logItem.ValueOne = this.Seed;
            this.LogItems.push(logItem);
        }
    }
    //|Public|
    Reset(seed = null) {
        if (seed != null) {
            this.Seed = seed;
        }
        else {
            this.Seed = this.Random();
        }
        this.Random = seedRandom.seedrandom(this.Seed, { state: true });
        this.LogItems = [];
        this.SoundRequests = [];
        this.Active.Puzzle = true;
        this.Active.Hover = false;
        this.Active.Swap = false;
        this.Active.Falling = false;
        this.SwapOverRide = false;
        this.Ticks.Puzzle = 0;
        this.WaitForSwap = false;
        this.Ticks.MoveBlocksUp = 0;
        this.Ticks.Swap = 0;
        for (var row = 0; row < Constants.MAX_ROWS; row++) {
            this.Blocks[row] = [];
            this.HoverBlocks[row] = [];
            this.FallBlocks[row] = [];
            for (var col = 0; col < Constants.MAX_COLS; col++) {
                const block = new Block();
                block.State = BlockState.None;
                block.Color = BlockColor.Red;
                block.FallGroupTicks = 0;
                block.Tick = 0;
                block.groupId = 0;
                this.Blocks[row][col] = new Block();
                this.HoverBlocks[row][col] = new HoverBlock();
                this.FallBlocks[row][col] = new FallBlock();
            }
        }
        for (var i = 0; i < Constants.MAX_ROWS * Constants.MAX_COLS; i++) {
            this.BlockSets[i] = 0;
            this.Set[i] = new BlockSet();
        }
        this.Score = 0;
        this.Level = 1;
        this.groupId = 1;
        this.Selector.Row = 2;
        this.Selector.Col = 2;
        this.CreateSetupBlocks();
    }
    Tick() {
        if (this.Active.Puzzle) {
            if (this.Log) {
                if (this.LogItems[this.LogItems.length - 1].Action !== "Tick") {
                    let logItem = new LogItem();
                    logItem.Id = this.LogItems.length;
                    logItem.Action = "Tick";
                    logItem.ValueOne = 1;
                    this.LogItems.push(logItem);
                }
                else {
                    this.LogItems[this.LogItems.length - 1].ValueOne++;
                }
            }
            this.Ticks.Puzzle++;
            if (this.Active.Falling) {
                this.FallTick();
            }
            if (this.Active.Hover) {
                this.HoverTick();
            }
            if (this.Active.BlocksRemoving) {
                this.RemoveBlocksTick();
            }
            if (this.Active.Swap) {
                this.SwapBlocksTick();
            }
            if (!this.Active.BlocksRemoving && !this.Active.Hover) {
                this.MoveBlocksUpTick();
            }
            if (this.Ticks.Puzzle % (60 * 20) == 0)
                this.Level++;
            this.UpdateActive();
        }
    }
    RequestMoveSelector(row, col) {
        if (col >= 0 && col < (Constants.MAX_COLS - 1) && row >= 1 && row < Constants.MAX_ROWS) {
            if (this.Log) {
                let logItem = new LogItem();
                logItem.Id = this.LogItems.length;
                logItem.Action = "RequestMoveSelector";
                logItem.ValueOne = row;
                logItem.ValueOne = col;
                this.LogItems.push(logItem);
            }
            this.Selector.Row = row;
            this.Selector.Col = col;
        }
    }
    RequestSwitch() {
        if (!this.Active.Swap) {
            if ((this.Blocks[this.Selector.Row][this.Selector.Col].State == BlockState.None || this.Blocks[this.Selector.Row][this.Selector.Col].State == BlockState.Exist) && (this.Blocks[this.Selector.Row][this.Selector.Col + 1].State == BlockState.None || this.Blocks[this.Selector.Row][this.Selector.Col + 1].State == BlockState.Exist) && (this.Blocks[this.Selector.Row][this.Selector.Col].State != BlockState.None || this.Blocks[this.Selector.Row][this.Selector.Col + 1].State != BlockState.None)) {
                if (this.Log) {
                    let logItem = new LogItem();
                    logItem.Id = this.LogItems.length;
                    logItem.Action = "RequestSwitch";
                    this.LogItems.push(logItem);
                }
                this.SoundRequests.push(SoundRequest.Swap);
                this.WaitForSwap = false;
                this.Active.Swap = true;
                this.SwitchLeftBlockRow = this.Selector.Row;
                this.SwitchLeftBlockCol = this.Selector.Col;
                this.SwitchRightBlockRow = this.Selector.Row;
                this.SwitchRightBlockCol = this.Selector.Col + 1;
                if (this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State == BlockState.Exist) {
                    this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State = BlockState.Switch;
                }
                else {
                    this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State = BlockState.SwitchNone;
                }
                if (this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].State == BlockState.Exist) {
                    this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].State = BlockState.Switch;
                }
                else {
                    this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].State = BlockState.SwitchNone;
                }
            }
        }
    }
    UpdateActive() {
        this.Active.BlocksRemoving = false;
        this.Active.Falling = false;
        this.Active.Hover = false;
        for (var row = 0; row < Constants.MAX_ROWS; row++) {
            for (var col = 0; col < Constants.MAX_COLS; col++) {
                if (this.Blocks[row][col].State == BlockState.Falling || this.Blocks[row][col].State == BlockState.LockedForFall) {
                    this.Active.Falling = true;
                }
                else if (this.Blocks[row][col].State == BlockState.Hover || this.Blocks[row][col].State == BlockState.HoverSwap) {
                    this.Active.Hover = true;
                }
                else if (this.Blocks[row][col].State == BlockState.Remove) {
                    this.Active.BlocksRemoving = true;
                }
            }
        }
    }
    //Private
    //Ticks
    HoverTick() {
        var falling = false;
        for (var row = 0; row < Constants.MAX_ROWS; row++) {
            for (var col = 0; col < Constants.MAX_COLS; col++) {
                if ((this.Blocks[row][col].State == BlockState.Hover || this.Blocks[row][col].State == BlockState.HoverSwap)) {
                    this.Blocks[row][col].Tick++;
                    if ((this.Blocks[row][col].State == BlockState.Hover && this.Blocks[row][col].Tick == Constants.TICKS_FOR_HOVER) || (this.Blocks[row][col].State == BlockState.HoverSwap && this.Blocks[row][col].Tick == Constants.TICKS_FOR_HOVER_SWAP)) {
                        this.Blocks[row][col].Tick = 0;
                        this.Blocks[row][col].State = BlockState.Falling;
                        this.Blocks[row][col].groupId = 0;
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
        for (var row = 0; row < Constants.MAX_ROWS; row++) {
            for (var col = 0; col < Constants.MAX_COLS; col++) {
                this.SoundRequests.push(SoundRequest.Fall);
                if (this.Blocks[row][col].State == BlockState.Falling || this.Blocks[row][col].State == BlockState.LockedForFall) {
                    this.Blocks[row][col].Tick++;
                    if (this.Blocks[row][col].Tick == this.Blocks[row][col].FallGroupTicks) {
                        blocksFall = true;
                        this.Blocks[row][col].Tick = 0;
                        this.Blocks[row][col].FallGroupTicks = 0;
                        this.Blocks[row][col].groupId = 0;
                        if (this.Blocks[row][col].State == BlockState.Falling) {
                            this.Blocks[this.FallBlocks[row][col].Row][col].State = BlockState.Exist;
                            this.Blocks[this.FallBlocks[row][col].Row][col].Color = this.Blocks[row][col].Color;
                            this.Blocks[this.FallBlocks[row][col].Row][col].Tick = 0;
                            this.Blocks[this.FallBlocks[row][col].Row][col].groupId = 0;
                            if (this.Blocks[row][col].TotalChain > largetChain) {
                                largetChain = this.Blocks[row][col].TotalChain;
                            }
                            this.Blocks[row][col].TotalChain = 0;
                            this.Blocks[this.FallBlocks[row][col].Row][col].TotalChain = 0;
                        }
                        this.Blocks[row][col].State = BlockState.None;
                    }
                }
            }
        }
        if (blocksFall && !this.WaitForSwap) {
            this.CheckForSets(largetChain);
        }
    }
    MoveBlocksUpTick() {
        this.Ticks.MoveBlocksUp++;
        if (!this.BlocksMoveFast) {
            this.BlockInc += 50 / (300 - ((this.Level - 1) * 10));
        }
        else {
            if (this.Ticks.MoveBlocksUp % 1 == 0 && this.BlockInc >= 50) {
                this.BlockInc += 2.5;
            }
        }
        if (this.BlockInc >= 50) {
            this.CheckForGameOver();
            if (this.Active.Puzzle) {
                this.BlockInc = 0;
                this.Ticks.MoveBlocksUp = 0;
                this.RowChange();
                this.CheckForSets(0);
            }
        }
    }
    SwapBlocksTick() {
        this.Ticks.Swap++;
        if (this.Ticks.Swap == Constants.TICKS_FOR_SWAP) {
            var newRightState = this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State;
            var newRightColor = this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].Color;
            this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State = this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].State;
            this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].Color = this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].Color;
            this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].State = newRightState;
            this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].Color = newRightColor;
            if (this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State == BlockState.Switch) {
                this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State = BlockState.Exist;
            }
            else {
                this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State = BlockState.None;
            }
            if (this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].State == BlockState.Switch) {
                this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].State = BlockState.Exist;
            }
            else {
                this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].State = BlockState.None;
            }
            this.Ticks.Swap = 0;
            this.Active.Swap = false;
            if (!this.SwapOverRide) {
                this.CheckForSets(0);
            }
            if (this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].TotalChain > this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].TotalChain) {
                this.CheckForHover(this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].TotalChain, !this.SwapOverRide);
            }
            else {
                this.CheckForHover(this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].TotalChain, !this.SwapOverRide);
            }
        }
    }
    RemoveBlocksTick() {
        var totalChain = 0;
        for (var row = 0; row < Constants.MAX_ROWS; row++) {
            for (var col = 0; col < Constants.MAX_COLS; col++) {
                if (this.Blocks[row][col].State == BlockState.Remove) {
                    this.Blocks[row][col].Tick++;
                    if (this.Blocks[row][col].Tick == Constants.TICKS_FOR_REMOVING_BLOCKS) {
                        if (totalChain < this.Blocks[row][col].TotalChain) {
                            totalChain = this.Blocks[row][col].TotalChain;
                        }
                        this.Blocks[row][col].State = BlockState.None;
                        this.Blocks[row][col].TotalChain = 0;
                        this.Blocks[row][col].Tick = 0;
                        this.Blocks[row][col].groupId = 0;
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
        this.SetCount = 0;
        for (var row = 1; row < Constants.MAX_ROWS; row++) {
            currentBlockCol = 0;
            setCount = 1;
            for (var col = 1; col < Constants.MAX_COLS; col++) {
                if ((this.Blocks[row][currentBlockCol].State == BlockState.Exist && this.Blocks[row][currentBlockCol].groupId == 0) &&
                    (this.Blocks[row][col].State == BlockState.Exist && this.Blocks[row][col].groupId == 0) &&
                    this.Blocks[row][col].Color == this.Blocks[row][currentBlockCol].Color) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k = 0; k < setCount; k++) {
                            this.Blocks[row][currentBlockCol + k].State = BlockState.Remove;
                            this.Blocks[row][currentBlockCol + k].TotalChain = chain;
                            this.Blocks[row][currentBlockCol + k].Tick = 0;
                            this.Blocks[row][currentBlockCol + k].Tick = 0;
                        }
                        this.Set[this.SetCount].Row = row;
                        this.Set[this.SetCount].Col = currentBlockCol;
                        this.Set[this.SetCount].Count = setCount;
                        this.Set[this.SetCount].NewSetIndex = -1;
                        this.Set[this.SetCount].Intersects = 0;
                        this.Set[this.SetCount].Type = SetType.Col;
                        this.SetCount++;
                    }
                    while (col != Constants.MAX_COLS - 1) {
                        if (this.Blocks[row][col + 1].State == BlockState.Exist) {
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
                    this.Blocks[row][currentBlockCol + k].State = BlockState.Remove;
                    this.Blocks[row][currentBlockCol + k].TotalChain = chain;
                    this.Blocks[row][currentBlockCol + k].Tick = 0;
                }
                this.Set[this.SetCount].Row = row;
                this.Set[this.SetCount].Col = currentBlockCol;
                this.Set[this.SetCount].Count = setCount;
                this.Set[this.SetCount].NewSetIndex = -1;
                this.Set[this.SetCount].Intersects = 0;
                this.Set[this.SetCount].Type = SetType.Col;
                this.SetCount++;
            }
        }
        for (var col = 0; col < Constants.MAX_COLS; col++) {
            currentBlockRow = 1;
            setCount = 1;
            for (var row = 2; row < Constants.MAX_ROWS; row++) {
                if (((this.Blocks[currentBlockRow][col].State == BlockState.Exist || this.Blocks[currentBlockRow][col].State == BlockState.Remove) && this.Blocks[currentBlockRow][col].groupId == 0) && ((this.Blocks[row][col].State == BlockState.Exist || this.Blocks[row][col].State == BlockState.Remove) && this.Blocks[row][col].groupId == 0) && (this.Blocks[row][col].Color == this.Blocks[currentBlockRow][col].Color)) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k = 0; k < setCount; k++) {
                            this.Blocks[currentBlockRow + k][col].State = BlockState.Remove;
                            this.Blocks[currentBlockRow + k][col].TotalChain = chain;
                            this.Blocks[currentBlockRow + k][col].Tick = 0;
                        }
                        this.Set[this.SetCount].Row = currentBlockRow;
                        this.Set[this.SetCount].Col = col;
                        this.Set[this.SetCount].Count = setCount;
                        this.Set[this.SetCount].NewSetIndex = -1;
                        this.Set[this.SetCount].Intersects = 0;
                        this.Set[this.SetCount].Type = SetType.Row;
                        this.SetCount++;
                    }
                    while (row != Constants.MAX_ROWS - 1) {
                        if (this.Blocks[row + 1][col].State == BlockState.Exist) {
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
                    this.Blocks[currentBlockRow + k][col].State = BlockState.Remove;
                    this.Blocks[currentBlockRow + k][col].TotalChain = chain;
                    this.Blocks[currentBlockRow + k][col].Tick = 0;
                }
                this.Set[this.SetCount].Row = currentBlockRow;
                this.Set[this.SetCount].Col = col;
                this.Set[this.SetCount].Count = setCount;
                this.Set[this.SetCount].NewSetIndex = -1;
                this.Set[this.SetCount].Intersects = 0;
                this.Set[this.SetCount].Type = SetType.Row;
                this.SetCount++;
            }
        }
        for (var i = 0; i < this.SetCount; i++) {
        }
        var NewSetIndex = 0;
        this.BlockSetsCount = this.SetCount;
        for (var i = 0; i < this.SetCount; i++) {
            if (this.Set[i].NewSetIndex == -1) {
                this.Set[i].NewSetIndex = NewSetIndex;
                this.BlockSets[NewSetIndex] = 0;
                NewSetIndex++;
            }
            for (var j = i; j < this.SetCount; j++) {
                if (i == j || this.Set[j].NewSetIndex == this.Set[i].NewSetIndex) {
                    continue;
                }
                if (this.Set[i].Type == SetType.Col && this.Set[j].Type == SetType.Row && this.Set[j].Row == this.Set[i].Row && this.Set[j].Col >= this.Set[i].Col && this.Set[j].Col <= (this.Set[i].Col + this.Set[i].Count)) {
                    this.Set[j].Intersects++;
                    this.Set[j].NewSetIndex = this.Set[i].NewSetIndex;
                    this.BlockSetsCount = this.BlockSetsCount - 1;
                }
                if (this.Set[j].Type == SetType.Col && this.Set[i].Type == SetType.Row && this.Set[j].Col >= this.Set[i].Col && this.Set[j].Col <= (this.Set[i].Col + this.Set[i].Count)) {
                    this.Set[i].Intersects++;
                    this.Set[i].NewSetIndex = this.Set[j].NewSetIndex;
                    this.BlockSetsCount = this.BlockSetsCount - 1;
                }
            }
        }
        for (var i = 0; i < this.SetCount; i++) {
            this.BlockSets[this.Set[i].NewSetIndex] += this.Set[i].Count - this.Set[i].Intersects;
        }
        if (this.SetCount > 0) {
            this.SoundRequests.push(SoundRequest.Remove);
            this.groupId++;
            for (var row = 0; row < Constants.MAX_ROWS; row++) {
                for (var col = 0; col < Constants.MAX_COLS; col++) {
                    if (this.Blocks[row][col].State == BlockState.Remove && this.Blocks[row][col].groupId == 0) {
                        this.Blocks[row][col].groupId = this.groupId;
                    }
                }
            }
            this.Active.BlocksRemoving = true;
            this.GetScore(chain);
        }
    }
    CheckForHover(chain, switchedBlocks) {
        var oneHoverFound = false;
        for (var row = 1; row < Constants.MAX_ROWS; row++) {
            for (var col = 0; col < Constants.MAX_COLS; col++) {
                if (this.Blocks[row][col].State == BlockState.Exist && this.Blocks[row][col].State != BlockState.Hover && this.Blocks[row][col].State != BlockState.HoverSwap) {
                    if (this.Blocks[row - 1][col].State == BlockState.None || this.Blocks[row - 1][col].State == BlockState.Hover || this.Blocks[row - 1][col].State == BlockState.HoverSwap) {
                        if (oneHoverFound == false) {
                            this.groupId++;
                            oneHoverFound = true;
                        }
                        this.Blocks[row][col].groupId = this.groupId;
                        this.Blocks[row][col].Tick = 0;
                        this.Blocks[row][col].TotalChain = chain;
                        if (switchedBlocks) {
                            this.Blocks[row][col].State = BlockState.HoverSwap;
                        }
                        else {
                            this.Blocks[row][col].State = BlockState.Hover;
                        }
                        for (var k = row; k > 0; k--) {
                            if (this.Blocks[k - 1][col].State == BlockState.None) {
                                this.HoverBlocks[row][col].Row = k - 1;
                            }
                            if (this.Blocks[k - 1][col].State == BlockState.Hover || this.Blocks[k - 1][col].State == BlockState.HoverSwap) {
                                this.HoverBlocks[row][col].Row = this.HoverBlocks[k - 1][col].Row + 1;
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
        for (var row = 1; row < Constants.MAX_ROWS; row++) {
            for (var col = 0; col < Constants.MAX_COLS; col++) {
                if (this.Blocks[row][col].State == BlockState.Falling) {
                    if (this.Blocks[row - 1][col].State == BlockState.None || this.Blocks[row - 1][col].State == BlockState.Falling || this.Blocks[row - 1][col].State == BlockState.LockedForFall) {
                        if (this.Blocks[row][col].TotalChain > chain) {
                            chain = this.Blocks[row][col].TotalChain;
                        }
                        this.Blocks[row][col].FallGroupTicks = Constants.TICKS_FOR_FALL;
                        for (var k = row; k > 0; k--) {
                            if (this.Active.Swap && k - 2 >= 0 && this.Blocks[k - 1][col].State == BlockState.Switch || this.Blocks[k - 1][col].State == BlockState.SwitchNone && this.Blocks[k - 2][col].State == BlockState.None) {
                                this.WaitForSwap = true;
                            }
                            if (this.Blocks[k - 1][col].State == BlockState.None) {
                                this.FallBlocks[row][col].Row = k - 1;
                                this.Blocks[k - 1][col].State = BlockState.LockedForFall;
                                this.Blocks[k - 1][col].FallGroupTicks = Constants.TICKS_FOR_FALL;
                                this.Blocks[k - 1][col].groupId = this.Blocks[row][col].groupId;
                            }
                            if (this.Blocks[k - 1][col].State == BlockState.LockedForFall) {
                                this.FallBlocks[row][col].Row = k - 1;
                            }
                            if (this.Blocks[k - 1][col].State == BlockState.Falling) {
                                this.FallBlocks[row][col].Row = this.FallBlocks[k - 1][col].Row + 1;
                                break;
                            }
                        }
                    }
                    else {
                        this.Blocks[row][col].State = BlockState.Exist;
                        this.Blocks[row][col].groupId = 0;
                        this.Blocks[row][col].Tick = 0;
                    }
                }
            }
        }
        if (this.WaitForSwap) {
            this.SwapOverRide = true;
            if (this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State == BlockState.Switch) {
                this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].TotalChain = chain;
            }
            else {
                this.Blocks[this.SwitchRightBlockRow][this.SwitchRightBlockCol].TotalChain = chain;
            }
        }
    }
    //Other
    CreateSetupBlocks() {
        for (var i = 0; i < Constants.STARTING_ROWS; i++) {
            this.AddBlockRow(i);
        }
    }
    RowChange() {
        this.MoveBlocksUpOneRow();
        this.AddBlockRow(0);
        this.Selector.Row = this.Selector.Row + 1;
    }
    MoveBlocksUpOneRow() {
        for (var row = Constants.MAX_ROWS - 1; row >= 1; row--) {
            for (var col = 0; col < Constants.MAX_COLS; col++) {
                this.Blocks[row][col].Color = this.Blocks[row - 1][col].Color;
                this.Blocks[row][col].State = this.Blocks[row - 1][col].State;
            }
        }
    }
    AddBlockRow(row) {
        for (var col = 0; col < 6; col++) {
            var blockColor;
            do {
                blockColor = (Math.floor(this.Random() * Math.floor(5)));
            } while (!this.IsNewBlockVaild(row, col, blockColor));
            this.Blocks[row][col].Color = blockColor;
            this.Blocks[row][col].State = BlockState.Exist;
            this.Blocks[row][col].groupId = 0;
            this.Blocks[row][col].Tick = 0;
            this.Blocks[row][col].FallGroupTicks = 0;
        }
    }
    //Condtional
    CheckForGameOver() {
        for (var col = 0; col < Constants.MAX_COLS; col++) {
            if (this.Blocks[Constants.MAX_ROWS - 1][col].State == BlockState.Exist) {
                this.Active.Puzzle = false;
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
            if ((blockRow - i) >= 0 && this.Blocks[blockRow - i][blockCol].State == BlockState.Exist && this.Blocks[blockRow - i][blockCol].Color == blockColor) {
                rowSameColor++;
                foundValue = true;
            }
            i++;
        } while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockRow + i) <= (Constants.MAX_ROWS - 1) && this.Blocks[blockRow + i][blockCol].State == BlockState.Exist && this.Blocks[blockRow + i][blockCol].Color == blockColor) {
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
            if ((blockCol - i) >= 0 && this.Blocks[blockRow][blockCol - i].State == BlockState.Exist && this.Blocks[blockRow][blockCol - i].Color == blockColor) {
                colSameColor++;
                foundValue = true;
            }
            i++;
        } while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockCol + i) <= (Constants.MAX_COLS - 1) && this.Blocks[blockRow][blockCol + i].State == BlockState.Exist && this.Blocks[blockRow][blockCol + i].Color == blockColor) {
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
        for (var i = 0; i < this.SetCount; i++) {
            this.TotalBlockScore(this.BlockSets[i]);
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
        this.Score += addtionalScore;
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
        this.Score += addtionalScore;
    }
}
class PuzzleView {
    constructor(name, container, textures) {
        this.blocksSprite = [];
        this.textures = [];
        this.container = container;
        this.textures = textures;
        let nameTextStyle = new PIXI.TextStyle({
            fontSize: 24,
            fontWeight: 'bold',
            fill: "#fdfdfd"
        });
        this.name = new PIXI.Text(name, nameTextStyle);
        this.name.x = 27;
        this.name.y = 15;
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
        thing.lineTo(3, (Constants.MAX_ROWS - 1) * 50 + 106);
        thing.lineTo(Constants.MAX_COLS * 50 + 3, (Constants.MAX_ROWS - 1) * 50 + 106);
        thing.lineTo(Constants.MAX_COLS * 50 + 3, 0);
        this.blocksContainer.mask = thing;
        for (let row = 0; row < Constants.MAX_ROWS; row++) {
            this.blocksSprite[row] = [];
            for (let col = 0; col < Constants.MAX_COLS; col++) {
                this.blocksSprite[row][col] = new PIXI.Sprite(this.textures["BlockBrown.png"]);
                this.blocksSprite[row][col].x = (col) * 50 + 3;
                this.blocksSprite[row][col].y = ((Constants.MAX_ROWS - 1) - row) * 50 + 106;
                this.blocksSprite[row][col].visible = false;
                this.blocksContainer.addChild(this.blocksSprite[row][col]);
            }
        }
        this.blocksContainer.addChild(this.selectorSprite);
        //Order Of Sprite (z)
        this.container.addChild(thing);
        this.container.addChild(this.layoutSprite);
        this.container.addChild(this.blocksContainer);
        this.container.addChild(this.level);
        this.container.addChild(this.name); //score Should be here
    }
    Update(puzzleLogic) {
        this.UpdateSelector(puzzleLogic.Selector);
        this.UpdateBlockStates(puzzleLogic.Blocks);
        this.UpdateBlockContainerState(puzzleLogic.BlockInc);
        this.UpdateLevel(puzzleLogic.Level);
        this.UpdateScore(puzzleLogic.Score);
    }
    UpdateBlockContainerState(y) {
        this.blocksContainer.y = -y;
    }
    UpdateBlockStates(Blocks) {
        for (let row = 0; row < Constants.MAX_ROWS; row++) {
            for (let col = 0; col < Constants.MAX_COLS; col++) {
                if (Blocks[row][col].State == BlockState.None ||
                    Blocks[row][col].State == BlockState.SwitchNone ||
                    Blocks[row][col].State == BlockState.LockedForFall) {
                    this.blocksSprite[row][col].visible = false;
                }
                else {
                    this.blocksSprite[row][col].visible = true;
                }
                //Set Texture
                if (Blocks[row][col].Color == BlockColor.Green) {
                    this.blocksSprite[row][col].texture = this.textures["BlockGreen.png"];
                }
                else if (Blocks[row][col].Color == BlockColor.Blue) {
                    this.blocksSprite[row][col].texture = this.textures["BlockBlue.png"];
                }
                else if (Blocks[row][col].Color == BlockColor.Red) {
                    this.blocksSprite[row][col].texture = this.textures["BlockRed.png"];
                }
                else if (Blocks[row][col].Color == BlockColor.Purple) {
                    this.blocksSprite[row][col].texture = this.textures["BlockPurple.png"];
                }
                else if (Blocks[row][col].Color == BlockColor.Yellow) {
                    this.blocksSprite[row][col].texture = this.textures["BlockYellow.png"];
                }
                else if (Blocks[row][col].Color == BlockColor.Brown) {
                    this.blocksSprite[row][col].texture = this.textures["BlockBrown.png"];
                }
            }
        }
    }
    UpdateSelector(selector) {
        this.selectorSprite.x = (selector.Col) * 50 + 3;
        this.selectorSprite.y = ((Constants.MAX_ROWS - 1) - selector.Row) * 50 + 106;
    }
    UpdateLevel(level) {
        this.level.text = String(level);
    }
    UpdateScore(score) {
        this.score.text = String(score);
    }
}
class PuzzleLogPlayer {
    constructor(puzzle) {
        this.CurrentTick = 0;
        this.TotalTicks = 0;
        this.LogId = -1;
        this.TicksPerSecound = 60;
        this.Log = [];
        this.puzzle = puzzle;
        this.Reset();
    }
    Reset() {
        this.CurrentTick = 0;
        this.TotalTicks = 0;
        this.TicksPerSecound = 60;
        this.LogId = 0;
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
    }
    Tick(ticks) {
        for (var i = 0; i < ticks; i++) {
            this.puzzle.logic.Tick();
        }
        this.puzzle.ViewUpdate();
        this.puzzle.logic.SoundRequests.length = 0;
    }
    GoToTick(tick) {
    }
    Pause() {
    }
    Resume() {
    }
    ClearLogItems() {
        this.Log = [];
    }
}
export { Puzzle };
//# sourceMappingURL=puzzle.js.map