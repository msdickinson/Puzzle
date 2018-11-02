/// <reference path="../datatypes.ts" />
import { InputSet, InputOptions } from "../dataTypes.js";
class UserInput {
    constructor(document) {
        this.keyboadLeftPlayers = [];
        this.keyboadRightPlayers = [];
        this.joyPadOnePlayers = [];
        this.joyPadTwoPlayers = [];
        this.joyPadThreePlayers = [];
        this.joyPadFourPlayers = [];
        this.document = document;
        this.keyboardLeftAddListener();
        this.keyboardRightAddListener();
    }
    Subscribe(player, inputSet) {
        if (inputSet == InputSet.LeftKeyboard) {
            this.keyboadLeftPlayers.push(player);
        }
        else if (inputSet == InputSet.RightKeyboard) {
            this.keyboadRightPlayers.push(player);
        }
        else if (inputSet == InputSet.JoyPadOne) {
            this.joyPadOnePlayers.push(player);
        }
        else if (inputSet == InputSet.JoyPadTwo) {
            this.joyPadTwoPlayers.push(player);
        }
        else if (inputSet == InputSet.JoyPadThree) {
            this.joyPadThreePlayers.push(player);
        }
        else if (inputSet == InputSet.JoyPadFour) {
            this.joyPadFourPlayers.push(player);
        }
    }
    Unsubscribe(player, inputSet) {
        if (inputSet == InputSet.LeftKeyboard) {
            this.keyboadRightPlayers = this.keyboadRightPlayers.filter(item => item != player);
        }
        else if (inputSet == InputSet.RightKeyboard) {
            this.keyboadRightPlayers = this.keyboadRightPlayers.filter(item => item != player);
        }
        else if (inputSet == InputSet.JoyPadOne) {
            this.joyPadOnePlayers = this.joyPadOnePlayers.filter(item => item != player);
        }
        else if (inputSet == InputSet.JoyPadTwo) {
            this.joyPadTwoPlayers = this.joyPadTwoPlayers.filter(item => item != player);
        }
        else if (inputSet == InputSet.JoyPadThree) {
            this.joyPadThreePlayers = this.joyPadThreePlayers.filter(item => item != player);
        }
        else if (inputSet == InputSet.JoyPadFour) {
            this.joyPadFourPlayers = this.joyPadFourPlayers.filter(item => item != player);
        }
    }
    keyboardLeftAddListener() {
        this.document.addEventListener('keydown', (event) => {
            const keyName = event.key;
            if (event.key == "W" || keyName == "w") {
                for (let i = 0; i < this.keyboadLeftPlayers.length; i++) {
                    this.CallBack(this.keyboadLeftPlayers[i], InputOptions.Up);
                }
            }
            else if (event.key == "a" || keyName == "A") {
                for (let i = 0; i < this.keyboadLeftPlayers.length; i++) {
                    this.CallBack(this.keyboadLeftPlayers[i], InputOptions.Left);
                }
            }
            else if (event.key == "s" || keyName == "S") {
                for (let i = 0; i < this.keyboadLeftPlayers.length; i++) {
                    this.CallBack(this.keyboadLeftPlayers[i], InputOptions.Down);
                }
            }
            else if (event.key == "d" || keyName == "d") {
                for (let i = 0; i < this.keyboadLeftPlayers.length; i++) {
                    this.CallBack(this.keyboadLeftPlayers[i], InputOptions.Right);
                }
            }
            else if (event.key == " ") {
                for (let i = 0; i < this.keyboadLeftPlayers.length; i++) {
                    this.CallBack(this.keyboadLeftPlayers[i], InputOptions.A);
                }
            }
        });
    }
    keyboardRightAddListener() {
        this.document.addEventListener('keydown', (event) => {
            const keyName = event.key;
            if (event.key == "ArrowUp") {
                for (let i = 0; i < this.keyboadRightPlayers.length; i++) {
                    this.CallBack(this.keyboadRightPlayers[i], InputOptions.Up);
                }
            }
            else if (event.key == "ArrowLeft") {
                for (let i = 0; i < this.keyboadRightPlayers.length; i++) {
                    this.CallBack(this.keyboadRightPlayers[i], InputOptions.Left);
                }
            }
            else if (event.key == "ArrowDown") {
                for (let i = 0; i < this.keyboadRightPlayers.length; i++) {
                    this.CallBack(this.keyboadRightPlayers[i], InputOptions.Down);
                }
            }
            else if (event.key == "ArrowRight") {
                for (let i = 0; i < this.keyboadRightPlayers.length; i++) {
                    this.CallBack(this.keyboadRightPlayers[i], InputOptions.Right);
                }
            }
            else if (event.key == "Enter") {
                for (let i = 0; i < this.keyboadRightPlayers.length; i++) {
                    this.CallBack(this.keyboadRightPlayers[i], InputOptions.A);
                }
            }
        });
    }
}
export { UserInput };
//# sourceMappingURL=UserInput.js.map