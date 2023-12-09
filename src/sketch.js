// A program that demonstrates the conservation of KE through a simple collision between ball objects.
let collisionChecker;

function setup() {
  createCanvas(800, 500);
  textFont('Courier New');

  let ball = new Ball(100, 200, 100, createVector(4, -2));

  collisionChecker = new CollisionChecker(ball);
}

function draw() {
  // Dark blue background
  background(0, 0, 50);
  collisionChecker.display();
  collisionChecker.checkCollisions();
}

function mouseClicked() {
  collisionChecker.addBall(new Ball(mouseX, mouseY, random(50, 100), createVector(0, 0)));
}