//This Is a older version... Deleted the functional version when moving code to C#...

#include <math.h> 
#include <cstdlib>
#include <stdlib.h>
#include <iostream>
#include <string>
const int MAX_ROWS = 14;
const int MAX_COLS = 6;
const int STARTING_ROWS = 4;
const int MAX_SOUND_REQUESTS = 1000;
const int TICKS_FOR_BLOCK_ROW_CHANGE = 50;
enum class SetType { Mixed, Row, Col };
enum class BlockState { None, Exist, Gravity, Switch , SwitchNone, Remove};
enum class KeyState { Down, Up };
enum class BlockColor { Green, Blue, Red, Purple, Yellow };
enum class SoundRequest { Pause, Resume, MusicStart, MusicMute, MusicUnMute, SoundEffectsMute, SoundEffectsUnMute, Swap, BlocksFall, BlockSet, Combo, LargeCombo, Chain, LargeChain };

struct Block 
{
    BlockColor Color;
    BlockState State; 
};
struct GravityBlocks 
{
    int Row;
    int Col;
};
struct RemovalInstance
{
    int Chain;
    int Tick;
    int EndTick;
};
struct Effect
{
    int StartTick;
    int EndTick;
    int Row;
    int Col;
};
struct Tick
{
    int Puzzle;
    int Gravity;
    int MoveBlocksUp;
    int Swap;
    int BlocksRemoving;
};
struct Active
{
    bool Puzzle;
    bool Gravity;
    bool Swap;
    bool BlocksRemoving;
};
struct Selector
{
    int X;
    int Y;
};
struct Set
{
    int Row;
    int Col;
    int Count;
    int NewSetIndex;
    int Intersects;
    SetType Type;
};

  


class Game 
{
	public:
        Block Blocks[MAX_ROWS][MAX_COLS];
        GravityBlocks GravityBlocks[MAX_ROWS][MAX_COLS];
        bool BlocksMoveFast = false;
        //Switch
        int SwitchLeftBlockRow = 0;
        int SwitchLeftBlockCol = 0;
        int SwitchRightBlockRow = 0;
        int SwitchRightBlockCol = 0;
        int BlockInc = 0;
        int Score = 0;
        int Level = 1;
        int Chain = 0;
        Selector Selector;
        int SoundRequestCount = 0;
        SoundRequest SoundRequests[MAX_SOUND_REQUESTS];
        Active Active;
        Tick Ticks;
        

        int SetCount = 0;
        //i//nt SetRowCount = 0;
        int SetCombinedCount = 0;

        Set Set[MAX_ROWS * MAX_COLS];
  
        int BlockSetsCount;
        int BlockSets[MAX_ROWS * MAX_COLS];
        
    	Game()
        {
            Reset();
        }
        void Tick()
        {
            if (Active.Puzzle)
            {
                //Add To Total Ticks
                Ticks.Puzzle++;

                if (Active.BlocksRemoving)
                {
                    RemoveBlocksTick();
                }
                if (Active.Gravity)
                {
                    GravityTick();
                }
                else
                {
                    if (!Active.BlocksRemoving && !Active.Gravity)
                    {
                        MoveBlocksUpTick();
                    }
                    if (Active.Swap)
                    {
                        SwapBlocksTick();
                    }
                }

                //Level up
                if (Ticks.Puzzle % (60 * 20) == 0)
                    Level++;
            }
        }
        void Reset()
        {
            Active.Puzzle = true;
            Active.Gravity = false;
            Active.Swap = false;
            
            Ticks.Puzzle = 0;
            Ticks.Gravity = 0;
            Ticks.MoveBlocksUp = 0;
            Ticks.Swap = 0;

            for (int i = 0; i < MAX_ROWS; i++)
            {
                for (int j = 0; j < MAX_COLS; j++)
                {
                    Blocks[i][j].State = BlockState::None;
                }
            }

            Score = 0;
            Level = 5;
            Selector.X = 2;
            Selector.Y = 3;
            CreateSetupBlocks();
        }
        void RequestSwitch(int col, int row){
            if(!Active.Swap)
            {
                if((Blocks[row][col].State == BlockState::None || Blocks[row][col].State == BlockState::Exist) &&
                   (Blocks[row][col + 1].State == BlockState::None || Blocks[row][col + 1].State == BlockState::Exist))
                {
                    SwitchLeftBlockRow = row;
                    SwitchLeftBlockCol = col;
                    SwitchRightBlockRow = row;
                    SwitchRightBlockCol = col + 1;

                    //Adjust Block States
                    if(Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].State == BlockState::Exist)
                    {
                        Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].State = BlockState::Switch;
                    }
                    else
                    {
                        Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].State = BlockState::SwitchNone;
                    }

