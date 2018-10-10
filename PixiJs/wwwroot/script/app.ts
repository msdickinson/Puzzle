import { ViewService, SoundService, InputService, GameLoopService } from "./services.js";
import { InputSet } from "./dataTypes.js";
import { Puzzle } from "./puzzle.js";

class Player {
    public puzzle: Puzzle;
    public playerName: string;

    constructor(playerName: string, puzzle: Puzzle) {
        this.playerName = playerName;
        this.puzzle = puzzle;
    }
}

class Application {
    public players: Player[] = [];
    private viewService: ViewService;
    private soundService: SoundService;
    private inputService: InputService;
    public gameLoopService: GameLoopService;

    //Services
    constructor(document: Document, viewElement: HTMLElement, resolve: Function, reject: Function) {

        let viewServicePromise = new Promise(function (resolve, reject) {
            this.viewService = new ViewService(viewElement, resolve, reject);
        }.bind(this));

        let soundServicePromise = new Promise(function (resolve, reject) {
            this.soundService = new SoundService(resolve, reject);
        }.bind(this));

        let inputServicePromise = new Promise(function (resolve, reject) {
            this.inputService = new InputService(document, resolve, reject);
        }.bind(this));

        this.gameLoopService = new GameLoopService();
        Promise.all([viewServicePromise, soundServicePromise]).then(function (values) {
            this.AddOnePlayer();
            this.gameLoopService.updateView();
            document.getElementById("Loading").style.display = "none";
            resolve();
        }.bind(this));

    }
    private AddOnePlayer() {
        this.AddPlayer("Player 1", 0, 0, 1, true, true);
    }
    private AddSevenPlayers() {
        this.AddPlayer("Player 1", 0, 0, 1, true, true);
        this.AddPlayer("Player 2", 310, 0, .49, true, true);
        this.AddPlayer("Player 3", 310, 336, .49, true, true);
        this.AddPlayer("Player 4", 310 + 154, 0, .49, true, true);
        this.AddPlayer("Player 5", 310 + 154, 336, .49, true, true);
        this.AddPlayer("Player 6", 310 + 154 * 2, 0, .49, true, true);
        this.AddPlayer("Player 7", 310 + 154 * 2, 336, .49, true, true);
    }
    private AddAlotOfPlayers() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 25; col++) {
                this.AddPlayer("Player " + row + ", " + col, 80 * col, row * 169, .25, true, true);
            }
        }

    }
    private AddPlayer(playerName: string, x: number, y: number, scale: number, mute: boolean, log: boolean) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        container.scale.set(scale, scale); 
        const puzzle = new Puzzle(container, this.soundService, this.viewService.textures, mute, log);
        this.viewService.AddContainer(puzzle.View);
        this.inputService.Subscribe(puzzle.InputAction.bind(puzzle), InputSet.LeftKeyboard);
        this.inputService.Subscribe(puzzle.InputAction.bind(puzzle), InputSet.RightKeyboard);
        this.inputService.Subscribe(puzzle.InputAction.bind(puzzle), InputSet.JoyPadOne);
        this.gameLoopService.Subscribe(puzzle.Tick.bind(puzzle), puzzle.ViewUpdate.bind(puzzle), puzzle.SoundUpdate.bind(puzzle));
        this.players.push(new Player(playerName, puzzle));
    }
    private RemovePuzzle(player: Player) {
        this.viewService.AddContainer(player.puzzle.View);
        this.inputService.Unsubscribe(player.puzzle.InputAction, InputSet.LeftKeyboard);
        this.inputService.Unsubscribe(player.puzzle.InputAction, InputSet.RightKeyboard);
        this.inputService.Unsubscribe(player.puzzle.InputAction, InputSet.JoyPadOne);
        this.gameLoopService.Unsubscribe(player.puzzle.Tick, player.puzzle.ViewUpdate, player.puzzle.SoundUpdate);
    }
}

export { Application }



