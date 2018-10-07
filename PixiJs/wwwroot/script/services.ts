import { InputSet, InputOptions } from 'dataTypes.js'

class ViewService {
    private app: PIXI.Application;
    public textures: PIXI.Texture[] = [];
    constructor(element: Document) {
        this.app = new PIXI.Application(306, 709, { backgroundColor: 0x1099bb });
        element.appendChild(this.app.view);        this.textures = PIXI.loader.resources["/images/textures.json"].spritesheet.textures;    }
    public AddContainer(container: PIXI.Container) {
        this.app.stage.addChild(container);
        return container;
    }
    public RemoveContainer(container: PIXI.Container) {
        this.app.stage.removeChild(container);
    }
}
class SoundService {
    public swap = null;
    public fall = null;
    public remove = null;
    constructor() {
        this.swap = new Howl({
            src: ['/sound/swap.mp3']
        });        this.fall = new Howl({
            src: ['/sound/swap.mp3']
        });        this.remove = new Howl({
            src: ['/sound/swap.mp3']
        });    }
}
class InputService {
    private keyboadLeftFunctions: Function[];
    private keyboadRightFunctions: Function[];
    private joyPadOneFunctions: Function[];
    private joyPadTwoFunctions: Function[];
    private joyPadThreeFunctions: Function[];
    private joyPadFourFunctions: Function[];
    private document: Document;
    constructor(document: Document) {
        this.document = document;
        this.keyboardLeftAddListener();
        this.keyboardRightAddListener()
    }

    public Subscribe(inputCallBack: Function, inputSet: InputSet) {
        if (inputSet == InputSet.LeftKeyboard) {
            this.keyboadRightFunctions.push(inputCallBack);
        }
        else if (inputSet == InputSet.RightKeyboard) {
            this.keyboadRightFunctions.push(inputCallBack);
        }
        else if (inputSet == InputSet.JoyPadOne) {
            this.joyPadOneFunctions.push(inputCallBack);
        }
        else if (inputSet == InputSet.JoyPadTwo) {
            this.joyPadTwoFunctions.push(inputCallBack);
        }
        else if (inputSet == InputSet.JoyPadThree) {
            this.joyPadThreeFunctions.push(inputCallBack);
        }
        else if (inputSet == InputSet.JoyPadFour) {
            this.joyPadFourFunctions.push(inputCallBack);
        }
    }
    public Unsubscribe(inputCallBack: Function, inputSet: InputSet) {
        if (inputSet == InputSet.LeftKeyboard) {
            this.keyboadRightFunctions = this.keyboadRightFunctions.filter(func => func != inputCallBack);
        }
        else if (inputSet == InputSet.RightKeyboard) {
            this.keyboadRightFunctions = this.keyboadRightFunctions.filter(func => func != inputCallBack);
        }
        else if (inputSet == InputSet.JoyPadOne) {
            this.joyPadOneFunctions = this.joyPadOneFunctions.filter(func => func != inputCallBack);
        }
        else if (inputSet == InputSet.JoyPadTwo) {
            this.joyPadTwoFunctions = this.joyPadTwoFunctions.filter(func => func != inputCallBack);
        }
        else if (inputSet == InputSet.JoyPadThree) {
            this.joyPadThreeFunctions = this.joyPadThreeFunctions.filter(func => func != inputCallBack);
        }
        else if (inputSet == InputSet.JoyPadFour) {
            this.joyPadFourFunctions = this.joyPadFourFunctions.filter(func => func != inputCallBack);
        }
    }

    private keyboardLeftAddListener() {
        this.document.addEventListener('keydown', (event) => {
            const keyName = event.key;
            if (event.key == "W" || keyName == "w") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.Up);
                }
            }
            else if (event.key == "a" || keyName == "A") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.Left);
                }
            }
            else if (event.key == "s" || keyName == "S") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.Right);
                }
            }
            else if (event.key == "d" || keyName == "d") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.Down);
                }
            }
            else if (event.key == " ") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.A);
                }
            }
        });
    }
    private keyboardRightAddListener() {
        this.document.addEventListener('keydown', (event) => {
            const keyName = event.key;
            if (event.key == "ArrowUp" || keyName == "w") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.Up);
                }
            }
            else if (event.key == "ArrowLeft" || keyName == "A") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.Left);
                }
            }
            else if (event.key == "ArrowDown" || keyName == "S") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.Right);
                }
            }
            else if (event.key == "ArrowRight" || keyName == "d") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.Down);
                }
            }
            else if (event.key == "Enter") {
                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
                    this.keyboadLeftFunctions[i](InputOptions.A);
                }
            }
        });
    }
}
class GameLoopService {
    private updateFunctions: Function[];
    private drawFunctions: Function[];

    constructor() {
    }

    private update() {
        for (let i = 0; i < this.update.length; i++) {
            this.updateFunctions[i]();
        }
    }
    private draw() {
        for (let i = 0; i < this.update.length; i++) {
            this.drawFunctions[i]();
        }
    }

    public Subscribe(logic: Function, view: Function, sound: Function) {
        this.updateFunctions.push(logic);
        this.drawFunctions.push(view);
        this.drawFunctions.push(sound);
    }
    public Unsubscribe(update: Function, view: Function, sound: Function) {
        this.updateFunctions = this.updateFunctions.filter(func => func != update);
        this.drawFunctions = this.drawFunctions.filter(func => func != view && func != sound);
    }

    public Start() {
        // MainLoop.setUpdate(this.update).setDraw(this.draw).start();
    }
    public Stop() {

    }
}

export { ViewService, SoundService, InputService, GameLoopService };
