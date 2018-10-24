
import {
    SetType, InputSet, BlockState, BlockColor, SoundRequest,
    Block, HoverBlock, FallBlock, BlockSet, Constants, LogItem,
    PuzzleLogicState
} from './dataTypes.js'

import seedrandom = require('seedrandom');
class PuzzleLogic {
    public State: PuzzleLogicState;
    constructor() {

    }

    //|Public|
    public Reset(log = false, seed = null): void {
        this.State = new PuzzleLogicState();
        //Seed
        if (seed != null) {
            this.State.Seed = seed;
        }
        else {
            this.State.Seed = seedrandom()();
        }
        this.State.Random = seedrandom(this.State.Seed.toString(), { state: true });

        //Log
        this.State.Log = log;
        this.State.LogItems = [];
        if (this.State.Log) {
            let logItem = new LogItem();
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
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            this.State.Blocks[row] = [];
            this.State.HoverBlocks[row] = [];
            this.State.FallBlocks[row] = [];
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                const block = new Block();
                block.State = BlockState.None;
                block.Color = BlockColor.Red;
                block.FallGroupTicks = 0;
                block.Tick = 0;
                block.groupId = 0;
                this.State.Blocks[row][col] = new Block();
                this.State.HoverBlocks[row][col] = new HoverBlock();
                this.State.FallBlocks[row][col] = new FallBlock();
            }
        }
        for (var i: number = 0; i < Constants.MAX_ROWS * Constants.MAX_COLS; i++) {
            this.State.BlockSets[i] = 0;
            this.State.Set[i] = new BlockSet();
        }
        this.State.Score = 0;
        this.State.Level = 1;
        this.State.groupId = 1;
        this.State.Selector.Row = 2;
        this.State.Selector.Col = 2;
        this.CreateSetupBlocks();
    }
    public Tick(): void {
        if (this.State.Active.Puzzle) {
            if (this.State.Log) {
                if (this.State.LogItems[this.State.LogItems.length - 1].Action !== "Tick") {
                    let logItem = new LogItem();
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
    public RequestMoveSelector(row: number, col: number): void {
        if (col >= 0 && col < (Constants.MAX_COLS - 1) && row >= 1 && row < Constants.MAX_ROWS) {
            if (this.State.Log) {
                let logItem = new LogItem();
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
    public RequestSwitch(): void {
        if (!this.State.Active.Swap) {
            if ((this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col].State == BlockState.None || this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col].State == BlockState.Exist) && (this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col + 1].State == BlockState.None || this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col + 1].State == BlockState.Exist) && (this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col].State != BlockState.None || this.State.Blocks[this.State.Selector.Row][this.State.Selector.Col + 1].State != BlockState.None)) {
                if (this.State.Log) {
                    let logItem = new LogItem();
                    logItem.Id = this.State.LogItems.length;
                    logItem.Action = "RequestSwitch";
                    this.State.LogItems.push(logItem);
                }
                this.State.SoundRequests.push(SoundRequest.Swap);
                this.State.WaitForSwap = false;
                this.State.Active.Swap = true;
                this.State.SwitchLeftBlockRow = this.State.Selector.Row;
                this.State.SwitchLeftBlockCol = this.State.Selector.Col;
                this.State.SwitchRightBlockRow = this.State.Selector.Row;
                this.State.SwitchRightBlockCol = this.State.Selector.Col + 1;
                if (this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State == BlockState.Exist) {
                    this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = BlockState.Switch;
                }
                else {
                    this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = BlockState.SwitchNone;
                }
                if (this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State == BlockState.Exist) {
                    this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = BlockState.Switch;
                }
                else {
                    this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = BlockState.SwitchNone;
                }
            }
        }
    }
    public UpdateActive(): void {
        this.State.Active.BlocksRemoving = false;
        this.State.Active.Falling = false;
        this.State.Active.Hover = false;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if (this.State.Blocks[row][col].State == BlockState.Falling || this.State.Blocks[row][col].State == BlockState.LockedForFall) {
                    this.State.Active.Falling = true;
                }
                else if (this.State.Blocks[row][col].State == BlockState.Hover || this.State.Blocks[row][col].State == BlockState.HoverSwap) {
                    this.State.Active.Hover = true;
                }
                else if (this.State.Blocks[row][col].State == BlockState.Remove) {
                    this.State.Active.BlocksRemoving = true;
                }
            }
        }
    }
    public SaveState(): object {
        return JSON.parse(JSON.stringify(
            {
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
    public LoadState(state): void {
        this.State.Paused = state.Paused;
        this.State.Log = state.Log;
        this.State.LogItems = state.LogItems;
        this.State.SoundRequests = state.SoundRequests;
        this.State.Blocks = state.Blocks;
        this.State.Random = seedrandom("", { state: state.Random });
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
    private HoverTick(): void {
        var falling: boolean = false;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if ((this.State.Blocks[row][col].State == BlockState.Hover || this.State.Blocks[row][col].State == BlockState.HoverSwap)) {
                    this.State.Blocks[row][col].Tick++;
                    if ((this.State.Blocks[row][col].State == BlockState.Hover && this.State.Blocks[row][col].Tick == Constants.TICKS_FOR_HOVER) || (this.State.Blocks[row][col].State == BlockState.HoverSwap && this.State.Blocks[row][col].Tick == Constants.TICKS_FOR_HOVER_SWAP)) {
                        this.State.Blocks[row][col].Tick = 0;
                        this.State.Blocks[row][col].State = BlockState.Falling;
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
    private FallTick(): void {
        var blocksFall: boolean = false;
        var largetChain: number = 0;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                this.State.SoundRequests.push(SoundRequest.Fall);
                if (this.State.Blocks[row][col].State == BlockState.Falling || this.State.Blocks[row][col].State == BlockState.LockedForFall) {
                    this.State.Blocks[row][col].Tick++;
                    if (this.State.Blocks[row][col].Tick == this.State.Blocks[row][col].FallGroupTicks) {
                        blocksFall = true;
                        this.State.Blocks[row][col].Tick = 0;
                        this.State.Blocks[row][col].FallGroupTicks = 0;
                        this.State.Blocks[row][col].groupId = 0;
                        if (this.State.Blocks[row][col].State == BlockState.Falling) {
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].State = BlockState.Exist;
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].Color = this.State.Blocks[row][col].Color;
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].Tick = 0;
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].groupId = 0;
                            if (this.State.Blocks[row][col].TotalChain > largetChain) {
                                largetChain = this.State.Blocks[row][col].TotalChain;
                            }
                            this.State.Blocks[row][col].TotalChain = 0;
                            this.State.Blocks[this.State.FallBlocks[row][col].Row][col].TotalChain = 0;
                        }
                        this.State.Blocks[row][col].State = BlockState.None;
                    }
                }
            }
        }
        if (blocksFall && !this.State.WaitForSwap) {
            this.CheckForSets(largetChain);
        }
    }
    private MoveBlocksUpTick(): void {
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
    private SwapBlocksTick(): void {
        this.State.Ticks.Swap++;
        if (this.State.Ticks.Swap == Constants.TICKS_FOR_SWAP) {
            var newRightState: BlockState = this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State;
            var newRightColor: BlockColor = this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].Color;
            this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State;
            this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].Color = this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].Color;
            this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = newRightState;
            this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].Color = newRightColor;
            if (this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State == BlockState.Switch) {
                this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = BlockState.Exist;
            }
            else {
                this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State = BlockState.None;
            }
            if (this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State == BlockState.Switch) {
                this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = BlockState.Exist;
            }
            else {
                this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].State = BlockState.None;
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
    private RemoveBlocksTick(): void {
        var totalChain: number = 0;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if (this.State.Blocks[row][col].State == BlockState.Remove) {
                    this.State.Blocks[row][col].Tick++;
                    if (this.State.Blocks[row][col].Tick == Constants.TICKS_FOR_REMOVING_BLOCKS) {
                        if (totalChain < this.State.Blocks[row][col].TotalChain) {
                            totalChain = this.State.Blocks[row][col].TotalChain;
                        }
                        this.State.Blocks[row][col].State = BlockState.None;
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
    private CheckForSets(chain: number): void {
        chain++;
        var setCount: number = 0;
        var currentBlockRow: number = 0;
        var currentBlockCol: number = 0;
        this.State.SetCount = 0;
        for (var row: number = 1; row < Constants.MAX_ROWS; row++) {
            currentBlockCol = 0;
            setCount = 1;
            for (var col: number = 1; col < Constants.MAX_COLS; col++) {
                if ((this.State.Blocks[row][currentBlockCol].State == BlockState.Exist && this.State.Blocks[row][currentBlockCol].groupId == 0) &&
                    (this.State.Blocks[row][col].State == BlockState.Exist && this.State.Blocks[row][col].groupId == 0) &&
                    this.State.Blocks[row][col].Color == this.State.Blocks[row][currentBlockCol].Color) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k: number = 0; k < setCount; k++) {
                            this.State.Blocks[row][currentBlockCol + k].State = BlockState.Remove;
                            this.State.Blocks[row][currentBlockCol + k].TotalChain = chain;
                            this.State.Blocks[row][currentBlockCol + k].Tick = 0;
                            this.State.Blocks[row][currentBlockCol + k].Tick = 0;
                        }
                        this.State.Set[this.State.SetCount].Row = row;
                        this.State.Set[this.State.SetCount].Col = currentBlockCol;
                        this.State.Set[this.State.SetCount].Count = setCount;
                        this.State.Set[this.State.SetCount].NewSetIndex = -1;
                        this.State.Set[this.State.SetCount].Intersects = 0;
                        this.State.Set[this.State.SetCount].Type = SetType.Col;
                        this.State.SetCount++;
                    }
                    while (col != Constants.MAX_COLS - 1) {
                        if (this.State.Blocks[row][col + 1].State == BlockState.Exist) {
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
                for (var k: number = 0; k < setCount; k++) {
                    this.State.Blocks[row][currentBlockCol + k].State = BlockState.Remove;
                    this.State.Blocks[row][currentBlockCol + k].TotalChain = chain;
                    this.State.Blocks[row][currentBlockCol + k].Tick = 0;
                }
                this.State.Set[this.State.SetCount].Row = row;
                this.State.Set[this.State.SetCount].Col = currentBlockCol;
                this.State.Set[this.State.SetCount].Count = setCount;
                this.State.Set[this.State.SetCount].NewSetIndex = -1;
                this.State.Set[this.State.SetCount].Intersects = 0;
                this.State.Set[this.State.SetCount].Type = SetType.Col;
                this.State.SetCount++;
            }
        }
        for (var col: number = 0; col < Constants.MAX_COLS; col++) {
            currentBlockRow = 1;
            setCount = 1;
            for (var row: number = 2; row < Constants.MAX_ROWS; row++) {
                if (((this.State.Blocks[currentBlockRow][col].State == BlockState.Exist || this.State.Blocks[currentBlockRow][col].State == BlockState.Remove) && this.State.Blocks[currentBlockRow][col].groupId == 0) && ((this.State.Blocks[row][col].State == BlockState.Exist || this.State.Blocks[row][col].State == BlockState.Remove) && this.State.Blocks[row][col].groupId == 0) && (this.State.Blocks[row][col].Color == this.State.Blocks[currentBlockRow][col].Color)) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k: number = 0; k < setCount; k++) {
                            this.State.Blocks[currentBlockRow + k][col].State = BlockState.Remove;
                            this.State.Blocks[currentBlockRow + k][col].TotalChain = chain;
                            this.State.Blocks[currentBlockRow + k][col].Tick = 0;
                        }
                        this.State.Set[this.State.SetCount].Row = currentBlockRow;
                        this.State.Set[this.State.SetCount].Col = col;
                        this.State.Set[this.State.SetCount].Count = setCount;
                        this.State.Set[this.State.SetCount].NewSetIndex = -1;
                        this.State.Set[this.State.SetCount].Intersects = 0;
                        this.State.Set[this.State.SetCount].Type = SetType.Row;

                        this.State.SetCount++;
                    }
                    while (row != Constants.MAX_ROWS - 1) {
                        if (this.State.Blocks[row + 1][col].State == BlockState.Exist) {
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
                for (var k: number = 0; k < setCount; k++) {
                    this.State.Blocks[currentBlockRow + k][col].State = BlockState.Remove;
                    this.State.Blocks[currentBlockRow + k][col].TotalChain = chain;
                    this.State.Blocks[currentBlockRow + k][col].Tick = 0;
                }
                this.State.Set[this.State.SetCount].Row = currentBlockRow;
                this.State.Set[this.State.SetCount].Col = col;
                this.State.Set[this.State.SetCount].Count = setCount;
                this.State.Set[this.State.SetCount].NewSetIndex = -1;
                this.State.Set[this.State.SetCount].Intersects = 0;
                this.State.Set[this.State.SetCount].Type = SetType.Row;
                this.State.SetCount++;
            }
        }
        for (var i: number = 0; i < this.State.SetCount; i++) {

        }

        var NewSetIndex: number = 0;
        this.State.BlockSetsCount = this.State.SetCount;
        for (var i: number = 0; i < this.State.SetCount; i++) {
            if (this.State.Set[i].NewSetIndex == -1) {
                this.State.Set[i].NewSetIndex = NewSetIndex;
                this.State.BlockSets[NewSetIndex] = 0;
                NewSetIndex++;
            }
            for (var j: number = i; j < this.State.SetCount; j++) {
                if (i == j || this.State.Set[j].NewSetIndex == this.State.Set[i].NewSetIndex) {
                    continue;
                }
                if (this.State.Set[i].Type == SetType.Col && this.State.Set[j].Type == SetType.Row && this.State.Set[j].Row == this.State.Set[i].Row && this.State.Set[j].Col >= this.State.Set[i].Col && this.State.Set[j].Col <= (this.State.Set[i].Col + this.State.Set[i].Count)) {
                    this.State.Set[j].Intersects++;
                    this.State.Set[j].NewSetIndex = this.State.Set[i].NewSetIndex;
                    this.State.BlockSetsCount = this.State.BlockSetsCount - 1;
                }
                if (this.State.Set[j].Type == SetType.Col && this.State.Set[i].Type == SetType.Row && this.State.Set[j].Col >= this.State.Set[i].Col && this.State.Set[j].Col <= (this.State.Set[i].Col + this.State.Set[i].Count)) {
                    this.State.Set[i].Intersects++;
                    this.State.Set[i].NewSetIndex = this.State.Set[j].NewSetIndex;
                    this.State.BlockSetsCount = this.State.BlockSetsCount - 1;
                }
            }
        }
        for (var i: number = 0; i < this.State.SetCount; i++) {
            this.State.BlockSets[this.State.Set[i].NewSetIndex] += this.State.Set[i].Count - this.State.Set[i].Intersects;
        }
        if (this.State.SetCount > 0) {
            this.State.SoundRequests.push(SoundRequest.Remove);
            this.State.groupId++;
            for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
                for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                    if (this.State.Blocks[row][col].State == BlockState.Remove && this.State.Blocks[row][col].groupId == 0) {
                        this.State.Blocks[row][col].groupId = this.State.groupId;
                    }
                }
            }
            this.State.Active.BlocksRemoving = true;
            this.GetScore(chain);
        }
    }
    private CheckForHover(chain: number, switchedBlocks: boolean): void {
        var oneHoverFound: boolean = false;
        for (var row: number = 1; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if (this.State.Blocks[row][col].State == BlockState.Exist && this.State.Blocks[row][col].State != BlockState.Hover && this.State.Blocks[row][col].State != BlockState.HoverSwap) {
                    if (this.State.Blocks[row - 1][col].State == BlockState.None || this.State.Blocks[row - 1][col].State == BlockState.Hover || this.State.Blocks[row - 1][col].State == BlockState.HoverSwap) {
                        if (oneHoverFound == false) {
                            this.State.groupId++;
                            oneHoverFound = true;
                        }
                        this.State.Blocks[row][col].groupId = this.State.groupId;
                        this.State.Blocks[row][col].Tick = 0;
                        this.State.Blocks[row][col].TotalChain = chain;
                        if (switchedBlocks) {
                            this.State.Blocks[row][col].State = BlockState.HoverSwap;
                        }
                        else {
                            this.State.Blocks[row][col].State = BlockState.Hover;
                        }
                        for (var k: number = row; k > 0; k--) {
                            if (this.State.Blocks[k - 1][col].State == BlockState.None) {
                                this.State.HoverBlocks[row][col].Row = k - 1;
                            }
                            if (this.State.Blocks[k - 1][col].State == BlockState.Hover || this.State.Blocks[k - 1][col].State == BlockState.HoverSwap) {
                                this.State.HoverBlocks[row][col].Row = this.State.HoverBlocks[k - 1][col].Row + 1;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    private CheckForFalling(): void {
        var chain: number = 0;
        for (var row: number = 1; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if (this.State.Blocks[row][col].State == BlockState.Falling) {
                    if (this.State.Blocks[row - 1][col].State == BlockState.None || this.State.Blocks[row - 1][col].State == BlockState.Falling || this.State.Blocks[row - 1][col].State == BlockState.LockedForFall) {
                        if (this.State.Blocks[row][col].TotalChain > chain) {
                            chain = this.State.Blocks[row][col].TotalChain;
                        }
                        this.State.Blocks[row][col].FallGroupTicks = Constants.TICKS_FOR_FALL;
                        for (var k: number = row; k > 0; k--) {
                            if (this.State.Active.Swap && k - 2 >= 0 && this.State.Blocks[k - 1][col].State == BlockState.Switch || this.State.Blocks[k - 1][col].State == BlockState.SwitchNone && this.State.Blocks[k - 2][col].State == BlockState.None) {
                                this.State.WaitForSwap = true;
                            }
                            if (this.State.Blocks[k - 1][col].State == BlockState.None) {
                                this.State.FallBlocks[row][col].Row = k - 1;
                                this.State.Blocks[k - 1][col].State = BlockState.LockedForFall;
                                this.State.Blocks[k - 1][col].FallGroupTicks = Constants.TICKS_FOR_FALL;
                                this.State.Blocks[k - 1][col].groupId = this.State.Blocks[row][col].groupId;
                            }
                            if (this.State.Blocks[k - 1][col].State == BlockState.LockedForFall) {
                                this.State.FallBlocks[row][col].Row = k - 1;
                            }
                            if (this.State.Blocks[k - 1][col].State == BlockState.Falling) {
                                this.State.FallBlocks[row][col].Row = this.State.FallBlocks[k - 1][col].Row + 1;
                                break;
                            }
                        }
                    }
                    else {
                        this.State.Blocks[row][col].State = BlockState.Exist;
                        this.State.Blocks[row][col].groupId = 0;
                        this.State.Blocks[row][col].Tick = 0;
                    }
                }
            }
        }
        if (this.State.WaitForSwap) {
            this.State.SwapOverRide = true;
            if (this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].State == BlockState.Switch) {
                this.State.Blocks[this.State.SwitchLeftBlockRow][this.State.SwitchLeftBlockCol].TotalChain = chain;
            }
            else {
                this.State.Blocks[this.State.SwitchRightBlockRow][this.State.SwitchRightBlockCol].TotalChain = chain;
            }
        }
    }

    //Other
    private CreateSetupBlocks(): void {
        for (var i: number = 0; i < Constants.STARTING_ROWS; i++) {
            this.AddBlockRow(i);
        }
    }
    private RowChange(): void {
        this.MoveBlocksUpOneRow();
        this.AddBlockRow(0);
        this.State.Selector.Row = this.State.Selector.Row + 1;
        this.State.SwitchLeftBlockRow++;
        this.State.SwitchRightBlockRow++;
    }
    private MoveBlocksUpOneRow(): void {
        for (var row: number = Constants.MAX_ROWS - 1; row >= 1; row--) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                this.State.Blocks[row][col].Color = this.State.Blocks[row - 1][col].Color;
                this.State.Blocks[row][col].State = this.State.Blocks[row - 1][col].State;
            }
        }
    }
    private AddBlockRow(row: number): void {
        for (var col: number = 0; col < 6; col++) {
            var blockColor: BlockColor;
            do {
                blockColor = <BlockColor>(Math.floor(this.State.Random() * Math.floor(5)));
            }
            while (!this.IsNewBlockVaild(row, col, blockColor));
            this.State.Blocks[row][col].Color = blockColor;
            this.State.Blocks[row][col].State = BlockState.Exist;
            this.State.Blocks[row][col].groupId = 0;
            this.State.Blocks[row][col].Tick = 0;
            this.State.Blocks[row][col].FallGroupTicks = 0;
        }
    }

    //Condtional
    private CheckForGameOver(): void {
        for (var col: number = 0; col < Constants.MAX_COLS; col++) {
            if (this.State.Blocks[Constants.MAX_ROWS - 1][col].State == BlockState.Exist) {
                this.State.Active.Puzzle = false;
            }
        }
    }
    private IsNewBlockVaild(blockRow: number, blockCol: number, blockColor: BlockColor): boolean {
        var foundValue: boolean = false;
        var i: number = 0;
        var rowSameColor: number = 0;
        i = 1;
        do {
            foundValue = false;
            if ((blockRow - i) >= 0 && this.State.Blocks[blockRow - i][blockCol].State == BlockState.Exist && this.State.Blocks[blockRow - i][blockCol].Color == blockColor) {
                rowSameColor++;
                foundValue = true;
            }
            i++;
        }
        while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockRow + i) <= (Constants.MAX_ROWS - 1) && this.State.Blocks[blockRow + i][blockCol].State == BlockState.Exist && this.State.Blocks[blockRow + i][blockCol].Color == blockColor) {
                rowSameColor++;
                foundValue = true;
            }
            i++;
        }
        while (foundValue);
        if (rowSameColor >= 2) {
            return false;
        }

        var colSameColor: number = 0;
        i = 1;
        do {
            foundValue = false;
            if ((blockCol - i) >= 0 && this.State.Blocks[blockRow][blockCol - i].State == BlockState.Exist && this.State.Blocks[blockRow][blockCol - i].Color == blockColor) {
                colSameColor++;
                foundValue = true;
            }
            i++;
        }
        while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockCol + i) <= (Constants.MAX_COLS - 1) && this.State.Blocks[blockRow][blockCol + i].State == BlockState.Exist && this.State.Blocks[blockRow][blockCol + i].Color == blockColor) {
                colSameColor++;
                foundValue = true;
            }
            i++;
        }
        while (foundValue);
        if (colSameColor >= 2) {
            return false;
        }
        return true;
    }

    //Score
    private GetScore(chain: number): void {
        this.ChainScore(chain);
        for (var i: number = 0; i < this.State.SetCount; i++) {
            this.TotalBlockScore(this.State.BlockSets[i]);
        }
    }
    private ChainScore(chain: number): void {
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
    private TotalBlockScore(totalBlocks: number): void {
        var addtionalScore: number = 0;
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

export { PuzzleLogic };