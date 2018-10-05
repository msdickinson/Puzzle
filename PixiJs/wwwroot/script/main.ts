﻿enum SetType {
    Mixed,
    Row,
    Col
}
enum BlockState {
    None,
    Exist,
    Hover,
    HoverSwap,
    Switch,
    SwitchNone,
    Remove,
    Falling,
    LockedForFall
}
enum KeyState {
    Down,
    Up
}
enum BlockColor {
    Green,
    Blue,
    Red,
    Purple,
    Yellow,
    Brown
}
class SoundRequests {
    public Swap: boolean = false;
    public Remove: boolean = false;
    public Fall: boolean = false;
    public Hover: boolean = false;
    public MusicOn: boolean = false;
    public MusicOff: boolean = false;
    public Combo: boolean = false;
    public LargeCombo: boolean = false;
    public MegaCombo: boolean = false;   
}
class Block {
    public Color: BlockColor = BlockColor.Brown;
    public State: BlockState = BlockState.None;
    public TotalChain: number = 0;
    public Tick: number = 0;
    public FallGroupTicks: number = 0;
    public groupId: number = 0;
}
class HoverBlocks {
    public Row: number = 0;
    public Col: number = 0;
}
class FallBlocks {
    public Row: number = 0;
    public Col: number = 0;
}
class RemovalInstance {
    Chain: number = 0;
    Tick: number = 0;
    EndTick: number = 0;
}
class Effect {
    StartTick: number = 0;
    EndTick: number = 0;
    Row: number = 0;
    Col: number = 0;
}
class Tick {
    public Puzzle: number = 0;
    public MoveBlocksUp: number = 0;
    public Swap: number = 0;
}
class Active {
    public Puzzle: boolean = false;
    public Hover: boolean = false;
    public Swap: boolean = false;
    public BlocksRemoving: boolean = false;
    public Falling: boolean = false;
}
class Selector {
    public Row: number = 0;
    public Col: number = 0;
}
class Set {
    public Row: number = 0;
    public Col: number = 0;
    public Count: number = 0;
    public NewSetIndex: number = 0;
    public Intersects: number = 0;
    public Type: SetType = SetType.Col;
}
class Constants {
    public static MAX_ROWS: number = 12;
    public static MAX_COLS: number = 6;
    public static STARTING_ROWS: number = 8;
    public static TICKS_FOR_SWAP: number = 2;
    public static TICKS_FOR_REMOVING_BLOCKS: number = 10;
    public static TICKS_FOR_HOVER: number = 5;
    public static TICKS_FOR_HOVER_SWAP: number = 10;
}

class Game {
    public SoundRequests: SoundRequests;
    public Blocks: Block[][] = [];
    HoverBlocks: HoverBlocks[][] = [];
    FallBlocks: FallBlocks[][] = [];
    BlocksMoveFast: boolean = false;

    //Switch
    SwitchLeftBlockRow: number = 0;
    SwitchLeftBlockCol: number = 0;
    SwitchRightBlockRow: number = 0;
    SwitchRightBlockCol: number = 0;
    SwapOverRide: boolean = false;
    WaitForSwap: boolean = false;

    BlockInc: number = 0;
    public Score: number = 0;
    Level: number = 1;
    Chain: number = 0;
    groupId: number = 1;

    public Selector: Selector = new Selector();
    public Active: Active = new Active();
    Ticks: Tick = new Tick();
    SetCount: number = 0;
    Set: Set[] = [];

    BlockSetsCount: number;
    BlockSets: number[] = [];

    constructor() {
        this.Reset();
    }

