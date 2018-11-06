"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Sound {
    constructor(resolve) {
        //this.swap = new Howl({
        //    src: ['./sound/swap.mp3']
        //});
        //this.fall = new Howl({
        //    src: ['./sound/swap.mp3']
        //});
        //this.remove = new Howl({
        //    src: ['./sound/swap.mp3']
        //});
        this.swap = null;
        this.fall = null;
        this.remove = null;
        //Change To After MP3s Loaded, But Waiting till I get the Sound Files
        resolve();
    }
}
exports.Sound = Sound;
//# sourceMappingURL=Sound.js.map