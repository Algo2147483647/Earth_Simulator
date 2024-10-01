let scene, camera, renderer, sphere, controls, latLongLines, coordinates = [], points = [];

// Set the initial texture
const textureA = new THREE.TextureLoader().load('../assets/earth.png');
const textureB = new THREE.TextureLoader().load('../assets/elevation_map.png');
let currentTexture = textureA;

fetch('../assets/points2.txt')
  .then(response => response.text())
  .then(data => {
    // 将文件中的数据转换为数组
    let lines = data.split('\n');
    for (let line of lines) {
      let parts = line.split(',');
      if (parts.length === 2) {
        let lat = parseFloat(parts[0]);
        let lon = parseFloat(parts[1]);
        coordinates.push([lat, lon]);
      }
    }

    // 在地球上绘制点
    for (let coord of coordinates) {
      let phi = (90 - coord[0]) * (Math.PI / 180);
      let theta = (-coord[1]) * (Math.PI / 180);

      let pointGeometry = new THREE.SphereGeometry(0.0050, 16, 16);
      let pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // 红色
      let point = new THREE.Mesh(pointGeometry, pointMaterial);

      point.position.x = 2 * Math.sin(phi) * Math.cos(theta);
      point.position.y = 2 * Math.cos(phi);
      point.position.z = 2 * Math.sin(phi) * Math.sin(theta);

      // 将点添加到场景中
      scene.add(point);
      points.push(point)
    }
  }
  )

function initThreeJs() {
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function init() {
  initThreeJs();
  // Create sphere geometry and material with texture
  const geometry = new THREE.SphereGeometry(2, 64, 64);
  const texture = currentTexture;
  const material = new THREE.MeshBasicMaterial({
    map: texture
  });

  // Create atmospheric haze
  const atmosphereGeometry = new THREE.SphereGeometry(2.02, 64, 64);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x6699ff, // Light blue color
    transparent: true,
    opacity: 0.1, // Adjust opacity as needed for the desired effect
    side: THREE.BackSide
  });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);

  // Create sphere mesh
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // 绘制经纬度线
  latLongLines = new THREE.Group();

  for (let lat = -90; lat <= 90; lat += 10) { // 精度为1度
    const points = [];
    for (let long = -180; long <= 180; long += 1) { // 精度为1度
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(long);
      points.push(new THREE.Vector3().setFromSphericalCoords(2, phi, theta));
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xAAAAAA, shading: THREE.SmoothShading });
    const line = new THREE.LineLoop(lineGeometry, lineMaterial);
    latLongLines.add(line);
  }

  for (let long = -180; long <= 180; long += 10) { // 精度为1度
    const points = [];
    for (let lat = -90; lat <= 90; lat += 1) { // 精度为1度
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(long);
      points.push(new THREE.Vector3().setFromSphericalCoords(2, phi, theta));
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xAAAAAA, shading: THREE.SmoothShading });
    const line = new THREE.LineLoop(lineGeometry, lineMaterial);
    latLongLines.add(line);
  }
  latLongLines.visible = false
  scene.add(latLongLines);

  // Create and add stars to the scene
  createStars();

  // Enable controls for interaction
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.rotateSpeed = 0.5;
  controls.enableZoom = true;  // 启用滑轮放缩

  // Start animation
  animate();

  // Fade in the sphere only
  sphere.material.transparent = true;
  sphere.material.opacity = 0;
  fadeIn(sphere.material, 3000); // Fade-in the sphere after 3 seconds

  // Fade out the overlay after 4 seconds
  fadeOutOverlay('overlay', 3000);
}

function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff
  });

  const stars = [];
  for (let i = 0; i < 2000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    stars.push(x, y, z);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);
}

function animate() {
  // Adjust rotate speed based on zoom level
  controls.rotateSpeed = 0.15;

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}


function fadeIn(material, duration) {
  let opacity = 0;
  const start = performance.now();

  function fadeInAnimation(time) {
    opacity = (time - start) / duration;
    if (opacity >= 1) {
      opacity = 1;
      material.opacity = 1; // Set material opacity explicitly
      return;
    }
    material.opacity = opacity;
    requestAnimationFrame(fadeInAnimation);
  }

  requestAnimationFrame(fadeInAnimation);
}

function fadeOutOverlay(overlayId, delay) {
  setTimeout(() => {
    const overlay = document.getElementById(overlayId);
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none'; // Allow interaction with elements beneath the overlay
  }, delay);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


