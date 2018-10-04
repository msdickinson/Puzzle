using System;
using System.Collections.Generic;
using System.Linq;

namespace Puzzle
{
    public enum SetType { Mixed, Row, Col };
    public enum BlockState { None, Exist, Hover, HoverSwap, Switch, SwitchNone, Remove, Falling, LockedForFall };
    public enum KeyState { Down, Up };
    public enum BlockColor { Green, Blue, Red, Purple, Yellow };

    public struct Block
    {
        public BlockColor Color;
        public BlockState State;
        public int TotalChain;
        public int Tick;
        public int FallGroupTicks;
        public int groupId;
    };
    public struct HoverBlocks
    {
        public int Row;
        public int Col;
    };
    public struct FallBlocks
    {
        public int Row;
        public int Col;
    };
    public struct RemovalInstance
    {
        int Chain;
        int Tick;
        int EndTick;
    };
    public struct Effect
    {
        int StartTick;
        int EndTick;
        int Row;
        int Col;
    };
    public struct Tick
    {
        public int Puzzle;
        public int MoveBlocksUp;
        public int Swap;
    };
    public struct Active
    {
        public bool Puzzle;
        public bool Hover;
        public bool Swap;
        public bool BlocksRemoving;
        public bool Falling;
    };
    public struct Selector
    {
        public int X;
        public int Y;
    };
    public struct Set
    {
        public int Row;
        public int Col;
        public int Count;
        public int NewSetIndex;
        public int Intersects;
        public SetType Type;
    };

    public static class Constants
    {
        public const int MAX_ROWS = 14;
        public const int MAX_COLS = 6;
        public const int STARTING_ROWS = 4;
        public const int TICKS_FOR_BLOCK_ROW_CHANGE = 50;
        public const int TICKS_FOR_SWAP = 2;
        public const int TICKS_FOR_REMOVING_BLOCKS = 10;
        public const int TICKS_FOR_HOVER = 5;
        public const int TICKS_FOR_HOVER_SWAP = 10;
    }

    public class Game
    {
        public Block[,] Blocks = new Block[Constants.MAX_ROWS, Constants.MAX_COLS];
        public HoverBlocks[,] HoverBlocks = new HoverBlocks[Constants.MAX_ROWS, Constants.MAX_COLS];
        public FallBlocks[,] FallBlocks = new FallBlocks[Constants.MAX_ROWS, Constants.MAX_COLS];
        public bool BlocksMoveFast = false;
        public bool GameOver;

        //Switch
        public int SwitchLeftBlockRow = 0;
        public int SwitchLeftBlockCol = 0;
        public int SwitchRightBlockRow = 0;
        public int SwitchRightBlockCol = 0;
        public bool SwapOverRide = false;
        public bool WaitForSwap = false;

        public float BlockInc = 0;
        public int Score = 0;
        public int Level = 1;
        public int Chain = 0;
        public int groupId = 1;

        public Selector Selector;
        public Active Active;
        public Tick Ticks;
        Random random = new Random();
        int SetCount = 0;
        public bool AutoLog = false;
        public List<LogItem> log = new List<LogItem>();
        Set[] Set = new Set[Constants.MAX_ROWS * Constants.MAX_COLS];

        int BlockSetsCount;
        int[] BlockSets = new int[Constants.MAX_ROWS * Constants.MAX_COLS];