    //|Public|
    public Reset(): void {
        this.SoundRequests = new SoundRequests();
        this.Active.Puzzle = true;
        this.Active.Hover = false;
        this.Active.Swap = false;
        this.Active.Falling = false;
        this.SwapOverRide = false;
        this.Ticks.Puzzle = 0;
        this.WaitForSwap = false;
        this.Ticks.MoveBlocksUp = 0;
        this.Ticks.Swap = 0;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            this.Blocks[row] = [];
            this.HoverBlocks[row] = [];
            this.FallBlocks[row] = [];
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                const block = new Block();
                block.State = BlockState.None;
                block.Color = BlockColor.Red;
                block.FallGroupTicks = 0;
                block.Tick = 0;
                block.groupId = 0;
                this.Blocks[row][col] = new Block();
                this.HoverBlocks[row][col] = new HoverBlocks();
                this.FallBlocks[row][col] = new FallBlocks();
            }
        }
        for (var i: number = 0; i < Constants.MAX_ROWS * Constants.MAX_COLS; i++) {
            this.BlockSets[i] = 0;
            this.Set[i] = new Set();
        }
        this.Score = 0;
        this.Level = 1;
        this.groupId = 1;
        this.Selector.Row = 2;
        this.Selector.Col = 2;
        this.CreateSetupBlocks();
    }
    public Tick(): void {
        if (this.Active.Puzzle) {
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
    public RequestMoveSelector(row: number, col: number): void  {
        if (col >= 0 && col < (Constants.MAX_COLS - 1) && row >= 1 && row < Constants.MAX_ROWS) {
            this.Selector.Row = row;
            this.Selector.Col = col;
        }
    }
    public RequestSwitch(): void {
        if (!this.Active.Swap) {
            if ((this.Blocks[this.Selector.Row][this.Selector.Col].State == BlockState.None || this.Blocks[this.Selector.Row][this.Selector.Col].State == BlockState.Exist) && (this.Blocks[this.Selector.Row][this.Selector.Col + 1].State == BlockState.None || this.Blocks[this.Selector.Row][this.Selector.Col + 1].State == BlockState.Exist) && (this.Blocks[this.Selector.Row][this.Selector.Col].State != BlockState.None || this.Blocks[this.Selector.Row][this.Selector.Col + 1].State != BlockState.None)) {
                this.SoundRequests.Swap = true;
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
    public UpdateActive(): void {
        this.Active.BlocksRemoving = false;
        this.Active.Falling = false;
        this.Active.Hover = false;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
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
    private HoverTick(): void {
        var falling: boolean = false;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
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
    private FallTick(): void {
        var blocksFall: boolean = false;
        var largetChain: number = 0;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                this.SoundRequests.Fall = true;
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
    private MoveBlocksUpTick(): void {
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
    private SwapBlocksTick(): void {
        this.Ticks.Swap++;
        if (this.Ticks.Swap == Constants.TICKS_FOR_SWAP) {
            var newRightState: BlockState = this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].State;
            var newRightColor: BlockColor = this.Blocks[this.SwitchLeftBlockRow][this.SwitchLeftBlockCol].Color;
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
    private RemoveBlocksTick(): void {
        var totalChain: number = 0;
        for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
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
    private CheckForSets(chain: number): void {
        chain++;
        var setCount: number = 0;
        var currentBlockRow: number = 0;
        var currentBlockCol: number = 0;
        this.SetCount = 0;
        for (var row: number = 1; row < Constants.MAX_ROWS; row++) {
            currentBlockCol = 0;
            setCount = 1;
            for (var col: number = 1; col < Constants.MAX_COLS; col++) {
                if ((this.Blocks[row][currentBlockCol].State == BlockState.Exist && this.Blocks[row][currentBlockCol].groupId == 0) &&
                    (this.Blocks[row][col].State == BlockState.Exist && this.Blocks[row][col].groupId == 0) &&
                    this.Blocks[row][col].Color == this.Blocks[row][currentBlockCol].Color) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k: number = 0; k < setCount; k++) {
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
                for (var k: number = 0; k < setCount; k++) {
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
        for (var col: number = 0; col < Constants.MAX_COLS; col++) {
            currentBlockRow = 1;
            setCount = 1;
            for (var row: number = 2; row < Constants.MAX_ROWS; row++) {
                if (((this.Blocks[currentBlockRow][col].State == BlockState.Exist || this.Blocks[currentBlockRow][col].State == BlockState.Remove) && this.Blocks[currentBlockRow][col].groupId == 0) && ((this.Blocks[row][col].State == BlockState.Exist || this.Blocks[row][col].State == BlockState.Remove) && this.Blocks[row][col].groupId == 0) && (this.Blocks[row][col].Color == this.Blocks[currentBlockRow][col].Color)) {
                    setCount++;
                }
                else {
                    if (setCount >= 3) {
                        for (var k: number = 0; k < setCount; k++) {
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
                for (var k: number = 0; k < setCount; k++) {
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
        for (var i: number = 0; i < this.SetCount; i++) {
            
        }

        var NewSetIndex: number = 0;
        this.BlockSetsCount = this.SetCount;
        for (var i: number = 0; i < this.SetCount; i++) {
            if (this.Set[i].NewSetIndex == -1) {
                this.Set[i].NewSetIndex = NewSetIndex;
                this.BlockSets[NewSetIndex] = 0;
                NewSetIndex++;
            }
            for (var j: number = i; j < this.SetCount; j++) {
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
        for (var i: number = 0; i < this.SetCount; i++) {
            this.BlockSets[this.Set[i].NewSetIndex] += this.Set[i].Count - this.Set[i].Intersects;
        }
        if (this.SetCount > 0) {
            this.SoundRequests.Remove = true;
            this.groupId++;
            for (var row: number = 0; row < Constants.MAX_ROWS; row++) {
                for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                    if (this.Blocks[row][col].State == BlockState.Remove && this.Blocks[row][col].groupId == 0) {
                        this.Blocks[row][col].groupId = this.groupId;
                    }
                }
            }
            this.Active.BlocksRemoving = true;
            this.GetScore(chain);
        }
    }
    private CheckForHover(chain: number, switchedBlocks: boolean): void {
        var oneHoverFound: boolean = false;
        for (var row: number = 1; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
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
                        for (var k: number = row; k > 0; k--) {
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
    private CheckForFalling(): void {
        var chain: number = 0;
        for (var row: number = 1; row < Constants.MAX_ROWS; row++) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                if (this.Blocks[row][col].State == BlockState.Falling) {
                    if (this.Blocks[row - 1][col].State == BlockState.None || this.Blocks[row - 1][col].State == BlockState.Falling || this.Blocks[row - 1][col].State == BlockState.LockedForFall) {
                        if (this.Blocks[row][col].TotalChain > chain) {
                            chain = this.Blocks[row][col].TotalChain;
                        }
                        this.Blocks[row][col].FallGroupTicks = 3;
                        for (var k: number = row; k > 0; k--) {
                            if (this.Active.Swap && k - 2 >= 0 && this.Blocks[k - 1][col].State == BlockState.Switch || this.Blocks[k - 1][col].State == BlockState.SwitchNone && this.Blocks[k - 2][col].State == BlockState.None) {
                                this.WaitForSwap = true;
                            }
                            if (this.Blocks[k - 1][col].State == BlockState.None) {
                                this.FallBlocks[row][col].Row = k - 1;
                                this.Blocks[k - 1][col].State = BlockState.LockedForFall;
                                this.Blocks[k - 1][col].FallGroupTicks = 3;
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
    private CreateSetupBlocks(): void {
        for (var i: number = 0; i < Constants.STARTING_ROWS; i++) {
            this.AddBlockRow(i);
        }
    }
    private RowChange(): void {
        this.MoveBlocksUpOneRow();
        this.AddBlockRow(0);
    }
    private MoveBlocksUpOneRow(): void {
        for (var row: number = Constants.MAX_ROWS - 1; row >= 1; row--) {
            for (var col: number = 0; col < Constants.MAX_COLS; col++) {
                this.Blocks[row][col].Color = this.Blocks[row - 1][col].Color;
                this.Blocks[row][col].State = this.Blocks[row - 1][col].State;
            }
        }
    }
    private AddBlockRow(row: number): void {
        for (var col: number = 0; col < 6; col++) {
            var blockColor: BlockColor;
            do {
                blockColor = <BlockColor>(Math.floor(Math.random() * Math.floor(5)));
            }
            while (!this.IsNewBlockVaild(row, col, blockColor));
            this.Blocks[row][col].Color = blockColor;
            this.Blocks[row][col].State = BlockState.Exist;
            this.Blocks[row][col].groupId = 0;
            this.Blocks[row][col].Tick = 0;
            this.Blocks[row][col].FallGroupTicks = 0;
        }
    }

    //Condtional
    private CheckForGameOver(): void {
        for (var col: number = 0; col < Constants.MAX_COLS; col++) {
            if (this.Blocks[Constants.MAX_ROWS - 1][col].State == BlockState.Exist) {
                this.Active.Puzzle = false;
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
            if ((blockRow - i) >= 0 && this.Blocks[blockRow - i][blockCol].State == BlockState.Exist && this.Blocks[blockRow - i][blockCol].Color == blockColor) {
                rowSameColor++;
                foundValue = true;
            }
            i++;
        }
        while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockRow + i) <= (Constants.MAX_ROWS - 1) && this.Blocks[blockRow + i][blockCol].State == BlockState.Exist && this.Blocks[blockRow + i][blockCol].Color == blockColor) {
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
            if ((blockCol - i) >= 0 && this.Blocks[blockRow][blockCol - i].State == BlockState.Exist && this.Blocks[blockRow][blockCol - i].Color == blockColor) {
                colSameColor++;
                foundValue = true;
            }
            i++;
        }
        while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockCol + i) <= (Constants.MAX_COLS - 1) && this.Blocks[blockRow][blockCol + i].State == BlockState.Exist && this.Blocks[blockRow][blockCol + i].Color == blockColor) {
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
        for (var i: number = 0; i < this.SetCount; i++) {
            this.TotalBlockScore(this.BlockSets[i]);
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
        this.Score += addtionalScore;
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
        this.Score += addtionalScore;
    }
}
class View {
    readonly app: PIXI.Application;
    private texture = null;//var bunny = PIXI.Sprite.fromImage('required/assets/basics/bunny.png');
    private textures = null;
    private layoutSprite: PIXI.Sprite;
    private blocksSprite: PIXI.Sprite[][] = [];
    private selectorSprite: PIXI.Sprite;
    private BlocksContainer: PIXI.Container;
    private resolve: Function;
    private level: PIXI.Text;
    private score: PIXI.Text;
    constructor(document: Document, resolve: Function) {
        this.app = new PIXI.Application(306, 709, { backgroundColor: 0x1099bb });

        document.body.appendChild(this.app.view);        this.resolve = resolve;        this.LoadContent();    }
    private LoadContent() {
        PIXI.loader
            .add("/images/textures.json")
            .load(                this.CreateSprites.bind(this)            );    }
    private CreateSprites() {
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


        this.textures = PIXI.loader.resources["/images/textures.json"].spritesheet.textures;

        //Layout
        this.layoutSprite = new PIXI.Sprite(this.textures["Layout.png"]);

        //Selector
        this.selectorSprite = new PIXI.Sprite(this.textures["Selector.png"]);

        //Blocks
        this.BlocksContainer = new PIXI.Container();
        this.BlocksContainer.x = 0;
        this.BlocksContainer.y = 0;
        var thing = new PIXI.Graphics();
        this.app.stage.addChild(thing);
        thing.x = 0;
        thing.y = 0;
        thing.lineStyle(0);
        thing.beginFill(0x8bc5ff, 0.4);
        thing.moveTo(3, 0);
        thing.lineTo(3, (Constants.MAX_ROWS - 1) * 50 + 106);
        thing.lineTo(Constants.MAX_COLS * 50 + 3, (Constants.MAX_ROWS - 1) * 50 + 106);
        thing.lineTo(Constants.MAX_COLS * 50 + 3, 0);
        this.BlocksContainer.mask = thing;


        for (let row = 0; row < Constants.MAX_ROWS; row++) {
            this.blocksSprite[row] = [];
            for (let col = 0; col < Constants.MAX_COLS; col++) {
                this.blocksSprite[row][col] = new PIXI.Sprite(this.textures["BlockBrown.png"]);
                this.blocksSprite[row][col].x = (col) * 50 + 3;
                this.blocksSprite[row][col].y = ((Constants.MAX_ROWS - 1) - row) * 50 + 106;
                this.blocksSprite[row][col].visible = false;
                this.BlocksContainer.addChild(this.blocksSprite[row][col]);
            }
        }
        this.BlocksContainer.addChild(this.selectorSprite);

        //Order Of Sprite (z)
        this.app.stage.addChild(this.layoutSprite);
        this.app.stage.addChild(this.BlocksContainer);
        this.app.stage.addChild(this.level);
        this.app.stage.addChild(this.score);
        this.resolve("Loaded");
    }
    private UpdateBlockContainerState(y: number) {
        this.BlocksContainer.y = -y;
    }
    private UpdateBlockStates(Blocks : Block[]) {
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
    private UpdateSelector(selector: Selector) {
        this.selectorSprite.x = ( selector.Col) * 50 + 3;
        this.selectorSprite.y = ((Constants.MAX_ROWS - 1) - selector.Row ) * 50 + 106;
    }
    private UpdateLevel(level: number) {
        this.level.text = String(level);
    }
    private UpdateScore(score: number) {
        this.score.text = String(score);
    }
}
class Sounds {
    private swapSound = null;
    private fallSound = null;
    private removeSound = null;
    constructor() {
        this.swapSound = new Howl({
            src: ['/sound/swap.mp3']
        });        this.fallSound = new Howl({
            src: ['/sound/swap.mp3']
        });        this.removeSound = new Howl({
            src: ['/sound/swap.mp3']
        });    }
    private RunSoundRequests(soundRequests: SoundRequests) {
        if (soundRequests.Swap) {
            this.swapSound.play();
            soundRequests.Swap = false;
        }
        if (soundRequests.Fall) {
            //this.fallSound.play();
            soundRequests.Fall = false;
        }
        if (soundRequests.Remove) {
            //this.removeSound.play();
            soundRequests.Remove = false;
        }
    }
}

export { Sounds, View, Game };