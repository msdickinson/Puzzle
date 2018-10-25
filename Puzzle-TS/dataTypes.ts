import { PuzzleLogic } from './PuzzleLogic.js';
import { PuzzleLoader } from './PuzzleLoader.js';
import seedrandom = require('seedrandom');
import { prng } from 'seedrandom';

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
enum GameActive {
    WaitingForPlayers,
    GameRunning,
    GameEnded,
    Inactive
}
class LogItem {
    public Tick: number;
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
    public static STARTING_ROWS: number = 4;
    public static TICKS_FOR_SWAP: number = 10;
    public static TICKS_FOR_REMOVING_BLOCKS: number = 30;
    public static TICKS_FOR_HOVER: number = 5;
    public static TICKS_FOR_HOVER_SWAP: number = 5;
    public static TICKS_FOR_FALL: number = 3;
}
class PuzzleLogState {
    public CurrentTick: number = 0;
    public TicksPerSecound: number = 60;
    public currentLogItem: number = 0;
    public currentLogItemCount: number = 0;
    public LogId: number = -1;
    public Log: LogItem[] = [];
}
class PuzzleLogicState {
    public Paused: Boolean = false;
    public Log: Boolean = false;
    public LogItems: LogItem[] = [];
    public SoundRequests: SoundRequest[];
    public Blocks: Block[][] = [];
    public Random: prng;
    public HoverBlocks: HoverBlock[][] = [];
    public FallBlocks: FallBlock[][] = [];
    public BlocksMoveFast: boolean = false;

    //Switch
    public SwitchLeftBlockRow: number = 0;
    public SwitchLeftBlockCol: number = 0;
    public SwitchRightBlockRow: number = 0;
    public SwitchRightBlockCol: number = 0;
    public SwapOverRide: boolean = false;
    public WaitForSwap: boolean = false;

    public BlockInc: number = 0;
    public Score: number = 0;
    public Level: number = 1;
    public Chain: number = 0;
    public groupId: number = 1;

    public Selector: Selector = new Selector();
    public Active: Active = new Active();
    public Ticks: Tick = new Tick();
    public SetCount: number = 0;
    public Set: BlockSet[] = [];

    public BlockSetsCount: number;
    public BlockSets: number[] = [];

    public Seed: number;

}
class PlayerState {
    public PuzzleLogState: PuzzleLogState = new PuzzleLogState();
    public PuzzleLogicState: PuzzleLogicState = new PuzzleLogicState();
    public player: Player;
}
class Player {
    public Name: string;
    public Id: number;
    public Key: number;
}

class PlayersSeedData {
    public Id: number;
    public Seed: number;
}
class PlayerNameUpdate {
    public Id: number;
    public Name: string;
}
class PlayerJoined {
    public Id: number;
    public Name: string;
}

class Message {
    public playerId: number;
    public messeage: string;
}
class Room {
    public Active: GameActive;
    public ActiveTime: Date;
    public Id: number;
    public Players: PlayerState[] = [];
    public GameStarted: Date;
    public Timer;
    public Random: prng;
    public Messeages: Message[] = [];
}
export {
    SetType, BlockState, KeyState, BlockColor, InputOptions, InputSet, SoundRequest, GameActive,
    Block, LogItem, HoverBlock, FallBlock, RemovalInstance, Effect, Tick, Active,
    Selector, BlockSet, Constants, PlayerState, PuzzleLogicState, PuzzleLogState, Room, Player, PlayersSeedData, Message, PlayerNameUpdate, PlayerJoined
}