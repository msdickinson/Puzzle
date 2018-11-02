(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Client", "./Services/Logic", "./Services/UserInput", "./Services/Sound", "./Services/View"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Client_1 = require("./Client");
    const Logic_1 = require("./Services/Logic");
    const UserInput_1 = require("./Services/UserInput");
    const Sound_1 = require("./Services/Sound");
    const View_1 = require("./Services/View");
    class App {
        constructor() {
            this.document = null;
            this.canvas = null;
            this.document = null;
            this.canvas = null;
            this.logic = new Logic_1.Logic();
            let viewPromise = new Promise(function (resolve) {
                this.view = new View_1.View(this.canvas, resolve);
            }.bind(this));
            let soundPromise = new Promise(function (resolve) {
                this.sound = new Sound_1.Sound(resolve);
            }.bind(this));
            let inputPromise = new Promise(function (resolve) {
                this.userInput = new UserInput_1.UserInput(this.document, resolve);
            }.bind(this));
            Promise.all([viewPromise, soundPromise, inputPromise]).then(function (values) {
                this.client = new Client_1.Client(this.logic, this.log, this.view, this.userInput, this.sound);
            }.bind(this));
        }
    }
    let app = new App();
});
//# sourceMappingURL=App.js.map