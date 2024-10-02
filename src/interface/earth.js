class EarthVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphere = null;
        this.controls = null;
        this.coordinates = [];
        this.points = [];
        this.currentTexture = new THREE.TextureLoader().load('../assets/earth.png');

        this.init();
        window.addEventListener('resize', () => this.onWindowResize());
    }

    async init() {
        this.initThreeJs();
        this.createEarth();
        this.createAtmosphere();
        this.drawLatLongLines();
        this.createStars();
        this.initControls();
        this.animate();

        // Fade-in effect for the sphere
        this.fadeIn(this.sphere.material, 3000);
        this.fadeOutOverlay('overlay', 3000);
    }

    initThreeJs() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }
}