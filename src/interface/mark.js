
function DrawPointInEarth(points) {
    for (let p of points) {
      let phi = (90 - p[0]) * (Math.PI / 180);
      let theta = (-p[1]) * (Math.PI / 180);

      let pointGeometry = new THREE.SphereGeometry(0.0050, 16, 16);
      let pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // 红色
      let point = new THREE.Mesh(pointGeometry, pointMaterial);

      point.position.x = 2 * Math.sin(phi) * Math.cos(theta);
      point.position.y = 2 * Math.cos(phi);
      point.position.z = 2 * Math.sin(phi) * Math.sin(theta);

      // 将点添加到场景中
      scene.add(point);
      Points.push(point)
    }
}

function DrawLinesInEarth(lines) {
    const linesGroup = new THREE.Group();
    const radius = 2; // Earth radius in spherical coordinates
    const material = new THREE.LineBasicMaterial({ color: 0xAAAAAA });

    // Loop through each line definition in the array
    lines.forEach(([st_lat, st_long, ed_lat, ed_long]) => {
        const points = [];

        // Convert start point (latitude, longitude) to spherical coordinates
        const st_phi = THREE.MathUtils.degToRad(90 - st_lat); // Latitude to polar angle
        const st_theta = THREE.MathUtils.degToRad(st_long); // Longitude to azimuthal angle
        const startPoint = new THREE.Vector3().setFromSphericalCoords(radius, st_phi, st_theta);
        points.push(startPoint);

        // Convert end point (latitude, longitude) to spherical coordinates
        const ed_phi = THREE.MathUtils.degToRad(90 - ed_lat); // Latitude to polar angle
        const ed_theta = THREE.MathUtils.degToRad(ed_long); // Longitude to azimuthal angle
        const endPoint = new THREE.Vector3().setFromSphericalCoords(radius, ed_phi, ed_theta);
        points.push(endPoint);

        // Create the line geometry and add it to the group
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, material);
        linesGroup.add(line);
    });

    // Add the group to the scene
    scene.add(linesGroup);
}


function DrawLongitudeLatitudeLinesInEarth() {
    const latLongLines = new THREE.Group();
    const radius = 2; // Earth radius in spherical coordinates
    const material = new THREE.LineBasicMaterial({ color: 0xAAAAAA });

    // Create latitude lines
    for (let lat = -90; lat <= 90; lat += 10) {
        const points = [];
        const phi = THREE.MathUtils.degToRad(90 - lat);
        for (let long = -180; long <= 180; long += 1) {
            const theta = THREE.MathUtils.degToRad(long);
            points.push(new THREE.Vector3().setFromSphericalCoords(radius, phi, theta));
        }
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, material);
        latLongLines.add(line);
    }

    // Create longitude lines
    for (let long = -180; long <= 180; long += 10) {
        const points = [];
        for (let lat = -90; lat <= 90; lat += 1) {
            const phi = THREE.MathUtils.degToRad(90 - lat);
            const theta = THREE.MathUtils.degToRad(long);
            points.push(new THREE.Vector3().setFromSphericalCoords(radius, phi, theta));
        }
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, material);
        latLongLines.add(line);
    }

    // Set visibility off initially and add to scene
    latLongLines.visible = false;
    scene.add(latLongLines);
}
