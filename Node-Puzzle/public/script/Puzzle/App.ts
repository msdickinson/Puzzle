import { Client } from './Client';
import { Logic } from './Services/Logic';
import { Log } from './Services/Log';
import { UserInput } from './Services/UserInput';
import { Sound } from './Services/Sound';
import { View } from './Services/View';

class App {
    private document = null;
    private canvas = null;

    private view: View;
    private sound: Sound;
    private userInput: UserInput;
    private logic: Logic;
    private log: Log;
    private client: Client;
    constructor() {
        this.document = null;
        this.canvas = null;
        this.logic = new Logic();

        let viewPromise = new Promise(function (resolve) {
            this.view = new View(this.canvas, resolve);
        }.bind(this));
        let soundPromise = new Promise(function (resolve) {
            this.sound = new Sound(resolve);
        }.bind(this));
        let inputPromise = new Promise(function (resolve) {
            this.userInput = new UserInput(this.document, resolve);
        }.bind(this));
        Promise.all([viewPromise, soundPromise, inputPromise]).then(function (values) {
            this.client = new Client(this.logic, this.log, this.view, this.userInput, this.sound);

        }.bind(this));


    }
}
let app = new App();