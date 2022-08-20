import {
  init,
  Sprite,
  GameLoop,
  load,
  SpriteSheet,
  setImagePath,
  imageAssets,
  initKeys,
  keyPressed,
  collides,
  Scene,
  initPointer,
  emit,
  on,
  track,
  Text,
} from "kontra";

import { zzfx } from "zzfx";

const { canvas } = init("game");
initKeys();
initPointer();

// load all assets
setImagePath("assets");
load(
  "fly_cycle.png",
  "background.jpg",
  "ground.jpg",
  "pipe_up.png",
  "pipe_down.png",
  "button.png"
)
  .then(main)
  .catch((err) => console.error(err));

function main() {
  const SCALE = 1.8;
  const groundOffset = imageAssets["ground"].height * SCALE;

  let allowKey = true;
  let score_value = 0;


  const flyCycleSheet = SpriteSheet({
    image: imageAssets["fly_cycle"],
    frameWidth: 17,
    frameHeight: 12,
    animations: {
      fly: {
        frames: "0..2",
        frameRate: 15,
      },
    },
  });

  const score = Text({
    text: score_value,
    font: "32px Arial",
    color: "white",
    x: canvas.width / 2,
    y: canvas.height / 4,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: "center",
    update() {
      this.text = score_value;
    },
  });

  const player = Sprite({
    animations: flyCycleSheet.animations,
    scaleX: 1.5,
    scaleY: 1.5,
    x: canvas.width / 4,
    y: canvas.height / 3,
    update() {
      this.ddy = 0.25;

      if (keyPressed("space") && allowKey) {
        zzfx(
          ...[
            0.5,
            0.1,
            174.6141,
            0.11,
            ,
            0.16,
            4,
            3,
            15.9,
            ,
            8650,
            0.16,
            -0.02,
            3.1,
            79,
            0.2,
            ,
            0.5,
            0.05,
          ]
        ); // Jump 8

        allowKey = false;
        setTimeout(() => (allowKey = true), 200);
        this.ddy = 0;
        this.dy = -5;
      }

      if (this.ddy + this.dy > 6) {
        this.ddy = 0;
      }

      this.advance();
    },
  });

  const background = Sprite({
    image: imageAssets["background"],
    x: 0,
    y: 0,
    scaleX: SCALE,
    scaleY: SCALE,
  });


  function createGround(x) {
    return Sprite({
      type: "ground",
      image: imageAssets["ground"],
      x: x,
      y: canvas.height - groundOffset,
      scaleX: SCALE,
      scaleY: SCALE,
      dx: -2,
      update() {
        if (this.x < -canvas.width) {
          this.x = canvas.width;
        }
        this.advance();
      },
    });
  }

  const ground1 = createGround(0);
  const ground2 = createGround(canvas.width);

  function createPipe(face, y) {
    return Sprite({
      type: "pipe",
      image: imageAssets[face],
      x: canvas.width,
      y,
      dx: -2,
      ttl: canvas.width,
      scaleX: SCALE,
      scaleY: SCALE,
      update() {
        if (face == "up") {
          if (this.x == player.x) {
            zzfx(
              ...[
                1.61,
                ,
                1323,
                0.02,
                0.22,
                0.03,
                4,
                0.1,
                ,
                4.5,
                ,
                ,
                0.15,
                ,
                ,
                0.4,
                0.01,
                0.28,
                0.04,
                0.31,
              ]
            ); // Random 0
            score_value++;
          }
        }
        this.advance();
      },
    });
  }

  function generatePipe() {
    const topY = Math.floor(
      Math.random() * (canvas.height - groundOffset * SCALE - 20)
    );

    const pipe_down = createPipe(
      "pipe_down",
      topY - imageAssets["pipe_down"].height * SCALE
    );
    const pipe_up = createPipe("pipe_up", topY + 0.2 * canvas.height);

    return [pipe_up, pipe_down];
  }

  let sprites = [background, player, ground1, ground2, score];

  let gameover = false;

  let interval;

  const gameScene = Scene({
    id: "game",
    update() {
      sprites = sprites.filter((s) => s.ttl != 0);
      sprites.forEach((s) => s.update());

      const isColliding = sprites
        .filter((s) => s.type == "ground" || s.type == "pipe")
        .some((s) => collides(s, player));

      if (isColliding && !gameover) {
        gameover = true;
        zzfx(
          ...[
            ,
            0,
            0,
            ,
            0.07,
            0.02,
            3,
            2.95,
            2,
            ,
            -200,
            ,
            0.38,
            3.3,
            -20,
            -1,
            0.16,
            1.5,
            0.02,
          ]
        ); // death sound not the best
        clearInterval(interval);
        loop.stop();
        emit("GameOver");
      }
    },
    render() {
      sprites.filter((s) => s.type != "ground").forEach((s) => s.render());

      sprites.filter((s) => s.type == "ground").forEach((s) => s.render());
    },
  });

  const button = Sprite({
    image: imageAssets["button"],
    x: canvas.width / 2 - imageAssets["button"].width / 2,
    y: canvas.height / 2 - imageAssets["button"].height / 2,

    onDown: function () {
      emit("start");
    },
  });

  track(button);

  const menuScene = Scene({
    id: "menu",
    update() {
      if (keyPressed("space")) {
        emit("start");
      }
    },
  });

  menuScene.add([
    background,
    createGround(0),
    createGround(canvas.width),
    button,
    player,
  ]);

  let activeScene = menuScene;

  const loop = GameLoop({
    update: function (dt) {
      activeScene.update();
    },

    render: function () {
      activeScene.render();
    },
  });

  loop.start();

  on("start", function () {
    activeScene.destroy();
    activeScene = gameScene;
    interval = setInterval(() => sprites.push(...generatePipe()), 1500);
  });
}

on("GameOver", function () {
  main();
});
