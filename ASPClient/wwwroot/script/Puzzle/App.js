import { Client } from './Client.js';
import { Logic } from './Services/Logic.js';
import { UserInput } from './Services/UserInput.js';
import { Sound } from './Services/Sound.js';
import { View } from './Services/View.js';
import { Network } from './Services/Network.js';
class App {
    constructor(document, r) {
        this.document = null;
        this.canvas = null;
        this.logic = new Logic();
        this.userInput = new UserInput(document);
        this.network = new Network();
        let viewPromise = new Promise(function (resolve) {
            this.view = new View(resolve);
        }.bind(this));
        let soundPromise = new Promise(function (resolve) {
            this.sound = new Sound(resolve);
        }.bind(this));
        Promise.all([viewPromise, soundPromise]).then(function (values) {
            r();
        }.bind(this));
    }
    Tick() {
        if (this.client != null) {
            this.client.Tick();
        }
    }
    UpdateView() {
        if (this.client != null) {
            this.client.UpdateView();
        }
    }
    Mode(mode, div, r, f) {
        this.view.SetContainer(div);
        this.client = new Client(this.logic, this.log, this.view, this.userInput, this.sound, this.network, mode, r, f);
    }
}
export { App };
//# sourceMappingURL=App.js.map