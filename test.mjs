import {
  QuadTree, QuadTreeSet,
  AABB, Shape,
} from 'fast-quadtree-ts';
// Function to generate a random position within a given range
function getRandomPosition(range) {
  return {
    x: Math.random() * range.x,
    y: Math.random() * range.y,
  };
}

// Function to generate a random movement vector
function getRandomMovement() {
  return {
    x: Math.random() * 10 - 5,
    y: Math.random() * 10 - 5,
  };
}

// Function to perform the movement benchmark
function movementBenchmark(treeSize, objectCount, iterations) {
  const quadTree = new QuadTree({ center: { x: 0, y: 0 }, size: { x: treeSize.x, y: treeSize.y } });

  // Populate the QuadTree with a massive number of objects
  for (let i = 0; i < objectCount; i++) {
    const position = getRandomPosition(treeSize);
    quadTree.add(position, { id: i, position });
  }

  // Simulate movement for a number of iterations
  for (let iteration = 0; iteration < iterations; iteration++) {
    // Move each object in a random direction
    quadTree.forEach((obj) => {
      const movement = getRandomMovement();
      const newPosition = {
        x: obj.position.x + movement.x,
        y: obj.position.y + movement.y,
      };

      // Move the object in the QuadTree
      quadTree.move(obj, newPosition);
    });
  }
}

// Set the parameters for the benchmark
const treeSize = { x: 1000, y: 1000 }; // Adjust the size as needed
const objectCount = 10000; // Adjust the number of objects as needed
const iterations = 100; // Adjust the number of iterations as needed

// Run the benchmark
console.time('movementBenchmark');
movementBenchmark(treeSize, objectCount, iterations);
console.timeEnd('movementBenchmark');
