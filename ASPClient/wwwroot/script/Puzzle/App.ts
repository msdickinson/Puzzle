import { Client } from './Client.js';
import { Logic } from './Services/Logic.js';
import { Log } from './Services/Log.js';
import { UserInput } from './Services/UserInput.js';
import { Sound } from './Services/Sound.js';
import { View } from './Services/View.js';
import { Network } from './Services/Network.js';

class App {
    private document = null;
    private canvas = null;

    private view: View;
    private sound: Sound;
    private userInput: UserInput;
    private network: Network;
    private logic: Logic;
    private log: Log;
    private client: Client;

    constructor(document: HTMLDocument, div: HTMLDivElement, r: Function) {
        this.logic = new Logic();
        this.userInput = new UserInput(document);
        this.network = new Network();
        let viewPromise = new Promise(function (resolve) {
            this.view = new View(div, resolve);
        }.bind(this));
        let soundPromise = new Promise(function (resolve) {
            this.sound = new Sound(resolve);
        }.bind(this));
     
            

        Promise.all([viewPromise, soundPromise]).then(function (values) {
            this.client = new Client(this.logic, this.log, this.view, this.userInput, this.sound, this.network);
            r();
        }.bind(this));
    }
}

export { App }