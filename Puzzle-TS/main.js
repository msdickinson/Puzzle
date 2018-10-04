"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
})(BlockColor || (BlockColor = {}));
class Block {
}
class HoverBlocks {
}
class FallBlocks {
}
class RemovalInstance {
}
class Effect {
}
class Tick {
}
class Active {
}
class Selector {
}
class Set {
}
class Constants {
}
Constants.MAX_ROWS = 14;
Constants.MAX_COLS = 6;
Constants.STARTING_ROWS = 4;
Constants.TICKS_FOR_BLOCK_ROW_CHANGE = 50;
Constants.TICKS_FOR_SWAP = 2;
Constants.TICKS_FOR_REMOVING_BLOCKS = 10;
Constants.TICKS_FOR_HOVER = 5;
Constants.TICKS_FOR_HOVER_SWAP = 10;
class Game {
    constructor() {
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
        this.Reset();
    }
    //|Public|
    Reset() {
        this.GameOver = false;
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
                this.Blocks[row][col] = new Block();
                this.HoverBlocks[row][col] = new HoverBlocks();
                this.FallBlocks[row][col] = new FallBlocks();
            }
        }
        for (var i = 0; i < Constants.MAX_ROWS * Constants.MAX_COLS; i++) {
            this.BlockSets[i] = 0;
        }
        this.Score = 0;
        this.Level = 5;
        this.groupId = 1;
        this.Selector.X = 2;
        this.Selector.Y = 3;
        this.CreateSetupBlocks();
    }
    Tick() {
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
    RequestSwitch(col, row) {
        if (!this.Active.Swap && col >= 0 && col < (Constants.MAX_COLS - 1) && row >= 0 && row < Constants.MAX_ROWS) {
            if ((this.Blocks[row][col].State == BlockState.None || this.Blocks[row][col].State == BlockState.Exist) && (this.Blocks[row][col + 1].State == BlockState.None || this.Blocks[row][col + 1].State == BlockState.Exist) && (this.Blocks[row][col].State != BlockState.None || this.Blocks[row][col + 1].State != BlockState.None)) {
                this.WaitForSwap = false;
                this.Active.Swap = true;
                this.SwitchLeftBlockRow = row;
                this.SwitchLeftBlockCol = col;
                this.SwitchRightBlockRow = row;
                this.SwitchRightBlockCol = col + 1;
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
            if (this.Level <= 10 && (this.Ticks.MoveBlocksUp % Math.round(96 - 7.3 * this.Level - 1)) == 0) {
                this.BlockInc += 5;
            }
            if (this.Level > 10 && this.Level < 15 && (this.Ticks.MoveBlocksUp % Math.round(30.0 * this.Level - 10)) == 0) {
                this.BlockInc += 5;
            }
            if (this.Level >= 15 && (this.Ticks.MoveBlocksUp % (30 - Math.round(2.0 * this.Level - 15))) == 0) {
                this.BlockInc += 5;
            }
            if (this.Level >= 20 && this.Ticks.MoveBlocksUp % (60 * 20) == 0) {
                this.BlockInc += 1;
            }
        }
        else {
            if (this.Ticks.MoveBlocksUp % 1 == 0 && this.BlockInc != 50) {
                this.BlockInc += 2.5;
            }
        }
        if (this.BlockInc == 50) {
            this.BlockInc = 0;
            this.Ticks.MoveBlocksUp = 0;
            this.RowChange();
            this.CheckForSets(0);
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
        for (var row = 0; row < Constants.MAX_ROWS; row++) {
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
            currentBlockRow = 0;
            setCount = 1;
            for (var row = 1; row < Constants.MAX_ROWS; row++) {
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
        var NewSetIndex = 0;
        this.BlockSetsCount = this.SetCount;
        for (var i = 0; i < this.SetCount; i++) {
            if (this.Set[i].NewSetIndex == -1) {
                this.Set[i].NewSetIndex = NewSetIndex;
                this.BlockSets[NewSetIndex] = 0;
                NewSetIndex++;
            }
            for (var j = i; j < this.SetCount; j++) {
                if (i == j || Set[j].NewSetIndex == Set[i].NewSetIndex) {
                    continue;
                }
                if (Set[i].Type == SetType.Col && Set[j].Type == SetType.Row && Set[j].Row == Set[i].Row && Set[j].Col >= Set[i].Col && Set[j].Col <= (Set[i].Col + Set[i].Count)) {
                    Set[j].Intersects++;
                    Set[j].NewSetIndex = Set[i].NewSetIndex;
                    this.BlockSetsCount = this.BlockSetsCount - 1;
                }
                if (Set[j].Type == SetType.Col && Set[i].Type == SetType.Row && Set[j].Col >= Set[i].Col && Set[j].Col <= (Set[i].Col + Set[i].Count)) {
                    Set[i].Intersects++;
                    Set[i].NewSetIndex = Set[j].NewSetIndex;
                    this.BlockSetsCount = this.BlockSetsCount - 1;
                }
            }
        }
        for (var i = 0; i < this.SetCount; i++) {
            this.BlockSets[Set[i].NewSetIndex] += Set[i].Count - Set[i].Intersects;
        }
        if (this.SetCount > 0) {
            this.groupId++;
            for (var row = 0; row < Constants.MAX_ROWS; row++) {
                for (var col = 0; col < Constants.MAX_COLS; col++) {
                    if (this.Blocks[row][col].State == BlockState.Remove && this.Blocks[row][col].groupId == 0) {
                        this.Blocks[row][col].groupId = this.groupId;
                    }
                }
            }
            this.Active.BlocksRemoving = true;
            this.GetScore();
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
                        this.Blocks[row][col].FallGroupTicks = 3;
                        for (var k = row; k > 0; k--) {
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
                                this.FallBlocks[row][col].Row = FallBlocks[k - 1][col].Row + 1;
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
        this.CheckForGameOver();
        this.MoveBlocksUpOneRow();
        this.AddBlockRow(0);
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
                blockColor = (Math.floor(Math.random() * Math.floor(5)));
            } while (!this.IsNewBlockVaild(row, col, blockColor));
            this.Blocks[row][col].Color = blockColor;
            this.Blocks[row][col].State = BlockState.Exist;
        }
    }
    //Condtional
    CheckForGameOver() {
        for (var col = 0; col < Constants.MAX_COLS; col++) {
            if (this.Blocks[Constants.MAX_ROWS - 1][col].State == BlockState.Exist) {
                this.GameOver = true;
            }
        }
    }
    IsNewBlockVaild(blockRow, blockCol, blockColor) {
        var foundValue = false;
        var i = 0;
        var rowSameColor = 1;
        i = 1;
        do {
            foundValue = false;
            if ((blockRow - i) > 0 && this.Blocks[blockRow - i][blockCol].State == BlockState.Exist && this.Blocks[blockRow - i][blockCol].Color == blockColor) {
                rowSameColor++;
                foundValue = true;
            }
            i++;
        } while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockRow + i) < (Constants.MAX_ROWS - 2) && this.Blocks[blockRow + i][blockCol].State == BlockState.Exist && this.Blocks[blockRow + i][blockCol].Color == blockColor) {
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
            if ((blockCol - i) > 0 && this.Blocks[blockRow][blockCol - i].State == BlockState.Exist && this.Blocks[blockRow][blockCol - i].Color == blockColor) {
                colSameColor++;
                foundValue = true;
            }
            i++;
        } while (foundValue);
        i = 1;
        do {
            foundValue = false;
            if ((blockCol + i) < (Constants.MAX_COLS - 2) && this.Blocks[blockRow][blockCol + i].State == BlockState.Exist && this.Blocks[blockRow][blockCol + i].Color == blockColor) {
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
    GetScore() {
        this.ChainScore();
        for (var i = 0; this.BlockSetsCount < 0; i++) {
            this.TotalBlockScore(this.BlockSetsCount);
        }
    }
    ChainScore() {
        var addtionalScore = 0;
        this.Chain;
        if (this.Chain == 2) {
            addtionalScore = 50;
        }
        if (this.Chain == 3) {
            addtionalScore = 130;
        }
        if (this.Chain == 4) {
            addtionalScore = 280;
        }
        if (this.Chain == 5) {
            addtionalScore = 580;
        }
        if (this.Chain == 6) {
            addtionalScore = 980;
        }
        if (this.Chain == 7) {
            addtionalScore = 1480;
        }
        if (this.Chain == 8) {
            addtionalScore = 2180;
        }
        if (this.Chain == 9) {
            addtionalScore = 3080;
        }
        if (this.Chain == 10) {
            addtionalScore = 4180;
        }
        if (this.Chain == 11) {
            addtionalScore = 5480;
        }
        if (this.Chain == 12) {
            addtionalScore = 6980;
        }
        if (this.Chain > 12) {
            addtionalScore = 6980 + ((this.Chain - 12) * 1800);
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
exports.Game = Game;
//# sourceMappingURL=main.js.map