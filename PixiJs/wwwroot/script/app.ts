import { ViewService, SoundService, InputService, GameLoopService } from "./services";
import { InputSet } from "./dataTypes";
import { Puzzle } from "./puzzle";

class App {
    private puzzles: Puzzle[] = [];
    private viewService: ViewService;
    private soundService: SoundService;
    private inputService: InputService;
    private gameLoopService: GameLoopService;

    //Services
    constructor() {
        this.viewService = new ViewService(document);
        this.soundService = new SoundService();
        this.inputService = new InputService(document);
        this.gameLoopService = new GameLoopService();

        //After all services loaded
        document.getElementById("Loading").style.display = "none";

        this.gameLoopService.Start();
    }

    private CreatePuzzle() {
        const puzzle = new Puzzle(this.soundService, this.viewService.textures);
        this.puzzles.push(puzzle);
        this.viewService.AddContainer(puzzle.View);
        this.inputService.Subscribe(puzzle.InputAction, InputSet.LeftKeyboard);
        this.inputService.Subscribe(puzzle.InputAction, InputSet.RightKeyboard);
        this.inputService.Subscribe(puzzle.InputAction, InputSet.JoyPadOne);
        this.gameLoopService.Subscribe(puzzle.Tick, puzzle.ViewUpdate, puzzle.SoundUpdate);
    }
    private RemovePuzzle() {

    }
}

const app = new App();




