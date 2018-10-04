using Puzzle;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WPF
{
    class DebugText
    {
        Game game;

        public DebugText(Game game)
        {
            this.game = game;
        }

        int[] fallGroups = new int[50];
        int[] chainGroups = new int[50];
        bool[] hoverSwapGroup = new bool[50];
        int[] tick = new int[50];
        int[] chain = new int[50];
        int[] groupCount = new int[50];
        int[] fallGroupTick = new int[50];
        int[] groupId = new int[50];
        int groupIndex = 0;
        bool groupExist = false;

        public string Hover()
        {
            if (game.Active.Hover)
            {
                int groupIndex = 0;
                for (int row = 0; row < Constants.MAX_ROWS; row++)
                {
                    for (int col = 0; col < Constants.MAX_COLS; col++)
                    {
                        if (game.Blocks[row, col].State == BlockState.Hover || game.Blocks[row, col].State == BlockState.HoverSwap)
                        {
                            groupExist = false;
                            for (int i = 0; i < groupIndex; i++)
                            {
                                if (game.Blocks[row, col].groupId == groupId[i])
                                {
                                    if (chain[i] < game.Blocks[row, col].TotalChain)
                                    {
                                        chain[i] = game.Blocks[row, col].TotalChain;
                                    }
                                    groupCount[i]++;
                                    groupExist = true;
                                    break;
                                }
                            }
                            if (!groupExist)
                            {
                                hoverSwapGroup[groupIndex] = (game.Blocks[row, col].State == BlockState.HoverSwap);
                                groupCount[groupIndex] = 1;
                                groupId[groupIndex] = game.Blocks[row, col].groupId;
                                tick[groupIndex] = game.Blocks[row, col].Tick;
                                chain[groupIndex] = game.Blocks[row, col].TotalChain;
                                groupIndex++;
                            }
                        }
                    }
                }
                for (int i = 0; i < groupIndex; i++)
                {
                    if (hoverSwapGroup[i])
                    {
                        return tick[i] + "/" + Constants.TICKS_FOR_HOVER_SWAP + " Hover Ticks, " +
                               groupCount[i] + " Blocks, " +
                               chain[i] + " Chain Count, " +
                               groupId[i] + " Group Id" +
                               Environment.NewLine;
                    }
                    else
                    {
                        return tick[i] + "/" + Constants.TICKS_FOR_HOVER + " Hover Ticks, " +
                               groupCount[i] + " Blocks, " +
                               chain[i] + " Chain Count, " +
                               groupId[i] + " Group Id" +
                               Environment.NewLine; ;
                    }
                }
            }
            return "";
        }
        public string Falling()
        {
            if (game.Active.Falling)
            {
                int groupIndex = 0;
                bool groupExist = false;
                groupIndex = 0;
                for (int row = 0; row < Constants.MAX_ROWS; row++)
                {
                    for (int col = 0; col < Constants.MAX_COLS; col++)
                    {
                        if (game.Blocks[row, col].State == BlockState.Falling)
                        {
                            groupExist = false;
                            for (int i = 0; i < groupIndex; i++)
                            {
                                if (game.Blocks[row, col].groupId == groupId[i])
                                {
                                    if (chain[i] < game.Blocks[row, col].TotalChain)
                                    {
                                        chain[i] = game.Blocks[row, col].TotalChain;
                                    }
                                    groupCount[i]++;
                                    groupExist = true;
                                    break;
                                }
                            }
                            if (!groupExist)
                            {
                                groupCount[groupIndex] = 1;
                                groupId[groupIndex] = game.Blocks[row, col].groupId;
                                tick[groupIndex] = game.Blocks[row, col].Tick;
                                chain[groupIndex] = game.Blocks[row, col].TotalChain;
                                fallGroupTick[groupIndex] = game.Blocks[row, col].FallGroupTicks;
                                groupIndex++;
                            }
                        }
                    }
                }
                for (int i = 0; i < groupIndex; i++)
                {
                    return tick[i] + "/" + fallGroupTick[i] + " Fall Ticks, " +
                              groupCount[i] + " Blocks, " +
                              chain[i] + " Chain Count, " +
                              groupId[i] + " Group Id" +
                               Environment.NewLine; ;
                }
            }
            return "";
        }
        public string BlocksRemoving()
        {
            if (game.Active.BlocksRemoving)
            {
                groupIndex = 0;
                for (int row = 0; row < Constants.MAX_ROWS; row++)
                {
                    for (int col = 0; col < Constants.MAX_COLS; col++)
                    {
                        if (game.Blocks[row, col].State == BlockState.Remove)
                        {
                            groupExist = false;
                            for (int i = 0; i < groupIndex; i++)
                            {
                                if (game.Blocks[row, col].groupId == groupId[i])
                                {
                                    if (chain[i] < game.Blocks[row, col].TotalChain)
                                    {
                                        chain[i] = game.Blocks[row, col].TotalChain;
                                    }
                                    groupCount[i]++;
                                    groupExist = true;
                                    break;
                                }
                            }
                            if (!groupExist)
                            {
                                groupCount[groupIndex] = 1;
                                groupId[groupIndex] = game.Blocks[row, col].groupId;
                                tick[groupIndex] = game.Blocks[row, col].Tick;
                                chain[groupIndex] = game.Blocks[row, col].TotalChain;
                                groupIndex++;
                            }
                        }
                    }
                }
                for (int i = 0; i < groupIndex; i++)
                {
                    return tick[i] + "/" + Constants.TICKS_FOR_REMOVING_BLOCKS + " Remove Ticks, " +
                           groupCount[i] + " Blocks, " +
                           chain[i] + " Chain Count, " +
                           groupId[i] + " Group Id" +
                               Environment.NewLine; ;
                }
            }
            return "";
        }
        public string Swap()
        {
            string returnString = "";
            if (game.Active.Swap)
            {
                if (game.Active.Falling)
                {
                    returnString = "Swap Paused Due To Falling" + Environment.NewLine;
                }
                returnString += game.Ticks.Swap + "/" + Constants.TICKS_FOR_SWAP + " Swap Ticks" + Environment.NewLine;
                returnString += "Swap Row " + game.SwitchLeftBlockRow + " Col " + game.SwitchLeftBlockCol + Environment.NewLine;
            }

            return returnString;
        }
    }
}
