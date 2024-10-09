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


let drawSurfaceFlag = true

function drawSurface() {
  map = null
  if(drawSurfaceFlag) {
    map = new THREE.TextureLoader().load('../../assets/elevation_map.png');
  } else {
    map = new THREE.TextureLoader().load('../../assets/earth.png');
  }
  drawSurfaceFlag = !drawSurfaceFlag

  Earth.getInstance().earth.material.map = map
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
