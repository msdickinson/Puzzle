import { Game } from "./main";


const game = new Game();

const time = process.hrtime();

for (let i = 0; i < (60 * 180); i++) {
    game.Tick();
    game.RequestSwitch(0, 0);
}

const nanoseconds: any = process.hrtime(time)[1];
const seconds: any = nanoseconds / 1e9;
//const seconds: any = nanoseconds * 1000000000;
console.log(nanoseconds);
console.log(seconds);
console.log("Exit");
