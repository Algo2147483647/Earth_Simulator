window.addEventListener('resize', onWindowResize);

// Listen for keydown events
window.addEventListener('keydown', function(event) {

  if (event.key === 'a' || event.key === 'A') {
    // Swap the texture
    currentTexture = currentTexture === textureA ? textureB : textureA;
    sphere.material.map = currentTexture;
    sphere.material.needsUpdate = true;  // This line is important to update the texture
  }

  if (event.key === 'l' || event.key === 'L') {
    latLongLines.visible = !latLongLines.visible; // 切换经纬度线的可见性
  }

  if (event.key === 'p' || event.key === 'P') {
    resp = GetVisitedPoints();
    resp
    .then(points => {
        Points.length = 0;
        DrawPointInEarth(points); // 调用绘制函数
    })
    .catch(error => {
        console.error('DrawPointInEarth Error:', error);
    });
  }

  if (event.key === 't' || event.key === 'T') {
    resp = GetVisitedTree();
    resp
    .then(edges => {
        console.log(edges);
        DrawLinesInEarth(edges); // 调用绘制函数
    })
    .catch(error => {
        console.error('DrawPointInEarth Error:', error);
    });
  }
});