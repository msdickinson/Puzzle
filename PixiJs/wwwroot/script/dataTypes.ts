enum SetType {
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
enum InputOptions {
    Up,
    Down,
    Left,
    Right,
    A,
}
enum InputSet {
    LeftKeyboard,
    RightKeyboard,
    JoyPadOne,
    JoyPadTwo,
    JoyPadThree,
    JoyPadFour
}
enum SoundRequest {
    Swap,
    Remove,
    Fall,
    Hover,
    MusicOn,
    MusicOff,
    Combo,
    LargeCombo
}
class LogItem {
    public Id: number;
    public Action: string;
    public ValueOne: number = 0;
    public ValueTwo: number = 0;
}
class Block {
    public Color: BlockColor = BlockColor.Brown;
    public State: BlockState = BlockState.None;
    public TotalChain: number = 0;
    public Tick: number = 0;
    public FallGroupTicks: number = 0;
    public groupId: number = 0;
}
class HoverBlock {
    public Row: number = 0;
    public Col: number = 0;
}
class FallBlock {
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
class BlockSet {
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
    public static TICKS_FOR_FALL: number = 3;
}

export {
    SetType, BlockState, KeyState, BlockColor, InputOptions, InputSet, SoundRequest,
    Block, LogItem, HoverBlock, FallBlock, RemovalInstance, Effect, Tick, Active, Selector, BlockSet, Constants
}