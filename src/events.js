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
    for (let p of points) {
      p.visible = !p.visible;
    }
  }
});