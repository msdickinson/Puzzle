/// <reference path="../../lib/howler/index.d.ts" />
class Sound {
    constructor(resolve) {
        this.swap = null;
        this.fall = null;
        this.remove = null;
        this.swap = new Howl({
            src: ['./sounds/swap.mp3']
        });
        this.fall = new Howl({
            src: ['./sounds/swap.mp3']
        });
        this.remove = new Howl({
            src: ['./sounds/swap.mp3']
        });
        //Change To After MP3s Loaded, But Waiting till I get the Sound Files
        resolve();
    }
}
export { Sound };
//# sourceMappingURL=Sound.js.map