                    if(Blocks[SwitchRightBlockRow][SwitchRightBlockCol].State == BlockState::Exist)
                    {
                        Blocks[SwitchRightBlockRow][SwitchRightBlockCol].State = BlockState::Switch;
                    }
                    else
                    {
                        Blocks[SwitchRightBlockRow][SwitchRightBlockCol].State = BlockState::SwitchNone;
                    }
                }
               
            }
        }

        private:
        void CreateSetupBlocks()
        {
            for (int i = 0; i < STARTING_ROWS; i++)
            {
                AddBlockRow(i);
            }
        }
        void CheckForBlocks()
        {
            int setCount = 0;
            int currentBlockRow = 0;
            int currentBlockCol = 0;
            SetCount = 0;
            SetCombinedCount = 0;
           
            //Columns -> ROWS Found * COLS FOUND
            for (int i = 0; i < MAX_ROWS; i++)
            {
                currentBlockCol = 0;
                setCount = 1;
                for (int j = 1; j < MAX_COLS; j++)
                {
                    //If The Next Block Is the same color
                    if(Blocks[i][j].State == BlockState::Exist && Blocks[i][j].Color == Blocks[i][currentBlockCol].Color)
                    {
                        setCount++;
                    }
                    else
                    {
                        if(setCount >= 3){
                            //Flag Blocks For Removal
                            for (int k = 0; k < setCount; k++)
                            {
                                Blocks[i][currentBlockCol + k].State = BlockState::Remove;
                            }

                            Set[SetCount].Row = i;
                            Set[SetCount].Col = currentBlockCol;
                            Set[SetCount].Count = setCount;
                            Set[SetCount].NewSetIndex = -1;
                            Set[SetCount].Type = SetType::Col;
                            SetCount++;
                        }

                        while(j != MAX_COLS - 1)
                        {
                            if(Blocks[i][j + 1].State == BlockState::Exist)
                            {
                                currentBlockCol = j;   
                                setCount = 1;
                            }
                            else
                            {
                                j++;
                            }
                        }
                    }
                }
            }

            //Rows
            for (int i = 0; i < MAX_COLS; i++)
            {
                currentBlockRow = 0;
                setCount = 1;
                for (int j = 1; j < MAX_ROWS; j++)
                {
                    //If The Next Block Is the same color
                    if(Blocks[j][i].State == BlockState::Exist && Blocks[j][i].Color == Blocks[currentBlockRow][i].Color)
                    {
                        setCount++;
                    }
                    else
                    {
                        if(setCount >= 3){
                             //Flag Blocks For Removal
                            for (int k = 0; k < setCount; k++)
                            {
                                Blocks[currentBlockRow + k][i].State = BlockState::Remove;
                            }
                            Set[SetCount].Row = currentBlockRow;
                            Set[SetCount].Col = i;
                            Set[SetCount].Count = setCount;
                            Set[SetCount].NewSetIndex = -1;
                            Set[SetCount].Type = SetType::Row;
                            SetCount++;
                        }

                        while(j != MAX_COLS - 1)
                        {
                            if(Blocks[i][j + 1].State == BlockState::Exist)
                            {
                                currentBlockCol = j;   
                                setCount = 1;
                            }
                            else
                            {
                                j++;
                            }
                        }
                    }
                }
            }
            //CombineSets 
            int NewSetIndex = 0;
            //[Flag Sets]
            for (int i = 0; i < SetCount; i++)
            {
                if(Set[i].NewSetIndex == -1){
                    Set[i].NewSetIndex = NewSetIndex;
                    NewSetIndex++;
                }

                for (int j = i; j < SetCount; j++)
                {
                    if(Set[i].Type == SetType::Col &&
                       Set[j].Type == SetType::Row && 
                       Set[i].Col >= Set[j].Col &&
                       Set[i].Col <= (Set[j].Col + Set[j].Count))
                    {
                        Set[i].Intersects++;
                        Set[i].NewSetIndex = Set[j].NewSetIndex;
                    }
 
                    if(Set[j].Type == SetType::Col &&
                       Set[i].Type == SetType::Row &&
                       Set[j].Col >= Set[i].Col &&
                       Set[j].Col <= (Set[i].Col + Set[i].Count))
                    {
                        Set[i].Intersects++;
                        Set[i].NewSetIndex = Set[j].NewSetIndex;
                    }
                }
            }

            //Combine Flaged Sets
            for (int i = 0; i < SetCount; i++)
            {
                BlockSets[Set[i].NewSetIndex] += Set[i].Count - Set[i].Intersects;
            }

            if(SetCount > 0){
                Active.BlocksRemoving;
                GetPoints();
            }

        }
      
        void CheckForGravity()
        {
            for (int i = 1; i < MAX_ROWS; i++)
            {
                for (int j = 0; j < MAX_COLS; j++)
                {
                    if(Blocks[i][j].State == BlockState::Exist){
                         if(Blocks[i - 1][j].State == BlockState::None || Blocks[i - 1][j].State == BlockState::Gravity)
                         {
                            Active.Gravity = true;
                            Blocks[i][j].State = BlockState::Gravity;
                            for (int k = i; k > 0; k--)
                            {
                                if(Blocks[k - 1][j].State == BlockState::None){
                                    GravityBlocks[i][j].Row = k -1;
                                }
                                if(Blocks[k - 1][j].State == BlockState::Gravity){
                                    GravityBlocks[i][j].Row = GravityBlocks[k - 1][j].Row + 1;
                                    break;
                                }
                            }
                         }
                    }
                }
            }
        }
        void GravityTick()
        {
            Ticks.Gravity++;
            if (Ticks.Gravity == 10) 
            {
                for (int i = 0; i < MAX_ROWS; i++)
                {
                    for (int j = 0; j < MAX_COLS; j++)
                    {
                        if(Blocks[i][j].State == BlockState::Gravity)
                        {
                            Blocks[i][j].State = BlockState::None;
                            Blocks[GravityBlocks[i][j].Row][GravityBlocks[i][j].Col].State = BlockState::Exist;
                            Blocks[GravityBlocks[i][j].Row][GravityBlocks[i][j].Col].Color = Blocks[i][j].Color;
                        }
                        CheckForBlocks();
                        if(BlockSetsCount > 0){
                            Chain++;
                        }else
                        {
                            Chain = 1;
                        }
                    }
                }

                
            }
        }
   
        void MoveBlocksUpTick()
        {
            int blockInc = 5;

            Ticks.MoveBlocksUp++;
            if (!BlocksMoveFast) {
                //Standard
                if(Level <= 10 && (Ticks.MoveBlocksUp % (int)round(96 - 7.3 * Level - 1)) == 0)
                {
                    BlockInc += 5;
                }
                //Hard
                if(Level > 10 && Level < 15 && (Ticks.MoveBlocksUp % (int)round(30 * Level - 10)) == 0)
                {
                    BlockInc += 5;
                }
                //Hard(Over time)
                if(Level >= 15 && (Ticks.MoveBlocksUp % (int)(30 - round(2 * Level - 15))) == 0)
                {
                    BlockInc += 5;
                }
                //Hard(Over time)
                if(Level >= 20 && Ticks.MoveBlocksUp % (60 * 20) == 0)
                {
                    BlockInc += 1;
                }
        } 
        else
        {
            if (Ticks.MoveBlocksUp % 1 == 0 && BlockInc != 50) {
                BlockInc += 2.5;
            }
        }

        if (BlockInc == 50) {
            Ticks.MoveBlocksUp = 0;
            RowChange();
            CheckForBlocks();
        }

    };
 
   
    void RowChange() {
        CheckForGameOver();
        MoveBlocksUpOneRow();
        AddBlockRow(0);
    }
    void MoveBlocksUpOneRow(){
        for (int i = 0; i < MAX_ROWS - 1; i++)
        {
            for (int j = 0; j < MAX_COLS; j++)
            {
                Blocks[i + 1][j].Color = Blocks[i][j].Color;
                Blocks[i + 1][j].State = Blocks[i][j].State;
            }
        }
    }
    bool CheckForGameOver()
    {
        for (int j = 0; j < MAX_COLS; j++)
        {
            if(Blocks[MAX_ROWS - 1][j].State == BlockState::Exist){
                return true;
            }
        }
        return false;
    }

        void SwapBlocksTick()
        {
            Ticks.Swap++;
            if (Ticks.Swap == 10) 
            {
                //Swap
                BlockState newRightState = Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].State;
                BlockColor newRightColor = Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].Color;

                Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].State = Blocks[SwitchRightBlockRow][SwitchRightBlockCol].State;
                Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].Color = Blocks[SwitchRightBlockRow][SwitchRightBlockCol].Color;

                Blocks[SwitchRightBlockRow][SwitchRightBlockCol].State = newRightState;
                Blocks[SwitchRightBlockRow][SwitchRightBlockCol].Color = newRightColor;

                //Adjust Block States
                if(Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].State == BlockState::Switch)
                {
                    Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].State = BlockState::Exist;
                }
                else{
                    Blocks[SwitchLeftBlockRow][SwitchLeftBlockCol].State = BlockState::None;
                }

                if(Blocks[SwitchRightBlockRow][SwitchRightBlockCol].State == BlockState::Switch)
                {
                    Blocks[SwitchRightBlockRow][SwitchRightBlockCol].State = BlockState::Exist;
                }
                else{
                    Blocks[SwitchRightBlockRow][SwitchRightBlockCol].State = BlockState::None;
                }

                CheckForBlocks();
            }
        }
        void RemoveBlocksTick(){
            Ticks.BlocksRemoving++;

            if (Ticks.BlocksRemoving == 10) 
            {
                for (int i = 0; i < MAX_ROWS; i++)
                {
                    for (int j = 0; j < MAX_COLS; j++)
                    {
                        if(Blocks[i][j].State == BlockState::Remove)
                        {
                            Blocks[i][j].State = BlockState::None;
                            Blocks[GravityBlocks[i][j].Row][GravityBlocks[i][j].Col].State = BlockState::Exist;
                            Blocks[GravityBlocks[i][j].Row][GravityBlocks[i][j].Col].Color = Blocks[i][j].Color;
                        }
                        CheckForGravity();
                    }
                }
            }
        }
        void AddBlockRow(int row){
            for (int i = 0; i < 6; i++)
            {
                int col = i + 1;
                BlockColor blockColor;
                do
                {
                    blockColor = (BlockColor)(rand() % 5);
                } while (!IsNewBlockVaild(row, col, blockColor));

                Blocks[row][col].Color = blockColor;
                Blocks[row][col].State = BlockState::Exist;
            }
        }
        bool IsNewBlockVaild(int blockRow, int blockCol, BlockColor blockColor)
        {
            bool foundValue = false;
            int i = 0;
            int rowSameColor = 1;

            //Down
            i = 1;
            do
            {
                foundValue = false;

                if (Blocks[blockRow - i][blockCol].State == BlockState::Exist &&
                    Blocks[blockRow - i][blockCol].Color == blockColor)
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

                if (Blocks[blockRow + i][blockCol].State == BlockState::Exist &&
                    Blocks[blockRow + i][blockCol].Color == blockColor)
                {
                    rowSameColor++;
                    foundValue = true;
                }
                i++;
            } while (foundValue);


            if (rowSameColor >= 3)
            {
                return false;
            }


            int colSameColor = 0;
            //Left
            i = 1;
            do
            {
                foundValue = false;

                if (Blocks[blockRow][blockCol - i].State == BlockState::Exist &&
                    Blocks[blockRow][blockCol - i].Color == blockColor)
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

                if (Blocks[blockRow][blockCol + i].State == BlockState::Exist &&
                    Blocks[blockRow][blockCol + i].Color == blockColor)
                {
                    colSameColor++;
                    foundValue = true;
                }
                i++;
            } while (foundValue);


            if (colSameColor >= 3)
            {
                return false;
            }
            return true;
        }
        void GetPoints(){
            ChainScore();
            for(int i = 0; BlockSetsCount < 0; i++){
                TotalBlockScore(BlockSetsCount);
            }
        }
        void ChainScore() 
        {
            int addtionalScore = 0;

            if (Chain == 2) {
                addtionalScore = 50;
            }
            if (Chain == 3) {
                addtionalScore = 130;
            }
            if (Chain == 4) {
                addtionalScore = 280;

            }
            if (Chain == 5) {
                addtionalScore = 580;
            }
            if (Chain == 6) {
                addtionalScore = 980;
            }
            if (Chain == 7) {
                addtionalScore = 1480;
            }
            if (Chain == 8) {
                addtionalScore = 2180;
            }
            if (Chain == 9) {
                addtionalScore = 3080;
            }
            if (Chain == 10) {
                addtionalScore = 4180;
            }
            if (Chain == 11) {
                addtionalScore = 5480;
            }
            if (Chain == 12) {
                addtionalScore = 6980;
            }
            if (Chain > 12) {
                addtionalScore = 6980 + ((Chain - 12) * 1800);
            }

            Score += addtionalScore;

        }
        void TotalBlockScore(int totalBlocks)
        {
            int addtionalScore = 0;

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
            Score += addtionalScore;
        }
};

int main()
{
	Game game;
    bool Quit = false;
    char input = 'a';
    int row = 0;
    int col = 0;
    int tickCount = 0;
    while(!Quit) {
        std::cout << "T - Tick\n";
        std::cout << "R - Request Switch\n";
        std::cout << "E - Exit\n";
        std::cin >> input;
        system("cls");
        switch (input) {
                case 'T':
                    std::cout << "Input Row \n";
                    std::cin >> tickCount;
                    for(int i = 0; i < tickCount; i++){
                        game.Tick();
                    }
                    break;

                case 'R':
                    std::cout << "Input Row \n";
                    std::cin >> row;
                    std::cout << "Input Col\n";
                    std::cin >> col;
                    game.RequestSwitch(col, row);
                    break;
                case 'E':
                    Quit = true;
                    break;
                default:
                    std::cout << "Invaild Input" << std::endl;
                    break;
        }
    };

}


