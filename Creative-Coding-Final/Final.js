let video;
let prevFrame;
let threshold = 30;  // motion detection threshold per pixel
let circleColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(160, 120);
  video.hide();

  textSize(16);
  textAlign(RIGHT, TOP);
  noStroke();
  fill(0);
}

function draw() {
  let baseColor = getColorByTime();
  background(baseColor);

  // Prepare circle color: darker shade of base color
  circleColor = color(
    max(red(baseColor) * 0.6, 0),
    max(green(baseColor) * 0.6, 0),
    max(blue(baseColor) * 0.6, 0),
    180
  );

  video.loadPixels();

  if (video.pixels.length > 0) {
    if (prevFrame) {
      drawMotionCircles(video.pixels, prevFrame, video.width, video.height);
    }
    prevFrame = video.pixels.slice();
  }

  drawDigitalClock();
}

// Draw glitchy layered circles where motion is detected
function drawMotionCircles(currPixels, prevPixels, w, h) {
  noStroke();
  fill(circleColor);

  // We'll draw circles at motion pixels with some layered offsets for glitch effect
  // Scale webcam coords to canvas size
  let scaleX = width / w;
  let scaleY = height / h;

  // For performance, sample every few pixels
  let step = 4;

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      let i = 4 * (y * w + x);

      let rDiff = abs(currPixels[i] - prevPixels[i]);
      let gDiff = abs(currPixels[i + 1] - prevPixels[i + 1]);
      let bDiff = abs(currPixels[i + 2] - prevPixels[i + 2]);
      let diff = (rDiff + gDiff + bDiff) / 3;

      if (diff > threshold) {
        // Base circle position
        let cx = x * scaleX;
        let cy = y * scaleY;

        // Draw layered circles with small offsets for glitch effect
        let offsets = [
          { x: 0, y: 0, alphaMult: 1 },
          { x: 3, y: 1, alphaMult: 0.6 },
          { x: -3, y: -2, alphaMult: 0.4 },
        ];

        offsets.forEach(o => {
          fill(red(circleColor), green(circleColor), blue(circleColor), alpha(circleColor) * o.alphaMult);
          circle(cx + o.x, cy + o.y, step * 1.5);
        });
      }
    }
  }
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
