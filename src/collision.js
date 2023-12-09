class Ball {
  constructor(x, y, mass, velocity) {
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.velocity = velocity;

    // Calculate the initial kinetic energy of the ball
    this.KE = this.mass * velocity.magSq() * 0.5;

    // Color the ball based on its mass (Dark grey to light grey)
    this.color = lerpColor(color(50, 50, 50 + 60), color(200 + 60, 200, 200), this.mass / 150);

    // The radius of the ball is proportional to its mass
    this.radius = this.mass;
  }

  // A function to update and display the ball
  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.KE = this.mass * this.velocity.magSq() * 0.5;

    fill(this.color);
    ellipseMode(RADIUS);
    ellipse(this.x, this.y, this.radius, this.radius);

    // Display their kinetic energy in the center of the ball
    fill(0);
    textAlign(CENTER, CENTER);
    text(`${this.KE.toFixed(2)} J`, this.x, this.y);
  
    // Check for collisions with the walls and account for the radius of the ball
    if (this.x > width - this.radius) {
      this.x = width - this.radius;
      this.velocity.x *= -1;
    } else if (this.x < this.radius) {
      this.x = this.radius;
      this.velocity.x *= -1;
    }

    if (this.y > height - this.radius) {
      this.y = height - this.radius;
      this.velocity.y *= -1;
    } else if (this.y < this.radius) {
      this.y = this.radius;
      this.velocity.y *= -1;
    }
  }

  // A function to check for collisions between two balls
  checkCollision(other, drag = 0) {
    // Calculate the distance between the two balls
    let distance = dist(this.x, this.y, other.x, other.y); 

    // If the distance is less than the sum of the radii, then the balls are colliding
    if (distance < this.radius + other.radius) {
      // Using the conservation of momentum, 
      // m1v1 + m2v2 = m1v1' + m2v2'

      // And assuming the collision is elastic (drag = 0), the total kinetic energy of the system is conserved
      // 1/2m1v1^2 + 1/2m2v2^2 = 1/2m1v1'^2 + 1/2m2v2'^2

      // Solving the system of equations to find the new velocities,
      // we get v1' = (m1 - m2)/(m1 + m2) * v1 + 2m2/(m1 + m2) * v2
      // and v2' = 2m1/(m1 + m2) * v1 + (m2 - m1)/(m1 + m2) * v2

      let collisionNormal = createVector(this.x - other.x, this.y - other.y);
      collisionNormal.normalize();

      let collisionTangent = createVector(-collisionNormal.y, collisionNormal.x);

      let parallelV1 = p5.Vector.mult(collisionNormal, p5.Vector.dot(this.velocity, collisionNormal));
      let parallelV2 = p5.Vector.mult(collisionNormal, p5.Vector.dot(other.velocity, collisionNormal));
      let orthoV1 = p5.Vector.mult(collisionTangent, p5.Vector.dot(this.velocity, collisionTangent));
      let orthoV2 = p5.Vector.mult(collisionTangent, p5.Vector.dot(other.velocity, collisionTangent));

      // Calculate the new velocities of the balls
      // Only the parallel components of the velocities are affected by the collision
      
      // v1' = (m1 - m2)/(m1 + m2) * v1 + 2m2/(m1 + m2) * v2
      let newParallelV1 = p5.Vector.mult(parallelV1, (this.mass - other.mass) / (this.mass + other.mass));
      newParallelV1.add(p5.Vector.mult(parallelV2, 2 * other.mass / (this.mass + other.mass)));

      // v2' = 2m1/(m1 + m2) * v1 + (m2 - m1)/(m1 + m2) * v2
      let newParallelV2 = p5.Vector.mult(parallelV1, 2 * this.mass / (this.mass + other.mass));
      newParallelV2.add(p5.Vector.mult(parallelV2, (other.mass - this.mass) / (this.mass + other.mass)));

      const newVelocity = p5.Vector.add(newParallelV1, orthoV1);
      const newVelocityOther = p5.Vector.add(newParallelV2, orthoV2);

      // Ensure that the balls will not infinitely collide with each other by moving them away from each other
      const overlap = this.radius + other.radius - distance;
      const overlapVector = p5.Vector.mult(collisionNormal, overlap);

      this.x += overlapVector.x * 0.5;
      this.y += overlapVector.y * 0.5;

      // Update the velocities of the balls
      this.velocity = newVelocity.mult(1 - drag);
      other.velocity = newVelocityOther.mult(1 - drag);
    }
  }
}

class CollisionChecker {
  constructor(...balls) {
    this.balls = balls;
  }

  addBall(ball) {
    this.balls.push(ball);
  }

  displayEquations() {
    // Display the equation of the sum of the kinetic energies of the balls
    const KE = this.balls.map(ball => ball.KE);
    const sumKE = KE.reduce((a, b) => a + b, 0);

    const label = `Conservation of KE:\n`
    const equation = KE.map((ke) => `${ke.toFixed(2)} J`).join(' + ') + ` = ${sumKE.toFixed(2)} J`;
    
    fill(255);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(label + equation, width * 0.5, 50);
  }

  display() {
    this.displayEquations();

    this.balls.forEach(ball => ball.update());
  }

  checkCollisions() {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        this.balls[i].checkCollision(this.balls[j]);
      }
    }
  }
}