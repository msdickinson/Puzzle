import { ViewService, SoundService, InputService, GameLoopService } from "./services";
import { InputSet } from "./dataTypes";
import { Puzzle } from "./puzzle";
class App {
    //Services
    constructor() {
        this.puzzles = [];
        this.viewService = new ViewService(document);
        this.soundService = new SoundService();
        this.inputService = new InputService(document);
        this.gameLoopService = new GameLoopService();
        //After all services loaded
        document.getElementById("Loading").style.display = "none";
        this.gameLoopService.Start();
    }
    CreatePuzzle() {
        const puzzle = new Puzzle(this.soundService, this.viewService.textures);
        this.puzzles.push(puzzle);
        this.viewService.AddContainer(puzzle.View);
        this.inputService.Subscribe(puzzle.InputAction, InputSet.LeftKeyboard);
        this.inputService.Subscribe(puzzle.InputAction, InputSet.RightKeyboard);
        this.inputService.Subscribe(puzzle.InputAction, InputSet.JoyPadOne);
        this.gameLoopService.Subscribe(puzzle.Tick, puzzle.ViewUpdate, puzzle.SoundUpdate);
    }
    RemovePuzzle() {
    }
}
const app = new App();
//# sourceMappingURL=app.js.map