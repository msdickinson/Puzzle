import { Client } from './Client';
import { Logic } from './Services/Logic';
import { Log } from './Services/Log';
import { UserInput } from './Services/UserInput';
import { Sound } from './Services/Sound';
import { View } from './Services/View';
import { Network } from './Services/Network';

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
        let viewPromise = new Promise(function (this: App, resolve: Function) {
            this.view = new View(resolve);
        }.bind(this));
        let soundPromise = new Promise(function (this: App, resolve: Function) {
            this.sound = new Sound(resolve);
        }.bind(this));

                    

        Promise.all([viewPromise, soundPromise]).then(function () {
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
    public Start() {
        if (this.client != null) {
            this.client.Start();
        }
    }
    public Mode(mode: string, r: Function, f: Function) {
        this.client = new Client(this.logic, this.log, this.view, this.userInput, this.sound, this.network, mode, r, f);
    }
    public SetContainer(div: HTMLDivElement) {
      this.view.SetContainer(div);
    }
}

export { App }