        public Game(int? seed = null, bool autoLog = false)
        {
            AutoLog = autoLog;
            Reset(seed);
        }
        public void Tick()
        {
         //   if (AutoLog)
         //   {
        //        if (log.Count > 0 && (log.Last() is Ticks))
        //        {
        //            ((Ticks)log.Last()).Count++;
        //        }
        //        else
        //        {
        //            log.Add(new Ticks(1));
         //       }
         //   }

            if (Active.Puzzle)
            {
                Ticks.Puzzle++;
                if (Active.Falling)
                {
                    FallTick();
                }
                if (Active.Hover)
                {
                    HoverTick();
                }
                if (Active.BlocksRemoving)
                {
                    RemoveBlocksTick();
                }
                if (Active.Swap)
                {
                    SwapBlocksTick();
                }
                if (!Active.BlocksRemoving && !Active.Hover)
                {
                    MoveBlocksUpTick();
                }

                if (Ticks.Puzzle % (60 * 20) == 0)
                    Level++;

                UpdateActive();
            }
        }
        public void Reset(int? seed = null)
        {
            //Get Seed
            if (seed == null)
            {
                random = new Random();
                seed = random.Next();
            }
            random = new Random((int)seed);

            if (AutoLog)
            {
                log.Add(new Reset((int)seed));
            }

            GameOver = false;
            Active.Puzzle = true;
            Active.Hover = false;
            Active.Swap = false;
            Active.Falling = false;
            SwapOverRide = false;
            Ticks.Puzzle = 0;
            WaitForSwap = false;
            Ticks.MoveBlocksUp = 0;
            Ticks.Swap = 0;
            for (int i = 0; i < Constants.MAX_ROWS; i++)
            {
                for (int j = 0; j < Constants.MAX_COLS; j++)
                {
                    Blocks[i, j].State = BlockState.None;
                    Blocks[i, j].Color = BlockColor.Red;
                    Blocks[i, j].FallGroupTicks = 0;
                    Blocks[i, j].Tick = 0;
                }
            }

            for (int i = 0; i < Constants.MAX_ROWS * Constants.MAX_COLS; i++)
            {
                BlockSets[i] = 0;
            }

            Score = 0;
            Level = 5;
            groupId = 1;
            Selector.X = 2;
            Selector.Y = 3;
            CreateSetupBlocks();
        }
        public void RequestSwitch(int col, int row)
        {
            if (AutoLog)
            {
                log.Add(new RequestSwitch(row, col));
            }
            //0, 1, 2, 3, 4 are allowed to swap. 5 is not. as it always swaps to the right.
            if (!Active.Swap && col >= 0 && col < (Constants.MAX_COLS - 1) && row >= 0 && row < Constants.MAX_ROWS)
            {
                if (
                   (Blocks[row, col].State == BlockState.None || Blocks[row, col].State == BlockState.Exist) &&
                   (Blocks[row, col + 1].State == BlockState.None || Blocks[row, col + 1].State == BlockState.Exist) &&
                   (Blocks[row, col].State != BlockState.None || Blocks[row, col + 1].State != BlockState.None)
                )
                {
                    WaitForSwap = false;
                    Active.Swap = true;
                    SwitchLeftBlockRow = row;
                    SwitchLeftBlockCol = col;
                    SwitchRightBlockRow = row;
                    SwitchRightBlockCol = col + 1;

                    //Adjust Block States
                    if (Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].State == BlockState.Exist)
                    {
                        Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].State = BlockState.Switch;
                    }
                    else
                    {
                        Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].State = BlockState.SwitchNone;
                    }

