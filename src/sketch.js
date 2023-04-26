/**
  Code: Property of Zoe Valladares
  Photographs: Property of Zoe Valladares
  Audio: Property of Zoe Valladares
  
  Contributors: Ian McDermott (https://github.com/ianmcdermott)
*/


// Physics Engine
// import shiffman.box2d.*;
// import org.jbox2d.common.*;
// import org.jbox2d.dynamics.joints.*;
// import org.jbox2d.collision.shapes.*;
// import org.jbox2d.collision.shapes.Shape;
// import org.jbox2d.common.*;
// import org.jbox2d.dynamics.*;
// import org.jbox2d.dynamics.contacts.*;

// Sound and Audio Tools
// import ddf.minim.*;
// Minim minim;
// AudioPlayer player;

// Video and Motion Detection Tools
// import processing.video.*;
// Capture video;

PImage img;
var imageScale = 3;
var cols, rows;
var box2d = Box2D.Box2DProcessing;
var box = Box;
var spring = Spring;
ArrayList < Particle > particles;
PImage[] imgs = new PImage[20];
int imgsIndex = 0;
AudioPlayer[] players = new AudioPlayer[20];

float xoff = 0;
float yoff = 1000;

PImage prev;
float threshold = 25;
float motionX = 0;
float motionY = 0;
float lerpX = 0;
float lerpY = 0;

int frameCounter = 0;
float lerpX2, lerpY2;


function setup() {
  minim = new Minim(this);
  size(533, 800);
  String[] cameras = Capture.list();
  printArray(cameras);

  /**
    * Cycle through the camera list to choose one that matches:
    * 640 x 360
    * If none are found choose the default camera.
  */
  int cameraCount = 0;
  while (cameraCount < cameras.length && video == null) {
    if (cameras[cameraCount].contains("size=640x360,fps=15")) {
      println("Found size=640x360, assigning");
      video = new Capture(this, cameras[cameraCount]);
    }
    cameraCount++;
  } 
  if (video == null) {
    println("Default camera");
    video = new Capture(this, cameras[0]);
  }
  video.start();
  prev = createImage(video.height, video.width, RGB);

  noCursor();
  
  /**
    * Initialize the visuals and sound:
    * Images from ../images/pngx800
    * Audio from ../AUDIO2/
    *
    * Images are compressed to 533x800 px for efficiency
  */
  for (int i = 0; i < 20; i++) {
    imgs[i] = loadImage("../images/pngx800/" + i + ".png");
    players[i] = minim.loadFile("../AUDIO2/" + i + ".mp3");
  }


  /**
    * Initialize:
    * Physics
    * Invisible box for collision
  */
  cols = width / imageScale;
  rows = height / imageScale;
  box2d = new Box2DProcessing(this);
  box2d.createWorld();
  box2d.listenForCollisions();
  box = new Box(width / 2, height / 2);
  particles = new ArrayList < Particle > ();
  box2d.setGravity(0, 0);
  spring = new Spring();
  spring.bind(width / 2, height / 2, box);
}


function captureEvent(Capture video) {
  prev.copy(video, 0, 0, video.width, video.height, 0, 0, prev.width, prev.height);
  prev.updatePixels();
  video.read();
}


