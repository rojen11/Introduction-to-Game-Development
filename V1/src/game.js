import {
  init,
  GameLoop,
  setImagePath,
  load,
  imageAssets,
  SpriteSheet,
  Sprite,
  keyPressed,
  initKeys,
  collides,
} from "kontra";

const { canvas, context } = init("game");
initKeys();

setImagePath("assets");

load(
  "fly_cycle.png",
  "background.jpg",
  "ground.jpg",
  "pipe_down.png",
  "pipe_up.png"
)
  .then(main)
  .catch((e) => console.error(e));

const SCALE = 1.8;

function main() {

  const flyCycle = SpriteSheet({
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

  const background = Sprite({
    image: imageAssets["background"],
    x: 0,
    y: 0,
    scaleX: SCALE,
    scaleY: SCALE,
  });

  const ground1 = Sprite({
    type: "ground",
    image: imageAssets["ground"],
    x: 0,
    y: canvas.height - imageAssets["ground"].height * SCALE,
    scaleX: SCALE,
    scaleY: SCALE,
    dx: -5,
    update: function () {
      if (this.x < -canvas.width) {
        this.x = canvas.width;
      }
      this.advance();
    },
  });

  const ground2 = Sprite({
    type: "ground",
    image: imageAssets["ground"],
    x: canvas.width,
    y: canvas.height - imageAssets["ground"].height * SCALE,
    scaleX: SCALE,
    scaleY: SCALE,
    dx: -5,
    update: function () {
      if (this.x < -canvas.width) {
        this.x = canvas.width;
      }
      this.advance();
    },
  });

  function generatePipe(y) {
    const pipeDown = Sprite({
      type: "pipe",
      image: imageAssets["pipe_down"],
      x: canvas.width,
      y: -imageAssets["pipe_down"].height * SCALE + y,
      dx: -5,
      scaleX: SCALE,
      scaleY: SCALE,
    });
    const pipeUp = Sprite({
      type: "pipe",
      image: imageAssets["pipe_up"],
      x: canvas.width,
      y: y + 0.2 * canvas.height,
      dx: -5,
      scaleX: SCALE,
      scaleY: SCALE,
    });

    return [pipeDown, pipeUp];
  }

  let allowKeys = true;

  const player = Sprite({
    animations: flyCycle.animations,
    x: canvas.width / 2,
    y: canvas.height / 2,
    scaleX: SCALE,
    scaleY: SCALE,
    update: function () {
      this.ddy = 0.25;

      if (this.y > canvas.height - this.height) {
        this.ddy = 0;
        this.dy = 0;
      }

      if (keyPressed("space") && allowKeys) {
        allowKeys = false;
        setTimeout(() => (allowKeys = true), 100);
        this.ddy = 0;
        this.dy = -5;
      }

      this.advance();
    },
  });

  let sprites = [background, ground1, ground2, player];

  const groundOffset = imageAssets["ground"].height * SCALE;

  const max = canvas.height - groundOffset - 0.2 * canvas.height; // size of screen to render pipe - the gap between the pipe
  const min = 20;

  let interval = setInterval(() => {

    const pipes = generatePipe(
      Math.random() *
        (max - min) + min
    );
    sprites.push(...pipes);
  }, 2000);


  const loop = GameLoop({
    update: function () {
      sprites.forEach((s) => s.update());

      const isColliding = sprites
        .filter((s) => s.type == "ground" || s.type == "pipe")
        .some((s) => collides(player, s));

      if (isColliding) {
        clearInterval(interval);
        loop.stop();
      }
    },
    render: function () {
      // to hide the pipe behind the ground
      sprites.filter(s => s.type != "ground").forEach((s) => s.render());
      sprites.filter(s => s.type == "ground").forEach((s) => s.render());
    },
  });

  loop.start();
}
