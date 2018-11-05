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

    constructor(document: HTMLDocument, r: Function) {
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
    public Tick() {
        if (this.client != null) {
            this.client.Tick();
        }
    }
    public UpdateView() {
        if (this.client != null) {
            this.client.UpdateView();
        }
    }
    public Mode(mode: string, div: HTMLDivElement, r: Function, f: Function) {
        this.view.SetContainer(div);
        this.client = new Client(this.logic, this.log, this.view, this.userInput, this.sound, this.network, mode, r, f);
    }
}

export { App }