function draw() {
  background(0);
  video.loadPixels();
  prev.loadPixels();
  threshold = 50;
  int cnt = 0;
  float avgX = 0;
  float avgY = 0;
  loadPixels();
  // Begin loop to walk through every pixel
  for (int x = 0; x < video.width; x++) {
    for (int y = 0; y < video.height; y++) {
      int loc = x + y * video.width;
      color currentColor = video.pixels[loc];
      
      int r1 = (currentColor >> 16) & 0xFF;  // Faster way of getting red(argb)
      int g1 = (currentColor >> 8) & 0xFF;   // Faster way of getting green(argb)
      int b1 = currentColor & 0xFF;          // Faster way of getting blue(argb)
      
      color prevColor = prev.pixels[loc];
      
      int r2 = (prevColor >> 16) & 0xFF;  // Faster way of getting red(argb)
      int g2 = (prevColor >> 8) & 0xFF;   // Faster way of getting green(argb)
      int b2 = prevColor & 0xFF;          // Faster way of getting blue(argb)
      
      float d = distSq(r1, g1, b1, r2, g2, b2);
      if (d > threshold * threshold) {
        avgX += width - x;
        avgY += y;
        cnt++;
      } else {
      }
    }
  }
  //println("Particle Size: " +particles.size() + " avg: " + avgX + " : " + avgY);

  updatePixels();
  
  if (cnt > 800) {
    motionX = avgX / cnt;
    motionY = avgY / cnt;
  }
  lerpX = lerp(lerpX, motionX, 0.1);
  lerpY = lerp(lerpY, motionY, 0.1);
  
  /**
    * Ian McDermott:
    * For some reason the collision object 
    * seemed to be hanging out mostly on the left side,
    * by doubling the width in the map statement below 
    * (533*2), it seems more evenly distributed
  */
  lerpX2 = map(lerpX, 0, 640, 0, 533*2);
  lerpY2 = map(lerpY, 0, 360, 0, 800);

  box.body.setLinearVelocity(new Vec2(lerpX, lerpY));

  playAudio();

  if (particles.size() < 2) {
    for (int i = 0; i < cols; i += 2) {   
      for (int j = 0; j < rows; j += 2) {    
        int x = i * imageScale;
        int y = j * imageScale;
        color c = imgs[imgsIndex].get(x, y);
        particles.add(new Particle(x, y, imageScale, c));
        //println(counter + " :: "+ x+y*width + " :: "+ i+j*width);
      }
    }
  }
  
  box2d.step();

  int counter = 0;
  if (cnt > 200) {
    spring.update(lerpX2, lerpY2);
  }
  
  for (int i = particles.size() - 1; i >= 0; i--) {
    Particle p = particles.get(i);
    p.display();
    
    if (!p.origin()) {
      counter++;
    }
  }
  if (counter > particles.size() * 0.99) {
    for (Particle p : particles) {
      p.attract();
    }
  }
  //println("FR" + ":" + frameRate + ": " + frameCount);
  //println(counter);
  //println(particles.size() - counter);

  if (!players[imgsIndex].isPlaying()) {
    updateColors();
  }
}



float distSq(float x1, float y1, float z1, float x2, float y2, float z2) {
  float d = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) +(z2-z1)*(z2-z1);
  return d;
}

function updateColors() {
  players[imgsIndex].rewind();
  
  players[imgsIndex].pause();
  imgsIndex++;
  if (imgsIndex > 19) {
    imgsIndex = 0;
  }
  
  players[imgsIndex].play();
  
  for (int i = particles.size()-1; i >= 0; i--) {
    particles.get(i).killBody();
    particles.remove(i);
  }
  for (int i = 0; i < cols; i += 2) {    
    for (int j = 0; j < rows; j += 2) {    
      int x = i * imageScale;
      int y = j * imageScale;
      color c = imgs[imgsIndex].get(x, y);
      particles.add(new Particle(x, y, imageScale, c));
    }
  }
  players[imgsIndex].play();
}
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// let img
// let num = 0
// function setup() {
//     // 533 * 800 scaled down by .2
//     createCanvas(427, 640);
//     img = loadImage("../assets/" + num + ".png");
// }
  
// function draw() {
//     background(250, 234, 214);
//     image(img, 0, 0, 427, 640);
//     console.log("FORWARD num is: " + num);
// }

// function forwardButton() {
//     if (num == 19) {
//         num = -1;
//     }
//     num++;
//     img = loadImage("../assets/" + num + ".png");
//     image(img, 0, 0, 427, 640);
// }

// function backButton() {
//     if (num == 0) {
//         num = 20
//     }
//     num--;
//     img = loadImage("../assets/" + num + ".png");
//     image(img, 0, 0, 427, 640);
// }