class Earth {
    constructor() {
        if (Earth.instance) {
            return Earth.instance; // Return the existing instance if it exists
        }

        this.earth = null;
        this.atmosphere = null

        // mark groups
        this.points = []
        this.lines = []
        this.latLonLines = null

        this.init();

        Earth.instance = this; // Store the instance
    }

    static getInstance() {
        if (!Earth.instance) {
            Earth.instance = new Earth();
        }
        return Earth.instance;
    }

    init() {
        this.createEarth();
        this.createAtmosphere();
        this.drawLongitudeLatitudeLines()
    }

    createEarth() {
        // Create sphere geometry and material with texture
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        const texture = new THREE.TextureLoader().load('../../assets/earth.png');
        const material = new THREE.MeshBasicMaterial({
            map: texture,
        });

        // Create sphere mesh
        this.earth = new THREE.Mesh(geometry, material);
        Visualizer.getInstance().addToScene(this.earth);
    }

    // Create atmospheric haze
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(2.02, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x6699ff, // Light blue color
            transparent: true,
            opacity: 0.1, // Adjust opacity as needed for the desired effect
            side: THREE.BackSide
        });

        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        Visualizer.getInstance().addToScene(this.atmosphere);
    }

    drawSurface(image) {
        this.earth.material.map = new THREE.TextureLoader().load(image);
        this.earth.material.needsUpdate = true;  // This line is important to update the texture
    }

    drawPoints(points) {
        this.points = new THREE.Group();

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
            this.points.add(point);
        }
        Visualizer.getInstance().addToScene(this.points);
    }

    drawLines(lines) {
        this.lines = new THREE.Group();
        const radius = 2; // Earth radius in spherical coordinates
        const material = new THREE.LineBasicMaterial({ color: 0xAAAAAA });

        // Function to interpolate between two points along a great circle
        function interpolatePoints(startPoint, endPoint, numPoints) {
            const points = [];
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;

                // Use spherical linear interpolation (slerp) for great circle path
                const interpolatedPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, t).normalize().multiplyScalar(radius);
                points.push(interpolatedPoint);
            }
            return points;
        }

        // Loop through each line definition in the array
        lines.forEach(([st_lat, st_long, ed_lat, ed_long]) => {
            // Convert start point (latitude, longitude) to spherical coordinates
            const st_phi = THREE.MathUtils.degToRad(90 - st_lat); // Latitude to polar angle
            const st_theta = THREE.MathUtils.degToRad(90 + st_long); // Longitude to azimuthal angle
            const startPoint = new THREE.Vector3().setFromSphericalCoords(radius, st_phi, st_theta);

            // Convert end point (latitude, longitude) to spherical coordinates
            const ed_phi = THREE.MathUtils.degToRad(90 - ed_lat); // Latitude to polar angle
            const ed_theta = THREE.MathUtils.degToRad(90 + ed_long); // Longitude to azimuthal angle
            const endPoint = new THREE.Vector3().setFromSphericalCoords(radius, ed_phi, ed_theta);

            // Interpolate points along the great circle path
            const points = interpolatePoints(startPoint, endPoint, 100); // Use 100 points for a smooth curve

            // Create the line geometry and add it to the group
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, material);
            this.lines.add(line);
        });

        // Add the group to the scene
        Visualizer.getInstance().addToScene(this.lines);
    }

    drawLongitudeLatitudeLines() {
        this.latLonLines = new THREE.Group();
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
            this.latLonLines.add(line);
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
            this.latLonLines.add(line);
        }

        Visualizer.getInstance().addToScene(this.latLonLines);
    }

    drawRectangleWithImage(lat_min, lat_max, lon_min, lon_max, image) {
        const radius = 2; // 地球半径
        const material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(image),
            side: THREE.DoubleSide,  // 双面渲染，避免正面背面问题
        });

        // Convert lat/lon to spherical coordinates
        function latLonToVector3(lat, lon) {
            const phi = THREE.MathUtils.degToRad(90 - lat);
            const theta = THREE.MathUtils.degToRad(lon + 90);
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            return new THREE.Vector3(x, y, z);
        }

        // Get the four corners of the rectangle in spherical coordinates
        const bottomLeft = latLonToVector3(lat_min, lon_min);
        const bottomRight = latLonToVector3(lat_min, lon_max);
        const topLeft = latLonToVector3(lat_max, lon_min);
        const topRight = latLonToVector3(lat_max, lon_max);

        // Create a custom geometry using the four corner points
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            bottomLeft.x, bottomLeft.y, bottomLeft.z,  // Bottom-left
            bottomRight.x, bottomRight.y, bottomRight.z,  // Bottom-right
            topLeft.x, topLeft.y, topLeft.z,  // Top-left
            topRight.x, topRight.y, topRight.z   // Top-right
        ]);

        // Set the vertices in geometry
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Define face indices for the rectangle (2 triangles)
        const indices = new Uint16Array([
            0, 1, 2,  // First triangle
            2, 1, 3   // Second triangle
        ]);
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        // Define UV coordinates for the texture mapping
        const uvs = new Float32Array([
            0, 0,  // Bottom-left
            1, 0,  // Bottom-right
            0, 1,  // Top-left
            1, 1   // Top-right
        ]);
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // Create the mesh and add it to the scene
        const mesh = new THREE.Mesh(geometry, material);
        Visualizer.getInstance().addToScene(mesh);
    }

}

