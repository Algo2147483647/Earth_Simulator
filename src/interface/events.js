window.addEventListener('resize', onWindowResize);

function onWindowResize() {
  Visualizer.getInstance().camera.aspect = window.innerWidth / window.innerHeight;
  Visualizer.getInstance().camera.updateProjectionMatrix();
  Visualizer.getInstance().renderer.setSize(window.innerWidth, window.innerHeight);
  Visualizer.getInstance().renderer.render(Visualizer.getInstance().scene, Visualizer.getInstance().camera);
}

// Key event handler
window.addEventListener('keydown', handleKeydown);

// Handle keydown events
function handleKeydown(event) {
  const key = event.key.toLowerCase();

  switch (key) {
    case 'a':
      drawSurface();
      break;
    case 'l':
      toggleLatLongLines();
      break;
    case 'p':
      drawVisitedPoints();
      break;
    case 't':
      drawVisitedTree();
      break;
    default:
      break;
  }
}

// Swap the texture between textureA and textureB
function drawSurface() {
  Earth.getInstance().earth.material.map = new THREE.TextureLoader().load('../../assets/elevation_map.png');
  Earth.getInstance().earth.material.needsUpdate = true;  // Ensure material is updated
}

// Toggle visibility of latitude and longitude lines
function toggleLatLongLines() {
  Earth.getInstance().latLonLines.visible = !Earth.getInstance().latLonLines.visible;
}

// Fetch and draw visited points
function drawVisitedPoints() {
  GetVisitedPoints()
    .then(points => {
      Earth.getInstance().drawPoints(points)
    })
    .catch(error => {
      console.error('Error drawing points:', error);
    });
}

// Fetch and draw visited tree structure
function drawVisitedTree() {
  GetVisitedTree()
    .then(edges => {
      console.log(edges);
      Earth.getInstance().drawLines(edges)
    })
    .catch(error => {
      console.error('Error drawing tree:', error);
    });
}
