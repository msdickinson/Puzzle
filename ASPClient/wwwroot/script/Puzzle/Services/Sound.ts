/// <reference path="../../lib/howler/index.d.ts" />
class Sound {
    public swap = null;
    public fall = null;
    public remove = null;
    constructor(resolve: Function) {
        this.swap = new Howl({
            src: ['./sounds/swap.mp3']
        });        this.fall = new Howl({
            src: ['./sounds/swap.mp3']
        });        this.remove = new Howl({
            src: ['./sounds/swap.mp3']
        });        //Change To After MP3s Loaded, But Waiting till I get the Sound Files        resolve();    }
}
export { Sound }