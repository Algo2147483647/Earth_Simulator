class Stars {
    constructor() {
        if (Stars.instance) {
            return Stars.instance; // Return the existing instance if it exists
        }

        this.stars = null;

        this.createStars();

        Stars.instance = this; // Store the instance
    }

    createStars() {
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
        Visualizer.getInstance().addToScene(starField);
    }

    static getInstance() {
        if (!Stars.instance) {
            Stars.instance = new Stars();
        }
        return Stars.instance;
    }
}