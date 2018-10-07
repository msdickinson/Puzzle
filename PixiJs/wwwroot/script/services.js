import { InputSet, InputOptions } from 'dataTypes.js';
class ViewService {
    constructor(element) {
        this.textures = [];
        this.app = new PIXI.Application(306, 709, { backgroundColor: 0x1099bb });
        element.appendChild(this.app.view);
        this.textures = PIXI.loader.resources["/images/textures.json"].spritesheet.textures;
    }
    AddContainer(container) {
        this.app.stage.addChild(container);
        return container;
    }
    RemoveContainer(container) {
        this.app.stage.removeChild(container);
    }
}
class SoundService {
    constructor() {
        this.swap = null;
        this.fall = null;
        this.remove = null;
        this.swap = new Howl({
            src: ['/sound/swap.mp3']
        });
        this.fall = new Howl({
            src: ['/sound/swap.mp3']
        });
        this.remove = new Howl({
            src: ['/sound/swap.mp3']
        });
    }
}
class InputService {
    constructor(document) {
        this.document = document;
        this.keyboardLeftAddListener();
        this.keyboardRightAddListener();
    }
    Subscribe(inputCallBack, inputSet) {
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
    Unsubscribe(inputCallBack, inputSet) {
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
    keyboardLeftAddListener() {
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
    keyboardRightAddListener() {
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
    constructor() {
    }
    update() {
        for (let i = 0; i < this.update.length; i++) {
            this.updateFunctions[i]();
        }
    }
    draw() {
        for (let i = 0; i < this.update.length; i++) {
            this.drawFunctions[i]();
        }
    }
    Subscribe(logic, view, sound) {
        this.updateFunctions.push(logic);
        this.drawFunctions.push(view);
        this.drawFunctions.push(sound);
    }
    Unsubscribe(update, view, sound) {
        this.updateFunctions = this.updateFunctions.filter(func => func != update);
        this.drawFunctions = this.drawFunctions.filter(func => func != view && func != sound);
    }
    Start() {
        // MainLoop.setUpdate(this.update).setDraw(this.draw).start();
    }
    Stop() {
    }
}
export { ViewService, SoundService, InputService, GameLoopService };
//# sourceMappingURL=services.js.map