let img
let num = 0
function setup() {
    // 533 * 800 scaled down by .2
    createCanvas(427, 640);
    img = loadImage("../assets/" + num + ".png");
}
  
function draw() {
    background(250, 234, 214);
    image(img, 0, 0, 427, 640);
    console.log("FORWARD num is: " + num);
}

function forwardButton() {
    if (num == 19) {
        num = -1;
    }
    num++;
    img = loadImage("../assets/" + num + ".png");
    image(img, 0, 0, 427, 640);
}

function backButton() {
    if (num == 0) {
        num = 20
    }
    num--;
    img = loadImage("../assets/" + num + ".png");
    image(img, 0, 0, 427, 640);
}