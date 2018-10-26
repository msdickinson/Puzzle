"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InputService {
    constructor(document, resolve) {
        resolve();
    }
}
exports.InputService = InputService;
//class InputService {
//    private keyboadLeftFunctions: Function[] = [];
//    private keyboadRightFunctions: Function[] = [];
//    private joyPadOneFunctions: Function[] = [];
//    private joyPadTwoFunctions: Function[] = [];
//    private joyPadThreeFunctions: Function[] = [];
//    private joyPadFourFunctions: Function[] = [];
//    private document: doc;
//    constructor(document: Document, resolve: Function) {
//        this.document = document;
//        this.keyboardLeftAddListener();
//        this.keyboardRightAddListener();
//        resolve();
//    }
//    public Subscribe(inputCallBack: Function, inputSet: InputSet) {
//        if (inputSet == InputSet.LeftKeyboard) {
//            this.keyboadLeftFunctions.push(inputCallBack);
//        }
//        else if (inputSet == InputSet.RightKeyboard) {
//            this.keyboadRightFunctions.push(inputCallBack);
//        }
//        else if (inputSet == InputSet.JoyPadOne) {
//            this.joyPadOneFunctions.push(inputCallBack);
//        }
//        else if (inputSet == InputSet.JoyPadTwo) {
//            this.joyPadTwoFunctions.push(inputCallBack);
//        }
//        else if (inputSet == InputSet.JoyPadThree) {
//            this.joyPadThreeFunctions.push(inputCallBack);
//        }
//        else if (inputSet == InputSet.JoyPadFour) {
//            this.joyPadFourFunctions.push(inputCallBack);
//        }
//    }
//    public Unsubscribe(inputCallBack: Function, inputSet: InputSet) {
//        if (inputSet == InputSet.LeftKeyboard) {
//            this.keyboadRightFunctions = this.keyboadRightFunctions.filter(func => func != inputCallBack);
//        }
//        else if (inputSet == InputSet.RightKeyboard) {
//            this.keyboadRightFunctions = this.keyboadRightFunctions.filter(func => func != inputCallBack);
//        }
//        else if (inputSet == InputSet.JoyPadOne) {
//            this.joyPadOneFunctions = this.joyPadOneFunctions.filter(func => func != inputCallBack);
//        }
//        else if (inputSet == InputSet.JoyPadTwo) {
//            this.joyPadTwoFunctions = this.joyPadTwoFunctions.filter(func => func != inputCallBack);
//        }
//        else if (inputSet == InputSet.JoyPadThree) {
//            this.joyPadThreeFunctions = this.joyPadThreeFunctions.filter(func => func != inputCallBack);
//        }
//        else if (inputSet == InputSet.JoyPadFour) {
//            this.joyPadFourFunctions = this.joyPadFourFunctions.filter(func => func != inputCallBack);
//        }
//    }
//    private keyboardLeftAddListener() {
//        this.document.addEventListener('keydown', (event) => {
//            const keyName = event.key;
//            if (event.key == "W" || keyName == "w") {
//                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
//                    this.keyboadLeftFunctions[i](InputOptions.Up);
//                }
//            }
//            else if (event.key == "a" || keyName == "A") {
//                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
//                    this.keyboadLeftFunctions[i](InputOptions.Left);
//                }
//            }
//            else if (event.key == "s" || keyName == "S") {
//                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
//                    this.keyboadLeftFunctions[i](InputOptions.Down);
//                }
//            }
//            else if (event.key == "d" || keyName == "d") {
//                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
//                    this.keyboadLeftFunctions[i](InputOptions.Right);
//                }
//            }
//            else if (event.key == " ") {
//                for (let i = 0; i < this.keyboadLeftFunctions.length; i++) {
//                    this.keyboadLeftFunctions[i](InputOptions.A);
//                }
//            }
//        });
//    }
//    private keyboardRightAddListener() {
//        this.document.addEventListener('keydown', (event) => {
//            const keyName = event.key;
//            if (event.key == "ArrowUp") {
//                for (let i = 0; i < this.keyboadRightFunctions.length; i++) {
//                    this.keyboadRightFunctions[i](InputOptions.Up);
//                }
//            }
//            else if (event.key == "ArrowLeft") {
//                for (let i = 0; i < this.keyboadRightFunctions.length; i++) {
//                    this.keyboadRightFunctions[i](InputOptions.Left);
//                }
//            }
//            else if (event.key == "ArrowDown") {
//                for (let i = 0; i < this.keyboadRightFunctions.length; i++) {
//                    this.keyboadRightFunctions[i](InputOptions.Down);
//                }
//            }
//            else if (event.key == "ArrowRight") {
//                for (let i = 0; i < this.keyboadRightFunctions.length; i++) {
//                    this.keyboadRightFunctions[i](InputOptions.Right);
//                }
//            }
//            else if (event.key == "Enter") {
//                for (let i = 0; i < this.keyboadRightFunctions.length; i++) {
//                    this.keyboadRightFunctions[i](InputOptions.A);
//                }
//            }
//        });
//    }
//}
//# sourceMappingURL=InputService.js.map