                    if (Blocks[SwitchRightBlockRow, SwitchRightBlockCol].State == BlockState.Exist)
                    {
                        Blocks[SwitchRightBlockRow, SwitchRightBlockCol].State = BlockState.Switch;
                    }
                    else
                    {
                        Blocks[SwitchRightBlockRow, SwitchRightBlockCol].State = BlockState.SwitchNone;
                    }
                }

            }
        }
        public void UpdateActive()
        {
            Active.BlocksRemoving = false;
            Active.Falling = false;
            Active.Hover = false;

            for (int i = 0; i < Constants.MAX_ROWS; i++)
            {
                for (int j = 0; j < Constants.MAX_COLS; j++)
                {
                    if (Blocks[i, j].State == BlockState.Falling || Blocks[i, j].State == BlockState.LockedForFall)
                    {
                        Active.Falling = true;
                    }
                    else if (Blocks[i, j].State == BlockState.Hover || Blocks[i, j].State == BlockState.HoverSwap)
                    {
                        Active.Hover = true;
                    }
                    else if (Blocks[i, j].State == BlockState.Remove)
                    {
                        Active.BlocksRemoving = true;
                    }
                }
            }
        }

        //Tick
        private void HoverTick()
        {
            bool falling = false;
            for (int i = 0; i < Constants.MAX_ROWS; i++)
            {
                for (int j = 0; j < Constants.MAX_COLS; j++)
                {
                    if ((Blocks[i, j].State == BlockState.Hover || Blocks[i, j].State == BlockState.HoverSwap))
                    {
                        Blocks[i, j].Tick++;
                        if ((Blocks[i, j].State == BlockState.Hover && Blocks[i, j].Tick == Constants.TICKS_FOR_HOVER) ||
                           (Blocks[i, j].State == BlockState.HoverSwap && Blocks[i, j].Tick == Constants.TICKS_FOR_HOVER_SWAP))
                        {
                            Blocks[i, j].Tick = 0;
                            Blocks[i, j].State = BlockState.Falling;
                            Blocks[i, j].groupId = 0;
                            falling = true;
                        }
                    }
                }
            }
            if (falling)
            {
                CheckForFalling();
            }
        }
        private void FallTick()
        {
            bool BlocksFall = false;
            int largetChain = 0;
            for (int i = 0; i < Constants.MAX_ROWS; i++)
            {
                for (int j = 0; j < Constants.MAX_COLS; j++)
                {
                    if (Blocks[i, j].State == BlockState.Falling || Blocks[i, j].State == BlockState.LockedForFall)
                    {
                        Blocks[i, j].Tick++;

                        if (Blocks[i, j].Tick == Blocks[i, j].FallGroupTicks)
                        {
                            BlocksFall = true;
                            Blocks[i, j].Tick = 0;
                            Blocks[i, j].FallGroupTicks = 0;
                            Blocks[i, j].groupId = 0;
                            if (Blocks[i, j].State == BlockState.Falling)
                            {
                                Blocks[FallBlocks[i, j].Row, j].State = BlockState.Exist;
                                Blocks[FallBlocks[i, j].Row, j].Color = Blocks[i, j].Color;
                                Blocks[FallBlocks[i, j].Row, j].Tick = 0;
                                Blocks[FallBlocks[i, j].Row, j].groupId = 0;
                                if (Blocks[i, j].TotalChain > largetChain)
                                {
                                    largetChain = Blocks[i, j].TotalChain;
                                }
                                Blocks[i, j].TotalChain = 0;
                                Blocks[FallBlocks[i, j].Row, j].TotalChain = 0;

                            }
                            Blocks[i, j].State = BlockState.None;
                        }
                    }
                }
            }


            if (BlocksFall && !WaitForSwap)
            {
                CheckForSets(largetChain);
            }

        }
        private void MoveBlocksUpTick()
        {
            Ticks.MoveBlocksUp++;
            if (!BlocksMoveFast)
            {
                //Standard
                if (Level <= 10 && (Ticks.MoveBlocksUp % (int)Math.Round(96 - 7.3 * Level - 1)) == 0)
                {
                    BlockInc += 5;
                }
                //Hard
                if (Level > 10 && Level < 15 && (Ticks.MoveBlocksUp % (int)Math.Round(30.0 * Level - 10)) == 0)
                {
                    BlockInc += 5;
                }
                //Hard(Over time)
                if (Level >= 15 && (Ticks.MoveBlocksUp % (int)(30 - Math.Round(2.0 * Level - 15))) == 0)
                {
                    BlockInc += 5;
                }
                //Hard(Over time)
                if (Level >= 20 && Ticks.MoveBlocksUp % (60 * 20) == 0)
                {
                    BlockInc += 1;
                }
            }
            else
            {
                if (Ticks.MoveBlocksUp % 1 == 0 && BlockInc != 50)
                {
                    BlockInc += 2.5f;
                }
            }
            if (BlockInc == 50)
            {
                BlockInc = 0;
                Ticks.MoveBlocksUp = 0;
                RowChange();
                CheckForSets(0);
            }
        }
        private void SwapBlocksTick()
        {
            Ticks.Swap++;
            if (Ticks.Swap == Constants.TICKS_FOR_SWAP)
            {
                //Swap
                BlockState newRightState = Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].State;
                BlockColor newRightColor = Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].Color;

                Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].State = Blocks[SwitchRightBlockRow, SwitchRightBlockCol].State;
                Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].Color = Blocks[SwitchRightBlockRow, SwitchRightBlockCol].Color;

                Blocks[SwitchRightBlockRow, SwitchRightBlockCol].State = newRightState;
                Blocks[SwitchRightBlockRow, SwitchRightBlockCol].Color = newRightColor;

                //Adjust Block States
                if (Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].State == BlockState.Switch)
                {
                    Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].State = BlockState.Exist;
                }
                else
                {
                    Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].State = BlockState.None;
                }

                if (Blocks[SwitchRightBlockRow, SwitchRightBlockCol].State == BlockState.Switch)
                {
                    Blocks[SwitchRightBlockRow, SwitchRightBlockCol].State = BlockState.Exist;
                }
                else
                {
                    Blocks[SwitchRightBlockRow, SwitchRightBlockCol].State = BlockState.None;
                }

                Ticks.Swap = 0;
                Active.Swap = false;
                if (!SwapOverRide)
                {
                    CheckForSets(0);
                }

                if (Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].TotalChain >
                Blocks[SwitchRightBlockRow, SwitchRightBlockCol].TotalChain)
                {
                    CheckForHover(Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].TotalChain, !SwapOverRide);
                }
                else
                {
                    CheckForHover(Blocks[SwitchRightBlockRow, SwitchRightBlockCol].TotalChain, !SwapOverRide);
                }

            }
        }
        private void RemoveBlocksTick()
        {
            int totalChain = 0;
            for (int i = 0; i < Constants.MAX_ROWS; i++)
            {
                for (int j = 0; j < Constants.MAX_COLS; j++)
                {
                    if (Blocks[i, j].State == BlockState.Remove)
                    {
                        Blocks[i, j].Tick++;
                        if (Blocks[i, j].Tick == Constants.TICKS_FOR_REMOVING_BLOCKS)
                        {
                            if (totalChain < Blocks[i, j].TotalChain)
                            {
                                totalChain = Blocks[i, j].TotalChain;
                            }
                            Blocks[i, j].State = BlockState.None;
                            Blocks[i, j].TotalChain = 0;
                            Blocks[i, j].Tick = 0;
                        }
                    }
                }
            }

            UpdateActive();
            CheckForHover(totalChain, false);
        }

        //Check For
        private void CheckForSets(int chain)
        {
            chain++;
            int setCount = 0;
            int currentBlockRow = 0;
            int currentBlockCol = 0;
            SetCount = 0;
            //SetCombinedCount = 0;

            //Columns -> ROWS Found * COLS FOUND
            for (int i = 0; i < Constants.MAX_ROWS; i++)
            {
                currentBlockCol = 0;
                setCount = 1;
                for (int j = 1; j < Constants.MAX_COLS; j++)
                {
                    //If The Next Block Is the same color
                    if ((Blocks[i, currentBlockCol].State == BlockState.Exist && Blocks[i, currentBlockCol].groupId == 0) &&
                       (Blocks[i, j].State == BlockState.Exist && Blocks[i, j].groupId == 0) &&
                       Blocks[i, j].Color == Blocks[i, currentBlockCol].Color)
                    {
                        setCount++;
                    }
                    else
                    {
                        if (setCount >= 3)
                        {
                            for (int k = 0; k < setCount; k++)
                            {
                                Blocks[i, currentBlockCol + k].State = BlockState.Remove;
                                Blocks[i, currentBlockCol + k].TotalChain = chain;
                                Blocks[i, currentBlockCol + k].Tick = 0;
                                Blocks[i, currentBlockCol + k].Tick = 0;
                            }

                            Set[SetCount].Row = i;
                            Set[SetCount].Col = currentBlockCol;
                            Set[SetCount].Count = setCount;
                            Set[SetCount].NewSetIndex = -1;
                            Set[SetCount].Intersects = 0;
                            Set[SetCount].Type = SetType.Col;
                            SetCount++;
                        }

                        while (j != Constants.MAX_COLS - 1)
                        {
                            if (Blocks[i, j + 1].State == BlockState.Exist)
                            {
                                currentBlockCol = j;
                                setCount = 1;
                                break;
                            }
                            else
                            {
                                j++;
                            }
                        }
                    }
                }
                if (setCount >= 3)
                {
                    //Flag Blocks For Removal
                    for (int k = 0; k < setCount; k++)
                    {
                        Blocks[i, currentBlockCol + k].State = BlockState.Remove;
                        Blocks[i, currentBlockCol + k].TotalChain = chain;
                        Blocks[i, currentBlockCol + k].Tick = 0;
                    }

                    Set[SetCount].Row = i;
                    Set[SetCount].Col = currentBlockCol;
                    Set[SetCount].Count = setCount;
                    Set[SetCount].NewSetIndex = -1;
                    Set[SetCount].Intersects = 0;
                    Set[SetCount].Type = SetType.Col;
                    SetCount++;
                }
            }

            //Rows
            for (int i = 0; i < Constants.MAX_COLS; i++)
            {
                currentBlockRow = 0;
                setCount = 1;
                for (int j = 1; j < Constants.MAX_ROWS; j++)
                {
                    //If The Next Block Is the same color
                    if (
                       ((Blocks[currentBlockRow, i].State == BlockState.Exist || Blocks[currentBlockRow, i].State == BlockState.Remove) && Blocks[currentBlockRow, i].groupId == 0) &&
                       ((Blocks[j, i].State == BlockState.Exist || Blocks[j, i].State == BlockState.Remove) && Blocks[j, i].groupId == 0) &&
                       (Blocks[j, i].Color == Blocks[currentBlockRow, i].Color)
                    )
                    {
                        setCount++;
                    }
                    else
                    {
                        if (setCount >= 3)
                        {
                            //Flag Blocks For Removal
                            for (int k = 0; k < setCount; k++)
                            {
                                Blocks[currentBlockRow + k, i].State = BlockState.Remove;
                                Blocks[currentBlockRow + k, i].TotalChain = chain;
                                Blocks[currentBlockRow + k, i].Tick = 0;
                            }
                            Set[SetCount].Row = currentBlockRow;
                            Set[SetCount].Col = i;
                            Set[SetCount].Count = setCount;
                            Set[SetCount].NewSetIndex = -1;
                            Set[SetCount].Intersects = 0;
                            Set[SetCount].Type = SetType.Row;
                            SetCount++;
                        }

                        while (j != Constants.MAX_ROWS - 1)
                        {
                            if (Blocks[j + 1, i].State == BlockState.Exist)
                            {
                                currentBlockRow = j;
                                setCount = 1;
                                break;
                            }
                            else
                            {
                                j++;
                            }
                        }
                    }
                }
                if (setCount >= 3)
                {
                    //Flag Blocks For Removal
                    for (int k = 0; k < setCount; k++)
                    {
                        Blocks[currentBlockRow + k, i].State = BlockState.Remove;
                        Blocks[currentBlockRow + k, i].TotalChain = chain;
                        Blocks[currentBlockRow + k, i].Tick = 0;
                    }
                    Set[SetCount].Row = currentBlockRow;
                    Set[SetCount].Col = i;
                    Set[SetCount].Count = setCount;
                    Set[SetCount].NewSetIndex = -1;
                    Set[SetCount].Intersects = 0;
                    Set[SetCount].Type = SetType.Row;
                    SetCount++;
                }

            }
            //CombineSets 
            int NewSetIndex = 0;
            //[Flag Sets]


            BlockSetsCount = SetCount;
            for (int i = 0; i < SetCount; i++)
            {
                if (Set[i].NewSetIndex == -1)
                {
                    Set[i].NewSetIndex = NewSetIndex;
                    BlockSets[NewSetIndex] = 0;
                    NewSetIndex++;
                }

                for (int j = i; j < SetCount; j++)
                {
                    if (i == j || Set[j].NewSetIndex == Set[i].NewSetIndex)
                    {
                        continue;
                    }
                    if (Set[i].Type == SetType.Col &&
                       Set[j].Type == SetType.Row &&
                       Set[j].Row == Set[i].Row &&
                       Set[j].Col >= Set[i].Col &&
                       Set[j].Col <= (Set[i].Col + Set[i].Count))
                    {
                        Set[j].Intersects++;
                        Set[j].NewSetIndex = Set[i].NewSetIndex;
                        BlockSetsCount = BlockSetsCount - 1;
                    }

                    if (Set[j].Type == SetType.Col &&
                       Set[i].Type == SetType.Row &&
                       Set[j].Col >= Set[i].Col &&
                       Set[j].Col <= (Set[i].Col + Set[i].Count))
                    {
                        Set[i].Intersects++;
                        Set[i].NewSetIndex = Set[j].NewSetIndex;
                        BlockSetsCount = BlockSetsCount - 1;
                    }
                }
            }

            //Combine Flaged Sets
            for (int i = 0; i < SetCount; i++)
            {
                BlockSets[Set[i].NewSetIndex] += Set[i].Count - Set[i].Intersects;
            }

            if (SetCount > 0)
            {

                groupId++;
                for (int i = 0; i < Constants.MAX_ROWS; i++)
                {
                    for (int j = 0; j < Constants.MAX_COLS; j++)
                    {
                        if (Blocks[i, j].State == BlockState.Remove && Blocks[i, j].groupId == 0)
                        {
                            Blocks[i, j].groupId = groupId;
                        }
                    }
                }

                Active.BlocksRemoving = true;
                GetScore();
            }

        }
        private void CheckForHover(int chain, bool switchedBlocks)
        {
            bool oneHoverFound = false;
            for (int i = 1; i < Constants.MAX_ROWS; i++)
            {
                for (int j = 0; j < Constants.MAX_COLS; j++)
                {
                    if (Blocks[i, j].State == BlockState.Exist && Blocks[i, j].State != BlockState.Hover && Blocks[i, j].State != BlockState.HoverSwap)
                    {
                        if (Blocks[i - 1, j].State == BlockState.None || Blocks[i - 1, j].State == BlockState.Hover || Blocks[i - 1, j].State == BlockState.HoverSwap)
                        {
                            if (oneHoverFound == false)
                            {
                                groupId++;
                                oneHoverFound = true;
                            }

                            Blocks[i, j].groupId = groupId;
                            Blocks[i, j].Tick = 0;
                            Blocks[i, j].TotalChain = chain;
                            if (switchedBlocks)
                            {
                                Blocks[i, j].State = BlockState.HoverSwap;
                            }
                            else
                            {
                                Blocks[i, j].State = BlockState.Hover;
                            }

                            for (int k = i; k > 0; k--)
                            {
                                if (Blocks[k - 1, j].State == BlockState.None)
                                {
                                    HoverBlocks[i, j].Row = k - 1;
                                }
                                if (Blocks[k - 1, j].State == BlockState.Hover || Blocks[k - 1, j].State == BlockState.HoverSwap)
                                {
                                    HoverBlocks[i, j].Row = HoverBlocks[k - 1, j].Row + 1;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        private void CheckForFalling()
        {
            int chain = 0;
            for (int i = 1; i < Constants.MAX_ROWS; i++)
            {
                for (int j = 0; j < Constants.MAX_COLS; j++)
                {
                    if (Blocks[i, j].State == BlockState.Falling)
                    {
                        //Determine
                        if (Blocks[i - 1, j].State == BlockState.None || Blocks[i - 1, j].State == BlockState.Falling || Blocks[i - 1, j].State == BlockState.LockedForFall)
                        {
                            if (Blocks[i, j].TotalChain > chain)
                            {
                                chain = Blocks[i, j].TotalChain;
                            }
                            Blocks[i, j].FallGroupTicks = 3;

                            for (int k = i; k > 0; k--)
                            {
                                if (Active.Swap && k - 2 >= 0 &&
                                   Blocks[k - 1, j].State == BlockState.Switch || Blocks[k - 1, j].State == BlockState.SwitchNone &&
                                   Blocks[k - 2, j].State == BlockState.None)
                                {
                                    WaitForSwap = true;
                                }

                                if (Blocks[k - 1, j].State == BlockState.None)
                                {
                                    FallBlocks[i, j].Row = k - 1;
                                    Blocks[k - 1, j].State = BlockState.LockedForFall;
                                    Blocks[k - 1, j].FallGroupTicks = 3;
                                    Blocks[k - 1, j].groupId = Blocks[i, j].groupId;
                                }

                                if (Blocks[k - 1, j].State == BlockState.LockedForFall)
                                {
                                    FallBlocks[i, j].Row = k - 1;
                                }

                                if (Blocks[k - 1, j].State == BlockState.Falling)
                                {
                                    FallBlocks[i, j].Row = FallBlocks[k - 1, j].Row + 1;
                                    break;
                                }
                            }
                        }
                        else
                        {
                            Blocks[i, j].State = BlockState.Exist;
                            Blocks[i, j].groupId = 0;
                            Blocks[i, j].Tick = 0;
                        }
                    }
                }
            }

            if (WaitForSwap)
            {
                SwapOverRide = true;
                if (Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].State == BlockState.Switch)
                {
                    Blocks[SwitchLeftBlockRow, SwitchLeftBlockCol].TotalChain = chain;
                }
                else
                {
                    Blocks[SwitchRightBlockRow, SwitchRightBlockCol].TotalChain = chain;
                }
            }
            //Set All Blocks In Between To Locked For

        }
        private void CreateSetupBlocks()
        {
            for (int i = 0; i < Constants.STARTING_ROWS; i++)
            {
                AddBlockRow(i);
            }
        }
        void RowChange()
        {
            CheckForGameOver();
            MoveBlocksUpOneRow();
            AddBlockRow(0);
        }
        void MoveBlocksUpOneRow()
        {
            for (int i = Constants.MAX_ROWS - 1; i >= 1; i--)
            {
                for (int j = 0; j < Constants.MAX_COLS; j++)
                {
                    Blocks[i, j].Color = Blocks[i - 1, j].Color;
                    Blocks[i, j].State = Blocks[i - 1, j].State;
                }
            }
        }
        void AddBlockRow(int row)
        {
            for (int i = 0; i < 6; i++)
            {
                int col = i;
                BlockColor blockColor;
                do
                {
                    blockColor = (BlockColor)(random.Next(5));
                } while (!IsNewBlockVaild(row, col, blockColor));

                Blocks[row, col].Color = blockColor;
                Blocks[row, col].State = BlockState.Exist;
            }
        }

        //Condtional
        private void CheckForGameOver()
        {
            for (int j = 0; j < Constants.MAX_COLS; j++)
            {
                if (Blocks[Constants.MAX_ROWS - 1, j].State == BlockState.Exist)
                {
                    GameOver = true;
                }
            }
        }

        private bool IsNewBlockVaild(int blockRow, int blockCol, BlockColor blockColor)
        {
            bool foundValue = false;
            int i = 0;
            int rowSameColor = 1;

            //Down
            i = 1;
            do
            {
                foundValue = false;

                if ((blockRow - i) > 0 &&
                    Blocks[blockRow - i, blockCol].State == BlockState.Exist &&
                    Blocks[blockRow - i, blockCol].Color == blockColor)
                {
                    rowSameColor++;
                    foundValue = true;
                }
                i++;
            } while (foundValue);

            //Up
            i = 1;
            do
            {
                foundValue = false;

                if ((blockRow + i) < (Constants.MAX_ROWS - 2) &&
                    Blocks[blockRow + i, blockCol].State == BlockState.Exist &&
                    Blocks[blockRow + i, blockCol].Color == blockColor)
                {
                    rowSameColor++;
                    foundValue = true;
                }
                i++;
            } while (foundValue);


            if (rowSameColor >= 2)
            {
                return false;
            }


            int colSameColor = 0;
            //Left
            i = 1;
            do
            {
                foundValue = false;

                if ((blockCol - i) > 0 &&
                    Blocks[blockRow, blockCol - i].State == BlockState.Exist &&
                    Blocks[blockRow, blockCol - i].Color == blockColor)
                {
                    colSameColor++;
                    foundValue = true;
                }
                i++;
            } while (foundValue);

            //Right
            i = 1;
            do
            {
                foundValue = false;

                if ((blockCol + i) < (Constants.MAX_COLS - 2) &&
                    Blocks[blockRow, blockCol + i].State == BlockState.Exist &&
                    Blocks[blockRow, blockCol + i].Color == blockColor)
                {
                    colSameColor++;
                    foundValue = true;
                }
                i++;
            } while (foundValue);


            if (colSameColor >= 2)
            {
                return false;
            }
            return true;
        }

        //Score
        void GetScore()
        {
            ChainScore();
            for (int i = 0; BlockSetsCount < 0; i++)
            {
                TotalBlockScore(BlockSetsCount);
            }
        }
        void ChainScore()
        {
            int addtionalScore = 0;

            if (Chain == 2)
            {
                addtionalScore = 50;
            }
            if (Chain == 3)
            {
                addtionalScore = 130;
            }
            if (Chain == 4)
            {
                addtionalScore = 280;

            }
            if (Chain == 5)
            {
                addtionalScore = 580;
            }
            if (Chain == 6)
            {
                addtionalScore = 980;
            }
            if (Chain == 7)
            {
                addtionalScore = 1480;
            }
            if (Chain == 8)
            {
                addtionalScore = 2180;
            }
            if (Chain == 9)
            {
                addtionalScore = 3080;
            }
            if (Chain == 10)
            {
                addtionalScore = 4180;
            }
            if (Chain == 11)
            {
                addtionalScore = 5480;
            }
            if (Chain == 12)
            {
                addtionalScore = 6980;
            }
            if (Chain > 12)
            {
                addtionalScore = 6980 + ((Chain - 12) * 1800);
            }

            Score += addtionalScore;

        }
        void TotalBlockScore(int totalBlocks)
        {
            int addtionalScore = 0;

            if (totalBlocks == 3)
            {
                addtionalScore = 30;
            }
            if (totalBlocks == 4)
            {
                addtionalScore = 70;
            }
            if (totalBlocks == 5)
            {
                addtionalScore = 100;
            }
            if (totalBlocks == 6)
            {
                addtionalScore = 210;
            }
            if (totalBlocks == 7)
            {
                addtionalScore = 260;
            }
            if (totalBlocks == 8)
            {
                addtionalScore = 310;
            }
            if (totalBlocks == 9)
            {
                addtionalScore = 360;
            }
            if (totalBlocks == 10)
            {
                addtionalScore = 410;
            }
            if (totalBlocks == 11)
            {
                addtionalScore = 510;
            }
            if (totalBlocks == 12)
            {
                addtionalScore = 570;
            }
            if (totalBlocks == 13)
            {
                addtionalScore = 630;
            }
            if (totalBlocks == 14)
            {
                addtionalScore = 690;
            }
            if (totalBlocks == 15)
            {
                addtionalScore = 850;
            }
            if (totalBlocks == 16)
            {
                addtionalScore = 920;
            }
            if (totalBlocks == 17)
            {
                addtionalScore = 1020;
            }
            if (totalBlocks == 18)
            {
                addtionalScore = 1150;
            }
            if (totalBlocks == 19)
            {
                addtionalScore = 1310;
            }
            if (totalBlocks == 20)
            {
                addtionalScore = 1500;
            }
            if (totalBlocks == 21)
            {
                addtionalScore = 1720;
            }
            if (totalBlocks == 22)
            {
                addtionalScore = 1970;
            }
            if (totalBlocks == 23)
            {
                addtionalScore = 2250;
            }
            if (totalBlocks == 24)
            {
                addtionalScore = 2560;
            }
            if (totalBlocks == 25)
            {
                addtionalScore = 2900;
            }
            if (totalBlocks == 26)
            {
                addtionalScore = 3270;
            }
            if (totalBlocks == 27)
            {
                addtionalScore = 3670;
            }
            if (totalBlocks == 28)
            {
                addtionalScore = 4100;
            }
            if (totalBlocks == 29)
            {
                addtionalScore = 4560;
            }
            if (totalBlocks == 30)
            {
                addtionalScore = 5050;
            }
            if (totalBlocks == 31)
            {
                addtionalScore = 5570;
            }
            if (totalBlocks == 32)
            {
                addtionalScore = 15320;
            }
            if (totalBlocks == 33)
            {
                addtionalScore = 15900;
            }
            if (totalBlocks == 34)
            {
                addtionalScore = 16510;
            }
            if (totalBlocks == 35)
            {
                addtionalScore = 17150;
            }
            if (totalBlocks == 36)
            {
                addtionalScore = 17820;
            }
            if (totalBlocks == 37)
            {
                addtionalScore = 18520;
            }
            if (totalBlocks == 38)
            {
                addtionalScore = 19250;
            }
            if (totalBlocks == 39)
            {
                addtionalScore = 20010;
            }
            if (totalBlocks == 40)
            {
                addtionalScore = 20800;
            }
            if (totalBlocks > 40)
            {
                addtionalScore = 20400 + ((totalBlocks - 40) * 800) + (totalBlocks * 10);
            }
            Score += addtionalScore;
        }
    }

}
