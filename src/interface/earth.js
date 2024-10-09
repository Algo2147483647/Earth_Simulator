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

    static getInstance() {
        if (!Earth.instance) {
            Earth.instance = new Earth();
        }
        return Earth.instance;
    }
}

