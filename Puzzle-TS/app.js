"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const game = new main_1.Game();
const time = process.hrtime();
for (let i = 0; i < (60 * 180); i++) {
    game.Tick();
    game.RequestSwitch(0, 0);
}
const nanoseconds = process.hrtime(time)[1];
const seconds = nanoseconds / 1e9;
//const seconds: any = nanoseconds * 1000000000;
console.log(nanoseconds);
console.log(seconds);
console.log("Exit");
//# sourceMappingURL=app.js.map