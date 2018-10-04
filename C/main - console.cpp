//typedef enum FG_COLORS
//{
//    FG_BLACK = 0, FG_BLUE = 1, FG_GREEN = 2, FG_CYAN = 3, FG_RED = 4,
//    FG_MAGENTA = 5, FG_BROWN = 6, FG_LIGHTGRAY = 7, FG_GRAY = 8,
//    FG_LIGHTBLUE = 9, FG_LIGHTGREEN = 10, FG_LIGHTCYAN = 11, FG_LIGHTRED = 12,
//    FG_LIGHTMAGENTA = 13, FG_YELLOW = 14, FG_WHITE = 15
//}
//FG_COLORS;

//    /*Enum to store Background colors*/
//    typedef enum BG_COLORS
//{
//    BG_NAVYBLUE = 16, BG_GREEN = 32, BG_TEAL = 48,
//    BG_MAROON = 64, BG_PURPLE = 80, BG_OLIVE = 96,
//    BG_SILVER = 112, BG_GRAY = 128, BG_BLUE = 144,
//    BG_LIME = 160, BG_CYAN = 176, BG_RED = 192,
//    BG_MAGENTA = 208, BG_YELLOW = 224, BG_WHITE = 240
//}
//BG_COLORS;

//  const char* s = u8"\u25A2";

//bool PrintMenu(Game* game)
//{

//}


//int main()
//{
//    int a = 254;
//    Game game;
//    bool Quit = false;


//    int fallGroups[50];
//    int chainGroups[50];
//    bool hoverSwapGroup[50];

//    int fallGroupsIndex = 0;
//    bool fallGroupsFound = false;


//    int tick[50];
//    int chain[50];
//    int groupCount[50];
//    int fallGroupTick[50];
//    int groupId[50];
//    int groupIndex = 0;
//    bool groupExist = false;
//    HANDLE hstdin = GetStdHandle(STD_INPUT_HANDLE);
//    HANDLE hstdout = GetStdHandle(STD_OUTPUT_HANDLE);
//    CONSOLE_SCREEN_BUFFER_INFO csbi;
//    GetConsoleScreenBufferInfo(hstdout, &csbi);

//    SetConsoleTextAttribute(hstdout, FG_COLORS.FG_WHITE);


//    while (!Quit)
//    {
//        system("cls");
//        for (int r = MAX_ROWS - 1; r >= 0; r--)
//        {
//            std.cout << " ";
//            for (int c = 0; c < MAX_COLS; c++)
//            {
//                if (game.Blocks[r, c].State != BlockState.None && game.Blocks[r, c].State != BlockState.SwitchNone && game.Blocks[r, c].State != BlockState.LockedForFall)
//                {
//                    switch (game.Blocks[r, c].Color)
//                    {
//                        case BlockColor.Blue:
//                            SetConsoleTextAttribute(hstdout, FG_COLORS.FG_BLUE);
//                            std.cout << (char)a << " ";
//                            break;
//                        case BlockColor.Green:
//                            SetConsoleTextAttribute(hstdout, FG_COLORS.FG_GREEN);
//                            std.cout << (char)a << " ";
//                            break;
//                        case BlockColor.Purple:
//                            SetConsoleTextAttribute(hstdout, FG_COLORS.FG_LIGHTMAGENTA);
//                            std.cout << (char)a << " ";
//                            break;
//                        case BlockColor.Red:
//                            SetConsoleTextAttribute(hstdout, FG_COLORS.FG_RED);
//                            std.cout << (char)a << " ";
//                            break;
//                        case BlockColor.Yellow:
//                            SetConsoleTextAttribute(hstdout, FG_COLORS.FG_YELLOW);
//                            std.cout << (char)a << " ";
//                            break;
//                    }
//                }
//                else
//                {
//                    SetConsoleTextAttribute(hstdout, FG_COLORS.FG_WHITE);
//                    std.cout << "  ";
//                }
//            }
//            std.cout << std.endl;
//        }
//        SetConsoleTextAttribute(hstdout, FG_COLORS.FG_WHITE);
//        std.cout << std.endl;

//        std.cout << game.Ticks.Puzzle << " Game Ticks" << std.endl;





//        std.cout << std.endl << std.endl;


//    };

//}



//void PrintBlocks(Game game)
//{

//}