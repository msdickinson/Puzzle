
import {
    SetType, BlockState, BlockColor, SoundRequest,
    Block, HoverBlock, FallBlock, BlockSet, Constants, LogItem,
    LogicState
} from '../DataTypes'
import { seedRandom } from "../../Lib/seedrandom/seedrandom.js";
import { prng } from "../../Lib/seedrandom/index.js";
class Logic {

    constructor() {

    }

    //|Public|
    public Reset(state: LogicState, log = false, seed = null): void {
   
        //Seed
        if (seed != null) {
            state.Seed = seed;
        }
        else {
            state.Seed = seedRandom.seedrandom(null, { state: true })();
        }
        state.Random = seedRandom.seedrandom(state.Seed.toString(), { state: true });

        //Log
        state.Log = log;
        state.LogItems = [];
        if (state.Log) {
            let logItem = new LogItem();
            logItem.Id = state.LogItems.length;
            logItem.Action = "Seed";
            logItem.ValueOne = state.Seed;
            state.LogItems.push(logItem);
        }

        state.SoundRequests = [];
        state.Active.Puzzle = true;
        state.Active.Hover = false;
        state.Active.Swap = false;
        state.Active.Falling = false;
        state.SwapOverRide = false;
        state.Ticks.Puzzle = 0;
        state.WaitForSwap = false;
        state.Ticks.MoveBlocksUp = 0;
        state.Ticks.Swap = 0;
        state.BlockInc = 0;
        state.Blocks = [];
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            state.Blocks[row] = [];
            state.HoverBlocks[row] = [];
            state.FallBlocks[row] = [];
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                const block = new Block();
                block.State = BlockState.None;
                block.Color = BlockColor.Red;
                block.FallGroupTicks = 0;
                block.Tick = 0;
                block.groupId = 0;
                state.Blocks[row][col] = new Block();
                state.HoverBlocks[row][col] = new HoverBlock();
                state.FallBlocks[row][col] = new FallBlock();
            }
        }
        for (var i: number = 0; i < Constants.MAX_ROWS * Constants.MAX_COLS; i++) {
            state.BlockSets[i] = 0;
            state.Set[i] = new BlockSet();
        }
        state.Score = 0;
        state.Level = 1;
        state.groupId = 1;
        state.Selector.Row = 2;
        state.Selector.Col = 2;
        this.CreateSetupBlocks(state);
    }
    public Tick(state: LogicState): void {
        if (state.Active.Puzzle) {
            if (state.Log) {
                if (state.LogItems[state.LogItems.length - 1].Action !== "Tick") {
                    let logItem = new LogItem();
                    logItem.Id = state.LogItems.length;
                    logItem.Action = "Tick";
                    logItem.ValueOne = 1;
                    state.LogItems.push(logItem);
                }
                else {
                    state.LogItems[state.LogItems.length - 1].ValueOne++;
                }
            }


            state.Ticks.Puzzle++;
            if (state.Active.Falling) {
                this.FallTick(state);
            }
            if (state.Active.Hover) {
                this.HoverTick(state);
            }
            if (state.Active.BlocksRemoving) {
                this.RemoveBlocksTick(state);
            }
            if (state.Active.Swap) {
                this.SwapBlocksTick(state);
            }
            if (!state.Active.BlocksRemoving && !state.Active.Hover) {
                this.MoveBlocksUpTick(state);
            }
            if (state.Ticks.Puzzle % (60 * 20) == 0)
                state.Level++;
            this.UpdateActive(state);
        }
    }
    public RequestMoveSelector(state: LogicState, row: number, col: number): void {
        if (col >= 0 && col < (Constants.MAX_COLS - 1) && row >= 1 && row < Constants.MAX_ROWS) {
            if (state.Log) {
                let logItem = new LogItem();
                logItem.Id = state.LogItems.length;
                logItem.Action = "RequestMoveSelector";
                logItem.ValueOne = row;
                logItem.ValueTwo = col;
                state.LogItems.push(logItem);
            }
            state.Selector.Row = row;
            state.Selector.Col = col;
        }
    }
    public RequestSwitch(state: LogicState): void {
        if (!state.Active.Swap) {
            if ((state.Blocks[state.Selector.Row][state.Selector.Col].State == BlockState.None || state.Blocks[state.Selector.Row][state.Selector.Col].State == BlockState.Exist) && (state.Blocks[state.Selector.Row][state.Selector.Col + 1].State == BlockState.None || state.Blocks[state.Selector.Row][state.Selector.Col + 1].State == BlockState.Exist) && (state.Blocks[state.Selector.Row][state.Selector.Col].State != BlockState.None || state.Blocks[state.Selector.Row][state.Selector.Col + 1].State != BlockState.None)) {
                if (state.Log) {
                    let logItem = new LogItem();
                    logItem.Id = state.LogItems.length;
                    logItem.Action = "RequestSwitch";
                    state.LogItems.push(logItem);
                }
                state.SoundRequests.push(SoundRequest.Swap);
                state.WaitForSwap = false;
                state.Active.Swap = true;
                state.SwitchLeftBlockRow = state.Selector.Row;
                state.SwitchLeftBlockCol = state.Selector.Col;
                state.SwitchRightBlockRow = state.Selector.Row;
                state.SwitchRightBlockCol = state.Selector.Col + 1;
                if (state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].State == BlockState.Exist) {
                    state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].State = BlockState.Switch;
                }
                else {
                    state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].State = BlockState.SwitchNone;
                }
                if (state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].State == BlockState.Exist) {
                    state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].State = BlockState.Switch;
                }
                else {
                    state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].State = BlockState.SwitchNone;
                }
            }
        }
    }
    public UpdateActive(state: LogicState): void {
        state.Active.BlocksRemoving = false;
        state.Active.Falling = false;
        state.Active.Hover = false;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if (state.Blocks[row][col].State == BlockState.Falling || state.Blocks[row][col].State == BlockState.LockedForFall) {
                    state.Active.Falling = true;
                }
                else if (state.Blocks[row][col].State == BlockState.Hover || state.Blocks[row][col].State == BlockState.HoverSwap) {
                    state.Active.Hover = true;
                }
                else if (state.Blocks[row][col].State == BlockState.Remove) {
                    state.Active.BlocksRemoving = true;
                }
            }
        }
    }
    public SaveState(state: LogicState): object {
        return JSON.parse(JSON.stringify(
            {
                Paused: state.Paused,
                Log: state.Log,
                LogItems: state.LogItems,
                SoundRequests: state.SoundRequests,
                Blocks: state.Blocks,
                Random: state.Random.state(),
                HoverBlocks: state.HoverBlocks,
                FallBlocks: state.FallBlocks,
                BlocksMoveFast: state.BlocksMoveFast,
                SwitchLeftBlockRow: state.SwitchLeftBlockRow,
                SwitchLeftBlockCol: state.SwitchLeftBlockCol,
                SwitchRightBlockRow: state.SwitchRightBlockRow,
                SwitchRightBlockCol: state.SwitchRightBlockCol,
                SwapOverRide: state.SwapOverRide,
                WaitForSwap: state.WaitForSwap,
                BlockInc: state.BlockInc,
                Score: state.Score,
                Level: state.Level,
                Chain: state.Chain,
                groupId: state.groupId,
                Selector: state.Selector,
                Active: state.Active,
                Ticks: state.Ticks,
                SetCount: state.SetCount,
                Set: state.Set,
                BlockSetsCount: state.BlockSetsCount,
                BlockSets: state.BlockSets
            }));
    }
    public LoadState(state: LogicState, loadState): void {
        state.Paused = loadState.Paused;
        state.Log = loadState.Log;
        state.LogItems = loadState.LogItems;
        state.SoundRequests = loadState.SoundRequests;
        state.Blocks = loadState.Blocks;
        state.Random = seedRandom.seedrandom("", { state: loadState.Random });
        state.HoverBlocks = loadState.HoverBlocks;
        state.FallBlocks = loadState.FallBlocks;
        state.BlocksMoveFast = loadState.BlocksMoveFast;
        state.SwitchLeftBlockRow = loadState.SwitchLeftBlockRow;
        state.SwitchLeftBlockCol = loadState.SwitchLeftBlockCol;
        state.SwitchRightBlockRow = loadState.SwitchRightBlockRow;
        state.SwitchRightBlockCol = loadState.SwitchRightBlockCol;
        state.SwapOverRide = loadState.SwapOverRide;
        state.WaitForSwap = loadState.WaitForSwap;
        state.BlockInc = loadState.BlockInc;
        state.Score = loadState.Score;
        state.Level = loadState.Level;
        state.Chain = loadState.Chain;
        state.groupId = loadState.groupId;
        state.Selector = loadState.Selector;
        state.Active = loadState.Active;
        state.Ticks = loadState.Ticks;
        state.SetCount = loadState.SetCount;
        state.Set = loadState.Set;
        state.BlockSetsCount = loadState.BlockSetsCount;
        state.BlockSets = loadState.BlockSets;
    }
    //Private

    //Ticks
    private HoverTick(state: LogicState): void {
        var falling: boolean = false;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if ((state.Blocks[row][col].State == BlockState.Hover || state.Blocks[row][col].State == BlockState.HoverSwap)) {
                    state.Blocks[row][col].Tick++;
                    if ((state.Blocks[row][col].State == BlockState.Hover && state.Blocks[row][col].Tick == Constants.TICKS_FOR_HOVER) || (state.Blocks[row][col].State == BlockState.HoverSwap && state.Blocks[row][col].Tick == Constants.TICKS_FOR_HOVER_SWAP)) {
                        state.Blocks[row][col].Tick = 0;
                        state.Blocks[row][col].State = BlockState.Falling;
                        state.Blocks[row][col].groupId = 0;
                        falling = true;
                    }
                }
            }
        }
        if (falling) {
            this.CheckForFalling(state);
        }
    }
    private FallTick(state: LogicState): void {
        var blocksFall: boolean = false;
        var largetChain: number = 0;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                state.SoundRequests.push(SoundRequest.Fall);
                if (state.Blocks[row][col].State == BlockState.Falling || state.Blocks[row][col].State == BlockState.LockedForFall) {
                    state.Blocks[row][col].Tick++;
                    if (state.Blocks[row][col].Tick == state.Blocks[row][col].FallGroupTicks) {
                        blocksFall = true;
                        state.Blocks[row][col].Tick = 0;
                        state.Blocks[row][col].FallGroupTicks = 0;
                        state.Blocks[row][col].groupId = 0;
                        if (state.Blocks[row][col].State == BlockState.Falling) {
                            state.Blocks[state.FallBlocks[row][col].Row][col].State = BlockState.Exist;
                            state.Blocks[state.FallBlocks[row][col].Row][col].Color = state.Blocks[row][col].Color;
                            state.Blocks[state.FallBlocks[row][col].Row][col].Tick = 0;
                            state.Blocks[state.FallBlocks[row][col].Row][col].groupId = 0;
                            if (state.Blocks[row][col].TotalChain > largetChain) {
                                largetChain = state.Blocks[row][col].TotalChain;
                            }
                            state.Blocks[row][col].TotalChain = 0;
                            state.Blocks[state.FallBlocks[row][col].Row][col].TotalChain = 0;
                        }
                        state.Blocks[row][col].State = BlockState.None;
                    }
                }
            }
        }
        if (blocksFall && !state.WaitForSwap) {
            this.CheckForSets(state, largetChain);
        }
    }
    private MoveBlocksUpTick(state: LogicState): void {
        state.Ticks.MoveBlocksUp++;
        if (!state.BlocksMoveFast) {
            state.BlockInc += 50 / (450 - ((state.Level - 1) * 15));
        }
        else {
            if (state.Ticks.MoveBlocksUp % 1 == 0 && state.BlockInc >= 50) {
                state.BlockInc += 2.5;
            }
        }
        if (state.BlockInc >= 50) {
            this.CheckForGameOver(state);
            if (state.Active.Puzzle) {
                state.BlockInc = 0;
                state.Ticks.MoveBlocksUp = 0;
                this.RowChange(state);
                this.CheckForSets(state, 0);
            }

        }
    }
    private SwapBlocksTick(state: LogicState): void {
        state.Ticks.Swap++;
        if (state.Ticks.Swap == Constants.TICKS_FOR_SWAP) {
            var newRightState: BlockState = state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].State;
            var newRightColor: BlockColor = state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].Color;
            state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].State = state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].State;
            state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].Color = state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].Color;
            state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].State = newRightState;
            state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].Color = newRightColor;
            if (state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].State == BlockState.Switch) {
                state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].State = BlockState.Exist;
            }
            else {
                state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].State = BlockState.None;
            }
            if (state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].State == BlockState.Switch) {
                state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].State = BlockState.Exist;
            }
            else {
                state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].State = BlockState.None;
            }
            state.Ticks.Swap = 0;
            state.Active.Swap = false;
            if (!state.SwapOverRide) {
                this.CheckForSets(state, 0);
            }
            if (state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].TotalChain > state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].TotalChain) {
                this.CheckForHover(state, state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].TotalChain, !state.SwapOverRide);
            }
            else {
                this.CheckForHover(state, state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].TotalChain, !state.SwapOverRide);
            }
        }
    }
    private RemoveBlocksTick(state: LogicState): void {
        var totalChain: number = 0;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if (state.Blocks[row][col].State == BlockState.Remove) {
                    state.Blocks[row][col].Tick++;
                    if (state.Blocks[row][col].Tick == Constants.TICKS_FOR_REMOVING_BLOCKS) {
                        if (totalChain < state.Blocks[row][col].TotalChain) {
                            totalChain = state.Blocks[row][col].TotalChain;
                        }
                        state.Blocks[row][col].State = BlockState.None;
                        state.Blocks[row][col].TotalChain = 0;
                        state.Blocks[row][col].Tick = 0;
                        state.Blocks[row][col].groupId = 0;
                    }
                }
            }
        }
        this.UpdateActive(state);
        this.CheckForHover(state, totalChain, false);
    }

    //Checks
    private CheckForSets(state: LogicState, chain: number): void {
        chain++;
        var setCount: number = 0;
        var currentBlockRow: number = 0;
        var currentBlockCol: number = 0;
        state.SetCount = 0;
        for (var row: number = 1; row < Constants.MAX_ROWS; row++) {
            currentBlockCol = 0;
            setCount = 1;
            for (var col: number = 1; col < Constants.MAX_COLS; col++) {
                if ((state.Blocks[row][currentBlockCol].State == BlockState.Exist && state.Blocks[row][currentBlockCol].groupId == 0) &&
                    (state.Blocks[row][col].State == BlockState.Exist && state.Blocks[row][col].groupId == 0) &&
                    state.Blocks[row][col].Color == state.Blocks[row][currentBlockCol].Color) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k: number = 0; k < setCount; k++) {
                            state.Blocks[row][currentBlockCol + k].State = BlockState.Remove;
                            state.Blocks[row][currentBlockCol + k].TotalChain = chain;
                            state.Blocks[row][currentBlockCol + k].Tick = 0;
                            state.Blocks[row][currentBlockCol + k].Tick = 0;
                        }
                        state.Set[state.SetCount].Row = row;
                        state.Set[state.SetCount].Col = currentBlockCol;
                        state.Set[state.SetCount].Count = setCount;
                        state.Set[state.SetCount].NewSetIndex = -1;
                        state.Set[state.SetCount].Intersects = 0;
                        state.Set[state.SetCount].Type = SetType.Col;
                        state.SetCount++;
                    }
                    while (col != Constants.MAX_COLS - 1) {
                        if (state.Blocks[row][col + 1].State == BlockState.Exist) {
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
                    state.Blocks[row][currentBlockCol + k].State = BlockState.Remove;
                    state.Blocks[row][currentBlockCol + k].TotalChain = chain;
                    state.Blocks[row][currentBlockCol + k].Tick = 0;
                }
                state.Set[state.SetCount].Row = row;
                state.Set[state.SetCount].Col = currentBlockCol;
                state.Set[state.SetCount].Count = setCount;
                state.Set[state.SetCount].NewSetIndex = -1;
                state.Set[state.SetCount].Intersects = 0;
                state.Set[state.SetCount].Type = SetType.Col;
                state.SetCount++;
            }
        }
        for (var col: number = 0; col < Constants.MAX_COLS; col++) {
            currentBlockRow = 1;
            setCount = 1;
            for (var row: number = 2; row < Constants.MAX_ROWS; row++) {
                if (((state.Blocks[currentBlockRow][col].State == BlockState.Exist || state.Blocks[currentBlockRow][col].State == BlockState.Remove) && state.Blocks[currentBlockRow][col].groupId == 0) && ((state.Blocks[row][col].State == BlockState.Exist || state.Blocks[row][col].State == BlockState.Remove) && state.Blocks[row][col].groupId == 0) && (state.Blocks[row][col].Color == state.Blocks[currentBlockRow][col].Color)) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k: number = 0; k < setCount; k++) {
                            state.Blocks[currentBlockRow + k][col].State = BlockState.Remove;
                            state.Blocks[currentBlockRow + k][col].TotalChain = chain;
                            state.Blocks[currentBlockRow + k][col].Tick = 0;
                        }
                        state.Set[state.SetCount].Row = currentBlockRow;
                        state.Set[state.SetCount].Col = col;
                        state.Set[state.SetCount].Count = setCount;
                        state.Set[state.SetCount].NewSetIndex = -1;
                        state.Set[state.SetCount].Intersects = 0;
                        state.Set[state.SetCount].Type = SetType.Row;

                        state.SetCount++;
                    }
                    while (row != Constants.MAX_ROWS - 1) {
                        if (state.Blocks[row + 1][col].State == BlockState.Exist) {
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
                    state.Blocks[currentBlockRow + k][col].State = BlockState.Remove;
                    state.Blocks[currentBlockRow + k][col].TotalChain = chain;
                    state.Blocks[currentBlockRow + k][col].Tick = 0;
                }
                state.Set[state.SetCount].Row = currentBlockRow;
                state.Set[state.SetCount].Col = col;
                state.Set[state.SetCount].Count = setCount;
                state.Set[state.SetCount].NewSetIndex = -1;
                state.Set[state.SetCount].Intersects = 0;
                state.Set[state.SetCount].Type = SetType.Row;
                state.SetCount++;
            }
        }
        for (var i: number = 0; i < state.SetCount; i++) {

        }

        var NewSetIndex: number = 0;
        state.BlockSetsCount = state.SetCount;
        for (var i: number = 0; i < state.SetCount; i++) {
            if (state.Set[i].NewSetIndex == -1) {
                state.Set[i].NewSetIndex = NewSetIndex;
                state.BlockSets[NewSetIndex] = 0;
                NewSetIndex++;
            }
            for (var j: number = i; j < state.SetCount; j++) {
                if (i == j || state.Set[j].NewSetIndex == state.Set[i].NewSetIndex) {
                    continue;
                }
                if (state.Set[i].Type == SetType.Col && state.Set[j].Type == SetType.Row && state.Set[j].Row == state.Set[i].Row && state.Set[j].Col >= state.Set[i].Col && state.Set[j].Col <= (state.Set[i].Col + state.Set[i].Count)) {
                    state.Set[j].Intersects++;
                    state.Set[j].NewSetIndex = state.Set[i].NewSetIndex;
                    state.BlockSetsCount = state.BlockSetsCount - 1;
                }
                if (state.Set[j].Type == SetType.Col && state.Set[i].Type == SetType.Row && state.Set[j].Col >= state.Set[i].Col && state.Set[j].Col <= (state.Set[i].Col + state.Set[i].Count)) {
                    state.Set[i].Intersects++;
                    state.Set[i].NewSetIndex = state.Set[j].NewSetIndex;
                    state.BlockSetsCount = state.BlockSetsCount - 1;
                }
            }
        }
        for (var i: number = 0; i < state.SetCount; i++) {
            state.BlockSets[state.Set[i].NewSetIndex] += state.Set[i].Count - state.Set[i].Intersects;
        }
        if (state.SetCount > 0) {
            state.SoundRequests.push(SoundRequest.Remove);
            state.groupId++;
            for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
                for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                    if (state.Blocks[row][col].State == BlockState.Remove && state.Blocks[row][col].groupId == 0) {
                        state.Blocks[row][col].groupId = state.groupId;
                    }
                }
            }
            state.Active.BlocksRemoving = true;
            this.GetScore(state, chain);
        }
    }
    private CheckForHover(state: LogicState, chain: number, switchedBlocks: boolean): void {
        var oneHoverFound: boolean = false;
        for (var row: number = 1; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if (state.Blocks[row][col].State == BlockState.Exist && state.Blocks[row][col].State != BlockState.Hover && state.Blocks[row][col].State != BlockState.HoverSwap) {
                    if (state.Blocks[row - 1][col].State == BlockState.None || state.Blocks[row - 1][col].State == BlockState.Hover || state.Blocks[row - 1][col].State == BlockState.HoverSwap) {
                        if (oneHoverFound == false) {
                            state.groupId++;
                            oneHoverFound = true;
                        }
                        state.Blocks[row][col].groupId = state.groupId;
                        state.Blocks[row][col].Tick = 0;
                        state.Blocks[row][col].TotalChain = chain;
                        if (switchedBlocks) {
                            state.Blocks[row][col].State = BlockState.HoverSwap;
                        }
                        else {
                            state.Blocks[row][col].State = BlockState.Hover;
                        }
                        for (var k: number = row; k > 0; k--) {
                            if (state.Blocks[k - 1][col].State == BlockState.None) {
                                state.HoverBlocks[row][col].Row = k - 1;
                            }
                            if (state.Blocks[k - 1][col].State == BlockState.Hover || state.Blocks[k - 1][col].State == BlockState.HoverSwap) {
                                state.HoverBlocks[row][col].Row = state.HoverBlocks[k - 1][col].Row + 1;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    private CheckForFalling(state: LogicState): void {
        var chain: number = 0;
        for (var row: number = 1; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if (state.Blocks[row][col].State == BlockState.Falling) {
                    if (state.Blocks[row - 1][col].State == BlockState.None || state.Blocks[row - 1][col].State == BlockState.Falling || state.Blocks[row - 1][col].State == BlockState.LockedForFall) {
                        if (state.Blocks[row][col].TotalChain > chain) {
                            chain = state.Blocks[row][col].TotalChain;
                        }
                        state.Blocks[row][col].FallGroupTicks = Constants.TICKS_FOR_FALL;
                        for (var k: number = row; k > 0; k--) {
                            if (state.Active.Swap && k - 2 >= 0 && state.Blocks[k - 1][col].State == BlockState.Switch || state.Blocks[k - 1][col].State == BlockState.SwitchNone && state.Blocks[k - 2][col].State == BlockState.None) {
                                state.WaitForSwap = true;
                            }
                            if (state.Blocks[k - 1][col].State == BlockState.None) {
                                state.FallBlocks[row][col].Row = k - 1;
                                state.Blocks[k - 1][col].State = BlockState.LockedForFall;
                                state.Blocks[k - 1][col].FallGroupTicks = Constants.TICKS_FOR_FALL;
                                state.Blocks[k - 1][col].groupId = state.Blocks[row][col].groupId;
                            }
                            if (state.Blocks[k - 1][col].State == BlockState.LockedForFall) {
                                state.FallBlocks[row][col].Row = k - 1;
                            }
                            if (state.Blocks[k - 1][col].State == BlockState.Falling) {
                                state.FallBlocks[row][col].Row = state.FallBlocks[k - 1][col].Row + 1;
                                break;
                            }
                        }
                    }
                    else {
                        state.Blocks[row][col].State = BlockState.Exist;
                        state.Blocks[row][col].groupId = 0;
                        state.Blocks[row][col].Tick = 0;
                    }
                }
            }
        }
        if (state.WaitForSwap) {
            state.SwapOverRide = true;
            if (state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].State == BlockState.Switch) {
                state.Blocks[state.SwitchLeftBlockRow][state.SwitchLeftBlockCol].TotalChain = chain;
            }
            else {
                state.Blocks[state.SwitchRightBlockRow][state.SwitchRightBlockCol].TotalChain = chain;
            }
        }
    }

    //Other
    private CreateSetupBlocks(state: LogicState): void {
        for (var i: number = 0; i < Constants.STARTING_ROWS; i++) {
            this.AddBlockRow(state, i);
        }
    }
    private RowChange(state: LogicState): void {
        this.MoveBlocksUpOneRow(state);
        this.AddBlockRow(state, 0);
        state.Selector.Row = state.Selector.Row + 1;
        state.SwitchLeftBlockRow++;
        state.SwitchRightBlockRow++;
    }
    private MoveBlocksUpOneRow(state: LogicState): void {
        for (var row: number = Constants.MAX_ROWS - 1; row >= 1; row--) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                state.Blocks[row][col].Color = state.Blocks[row - 1][col].Color;
                state.Blocks[row][col].State = state.Blocks[row - 1][col].State;
            }
        }
    }
    private AddBlockRow(state: LogicState, row: number): void {
        for (var col: number = 0; col < 6; col++) {
            var blockColor: BlockColor;
            do {
                blockColor = <BlockColor>(Math.floor(state.Random() * Math.floor(5)));
            }
            while (!this.IsNewBlockVaild(state, row, col, blockColor));
            state.Blocks[row][col].Color = blockColor;
            state.Blocks[row][col].State = BlockState.Exist;
            state.Blocks[row][col].groupId = 0;
            state.Blocks[row][col].Tick = 0;
            state.Blocks[row][col].FallGroupTicks = 0;
        }
    }

    //Condtional
    private CheckForGameOver(state: LogicState): void {
        for (var col: number = 0; col < Constants.MAX_COLS; col++) {
            if (state.Blocks[Constants.MAX_ROWS - 1][col].State == BlockState.Exist) {
                state.Active.Puzzle = false;
            }
        }
    }
    private IsNewBlockVaild(state: LogicState, blockRow: number, blockCol: number, blockColor: BlockColor): boolean {
        var foundValue: boolean = false;
        var i: number = 0;
        var rowSameColor: number = 0;
        i = 1;
        do {
            foundValue = false;
            if ((blockRow - i) >= 0 && state.Blocks[blockRow - i][blockCol].State == BlockState.Exist && state.Blocks[blockRow - i][blockCol].Color == blockColor) {
                rowSameColor++;
                foundValue = true;
            }
            i++;
        }
        while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockRow + i) <= (Constants.MAX_ROWS - 1) && state.Blocks[blockRow + i][blockCol].State == BlockState.Exist && state.Blocks[blockRow + i][blockCol].Color == blockColor) {
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
            if ((blockCol - i) >= 0 && state.Blocks[blockRow][blockCol - i].State == BlockState.Exist && state.Blocks[blockRow][blockCol - i].Color == blockColor) {
                colSameColor++;
                foundValue = true;
            }
            i++;
        }
        while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockCol + i) <= (Constants.MAX_COLS - 1) && state.Blocks[blockRow][blockCol + i].State == BlockState.Exist && state.Blocks[blockRow][blockCol + i].Color == blockColor) {
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
    private GetScore(state: LogicState, chain: number): void {
        this.ChainScore(state, chain);
        for (var i: number = 0; i < state.SetCount; i++) {
            this.TotalBlockScore(state, state.BlockSets[i]);
        }
    }
    private ChainScore(state: LogicState,chain: number): void {
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
        state.Score += addtionalScore;
    }
    private TotalBlockScore(state: LogicState,totalBlocks: number): void {
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
        state.Score += addtionalScore;
    }
}

export { Logic };