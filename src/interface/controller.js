class Controller {
    constructor() {
        if (Controller.instance) {
            return Controller.instance; // Return the existing instance if it exists
        }

        this.OrbitControls = null;

        this.init();

        Controller.instance = this; // Store the instance
    }

    init() {
        this.initOrbitControls();
        this.animate(); // Start animation loop
    }

    initOrbitControls() {
        // Enable controls for interaction
        this.OrbitControls = new THREE.OrbitControls(Visualizer.getInstance().camera, Visualizer.getInstance().renderer.domElement);
        this.OrbitControls.enableDamping = true;
        this.OrbitControls.dampingFactor = 0.25;
        this.OrbitControls.rotateSpeed = 0.15;
        this.OrbitControls.enableZoom = true;  // Enable zooming
    }

    static getInstance() {
        if (!Controller.instance) {
            Controller.instance = new Controller();
        }
        return Controller.instance;
    }

    animate() {
        // Adjust rotate speed based on zoom level
        this.OrbitControls.rotateSpeed = 0.15;

        requestAnimationFrame(() => this.animate()); // Maintain context with arrow function
        this.OrbitControls.update();
        Visualizer.getInstance().renderer.render(Visualizer.getInstance().scene, Visualizer.getInstance().camera);
    }
}
