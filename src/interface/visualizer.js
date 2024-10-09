class Visualizer {
    constructor() {
        if (Visualizer.instance) {
            return Visualizer.instance; // Return the existing instance if it exists
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.init();

        Visualizer.instance = this; // Store the instance
    }

    init() {
        this.initThreeJs();
    }

    initThreeJs() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    static getInstance() {
        if (!Visualizer.instance) {
            Visualizer.instance = new Visualizer();
        }
        return Visualizer.instance;
    }

    addToScene(object) {
        console.log(object);
        this.scene.add(object)

        this.renderer.render(this.scene, this.camera);
    }
}

// Usage of Visualizer
