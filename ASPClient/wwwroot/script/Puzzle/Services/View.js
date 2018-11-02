import { ViewState, Constants, BlockState, BlockColor } from "../dataTypes.js";
class View {
    constructor(element, resolve) {
        this.textures = [];
        this.app = new PIXI.Application(306, 659, { backgroundColor: 0x1099bb });
        element.appendChild(this.app.view);
        PIXI.loader
            .add("/images/textures.json")
            .load((() => {
            this.textures = PIXI.loader.resources["/images/textures.json"].spritesheet.textures;
            resolve();
        }).bind(this));
    }
    AddContainer(container) {
        this.app.stage.addChild(container);
    }
    RemoveContainer(container) {
        this.app.stage.removeChild(container);
    }
    CreatePlayerView(player) {
        player.ViewState = new ViewState();
        player.ViewState.Container = new PIXI.Container();
        player.ViewState.Level = new PIXI.Text('', new PIXI.TextStyle({
            fontSize: 24,
            fontWeight: 'bold',
            fill: "#fdfdfd"
        }));
        player.ViewState.Level.x = 27;
        player.ViewState.Level.y = 15;
        player.ViewState.Score = new PIXI.Text('00000', new PIXI.TextStyle({
            fontSize: 24,
            fontWeight: 'bold',
            fill: "#fdfdfd"
        }));
        player.ViewState.Score.x = 200;
        player.ViewState.Score.y = 15;
        player.ViewState.LayoutSprite = new PIXI.Sprite(this.textures["Layout.png"]);
        player.ViewState.SelectorSprite = new PIXI.Sprite(this.textures["Selector.png"]);
        //Blocks
        player.ViewState.BlocksContainer = new PIXI.Container();
        player.ViewState.BlocksContainer.x = 0;
        player.ViewState.BlocksContainer.y = 0;
        var thing = new PIXI.Graphics();
        thing.x = 0;
        thing.y = 0;
        thing.lineStyle(0);
        thing.beginFill(0x8bc5ff, 0.4);
        thing.moveTo(3, 0);
        thing.lineTo(3, (Constants.MAX_ROWS - 1) * 50 + 106);
        thing.lineTo(Constants.MAX_COLS * 50 + 3, (Constants.MAX_ROWS - 1) * 50 + 106);
        thing.lineTo(Constants.MAX_COLS * 50 + 3, 0);
        player.ViewState.BlocksContainer.mask = thing;
        for (let row = 0; row < Constants.MAX_ROWS; row++) {
            player.ViewState.BlocksSprite[row] = [];
            for (let col = 0; col < Constants.MAX_COLS; col++) {
                player.ViewState.BlocksSprite[row][col] = new PIXI.Sprite(this.textures["BlockBrown.png"]);
                player.ViewState.BlocksSprite[row][col].x = (col) * 50 + 3 + 25;
                player.ViewState.BlocksSprite[row][col].y = ((Constants.MAX_ROWS - 1) - row) * 50 + 106 + 25;
                player.ViewState.BlocksSprite[row][col].visible = false;
                player.ViewState.BlocksSprite[row][col].pivot.set(25, 25);
                player.ViewState.BlocksContainer.addChild(player.ViewState.BlocksSprite[row][col]);
            }
        }
        player.ViewState.BlocksContainer.addChild(player.ViewState.SelectorSprite);
        //Order Of Sprite (z)
        player.ViewState.Container.addChild(thing);
        player.ViewState.Container.addChild(player.ViewState.LayoutSprite);
        player.ViewState.Container.addChild(player.ViewState.BlocksContainer);
        player.ViewState.Container.addChild(player.ViewState.Level);
        player.ViewState.Container.addChild(player.ViewState.Score); //score Should be here
    }
    UpdatePlayerView(player) {
        this.updateSelector(player);
        this.updateBlockStates(player);
        this.updateBlockContainerState(player);
        this.updateLevel(player);
        this.updateScore(player);
    }
    updateSelector(player) {
        player.ViewState.SelectorSprite.x = (player.LogicState.Selector.Col) * 50 + 3;
        player.ViewState.SelectorSprite.y = ((Constants.MAX_ROWS - 1) - player.LogicState.Selector.Row) * 50 + 106;
    }
    updateBlockContainerState(player) {
        player.ViewState.BlocksContainer.y = -player.LogicState.BlockInc;
    }
    updateBlockStates(player) {
        for (let row = 0; row < Constants.MAX_ROWS; row++) {
            for (let col = 0; col < Constants.MAX_COLS; col++) {
                player.ViewState.BlocksSprite[row][col].x = (col) * 50 + 3 + 25;
                player.ViewState.BlocksSprite[row][col].y = ((Constants.MAX_ROWS - 1) - row) * 50 + 106 + 25;
                player.ViewState.BlocksSprite[row][col].rotation = 0;
                player.ViewState.BlocksSprite[row][col].scale.x = 1;
                player.ViewState.BlocksSprite[row][col].scale.y = 1;
                if (player.LogicState.Blocks[row][col].State == BlockState.None ||
                    player.LogicState.Blocks[row][col].State == BlockState.SwitchNone ||
                    player.LogicState.Blocks[row][col].State == BlockState.LockedForFall) {
                    player.ViewState.BlocksSprite[row][col].visible = false;
                }
                else {
                    player.ViewState.BlocksSprite[row][col].visible = true;
                }
                if (player.LogicState.Blocks[row][col].State == BlockState.Switch) {
                    player.ViewState.BlocksSprite[row][col].x += player.LogicState.Ticks.Swap / Constants.TICKS_FOR_SWAP * 50 * (player.LogicState.SwitchLeftBlockCol === col ? 1 : -1);
                }
                if (player.LogicState.Blocks[row][col].State == BlockState.Remove) {
                    player.ViewState.BlocksSprite[row][col].scale.x = (Constants.TICKS_FOR_REMOVING_BLOCKS - player.LogicState.Blocks[row][col].Tick) / Constants.TICKS_FOR_REMOVING_BLOCKS;
                    player.ViewState.BlocksSprite[row][col].scale.y = (Constants.TICKS_FOR_REMOVING_BLOCKS - player.LogicState.Blocks[row][col].Tick) / Constants.TICKS_FOR_REMOVING_BLOCKS;
                    player.ViewState.BlocksSprite[row][col].rotation = player.LogicState.Blocks[row][col].Tick / Constants.TICKS_FOR_REMOVING_BLOCKS * -6.28319;
                }
                if (player.LogicState.Blocks[row][col].State == BlockState.Falling) {
                    player.ViewState.BlocksSprite[row][col].y += (player.LogicState.Blocks[row][col].Tick / Constants.TICKS_FOR_FALL) * (player.LogicState.FallBlocks[row][col].Row - row) * -50;
                }
                //Set Texture
                if (player.LogicState.Blocks[row][col].Color == BlockColor.Green) {
                    player.ViewState.BlocksSprite[row][col].texture = this.textures["BlockGreen.png"];
                }
                else if (player.LogicState.Blocks[row][col].Color == BlockColor.Blue) {
                    player.ViewState.BlocksSprite[row][col].texture = this.textures["BlockBlue.png"];
                }
                else if (player.LogicState.Blocks[row][col].Color == BlockColor.Red) {
                    player.ViewState.BlocksSprite[row][col].texture = this.textures["BlockRed.png"];
                }
                else if (player.LogicState.Blocks[row][col].Color == BlockColor.Purple) {
                    player.ViewState.BlocksSprite[row][col].texture = this.textures["BlockPurple.png"];
                }
                else if (player.LogicState.Blocks[row][col].Color == BlockColor.Yellow) {
                    player.ViewState.BlocksSprite[row][col].texture = this.textures["BlockYellow.png"];
                }
                else if (player.LogicState.Blocks[row][col].Color == BlockColor.Brown) {
                    player.ViewState.BlocksSprite[row][col].texture = this.textures["BlockBrown.png"];
                }
            }
        }
    }
    updateLevel(player) {
        player.ViewState.Level.text = String(player.LogicState.Level);
    }
    updateScore(player) {
        player.ViewState.Score.text = String(player.LogicState.Score);
    }
}
export { View };
//# sourceMappingURL=View.js.map