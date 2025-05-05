let video;
let prevFrame;
let threshold = 30;

const VIDEO_W = 160;
const VIDEO_H = 120;
const ASPECT_RATIO = VIDEO_W / VIDEO_H;

let particles = [];

let circleColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(VIDEO_W, VIDEO_H);
  video.hide();

  textSize(16);
  textAlign(RIGHT, TOP);
  noStroke();
  fill(0);

  // Initialize prevFrame after delay to avoid startup noise
  setTimeout(() => {
    video.loadPixels();
    if (video.pixels.length > 0) {
      prevFrame = video.pixels.slice();
    }
  }, 1000);
}

function draw() {
  let baseColor = getColorByTime();
  background(baseColor);

  circleColor = color(
    max(red(baseColor) * 0.6, 0),
    max(green(baseColor) * 0.6, 0),
    max(blue(baseColor) * 0.6, 0),
    180
  );

  video.loadPixels();

  if (video.pixels.length > 0 && prevFrame) {
    // Clear old particles for fresh trace each frame
    particles = [];
    spawnParticlesFromMotion(video.pixels, prevFrame, VIDEO_W, VIDEO_H);
    prevFrame = video.pixels.slice();
  }

  updateAndDrawParticles();

  drawDigitalClock();
}

function spawnParticlesFromMotion(currPixels, prevPixels, w, h) {
  let { drawWidth, drawHeight, offsetX, offsetY } = getDrawingArea();

  let scaleX = drawWidth / w;
  let scaleY = drawHeight / h;

  let step = 2; // dense sampling for close circles

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      let i = 4 * (y * w + x);

      let rDiff = abs(currPixels[i] - prevPixels[i]);
      let gDiff = abs(currPixels[i + 1] - prevPixels[i + 1]);
      let bDiff = abs(currPixels[i + 2] - prevPixels[i + 2]);
      let diff = (rDiff + gDiff + bDiff) / 3;

      if (diff > threshold) {
        let px = offsetX + x * scaleX;
        let py = offsetY + y * scaleY;

        particles.push(new Particle(px, py));
      }
    }
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.draw();

    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.origin = createVector(x, y);
    this.pos = createVector(x, y);
    this.angle = random(TWO_PI);
    this.radius = random(2, 6);
    this.angularSpeed = random(0.08, 0.15); // faster orbit speed
    this.size = random(5, 9);
    this.alpha = 255;
    this.fadeSpeed = random(5, 8); // faster fade
    this.drift = p5.Vector.random2D().mult(random(0.3, 0.7)); // subtle random drift
  }

  update() {
    this.angle += this.angularSpeed;
    this.pos.x = this.origin.x + cos(this.angle) * this.radius + this.drift.x;
    this.pos.y = this.origin.y + sin(this.angle) * this.radius + this.drift.y;

    this.alpha -= this.fadeSpeed;
    this.alpha = max(this.alpha, 0);
  }

  draw() {
    fill(red(circleColor), green(circleColor), blue(circleColor), this.alpha * 0.7);
    noStroke();
    circle(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

function getDrawingArea() {
  let canvasRatio = width / height;
  let drawWidth, drawHeight;
  if (canvasRatio > ASPECT_RATIO) {
    drawHeight = height;
    drawWidth = height * ASPECT_RATIO;
  } else {
    drawWidth = width;
    drawHeight = width / ASPECT_RATIO;
  }
  return { drawWidth, drawHeight, offsetX: (width - drawWidth) / 2, offsetY: (height - drawHeight) / 2 };
}

function getColorByTime() {
  let h = hour();
  let m = minute();
  let currentTime = h + m / 60;

  if (currentTime >= 6 && currentTime < 10) {
    return color(64, 64, 64);
  } else if (currentTime >= 10 && currentTime < 14.5) {
    return color(255, 250, 205);
  } else if (currentTime >= 14.5 && currentTime < 17.5) {
    return color(204, 204, 0);
  } else if (currentTime >= 17.5 && currentTime < 19) {
    return lerpColor(color(0, 0, 255), color(255), map(currentTime, 17.5, 19, 0, 1));
  } else {
    return color(255);
  }
}

function drawDigitalClock() {
  fill(0);
  let h = nf(hour(), 2);
  let m = nf(minute(), 2);
  let s = nf(second(), 2);
  text(`${h}:${m}:${s}`, width - 20, 20);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
