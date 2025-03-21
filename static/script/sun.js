// Initialize Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Reliable 
const sunTexture = textureLoader.load("/textures/cling.jpg");
const galaxyTexture = textureLoader.load("/textures/cling.jpg"); // Placeholder, replace with a galaxy texture
const floorTexture = textureLoader.load("/textures/cling.jpg");

// Ensure textures repeat properly
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 4);
galaxyTexture.wrapS = galaxyTexture.wrapT = THREE.RepeatWrapping;
galaxyTexture.repeat.set(1, 1);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffaa00, 3, 50);
pointLight.position.set(0, -5, 0);
scene.add(pointLight);

// **SUN BELOW THE PLATFORM**
const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, -5, 0);
scene.add(sun);

// **STARRY SKYBOX**
const starGeometry = new THREE.SphereGeometry(100, 64, 64);
const starMaterial = new THREE.MeshBasicMaterial({ map: galaxyTexture, side: THREE.BackSide });
const starField = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starField);

// **Stable Platform**
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// **Walls (Galaxy Textured)**
function createWall(width, height, depth, x, y, z) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ map: galaxyTexture });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);
    scene.add(wall);
}

createWall(10, 3, 0.2, 0, 1.5, -5); // Back wall
createWall(10, 3, 0.2, 0, 1.5, 5);  // Front wall
createWall(0.2, 3, 10, -5, 1.5, 0); // Left wall
createWall(0.2, 3, 10, 5, 1.5, 0);  // Right wall

// **Player Movement**
const controls = { forward: false, backward: false, left: false, right: false };

document.addEventListener("keydown", (event) => {
    if (event.key === "w") controls.forward = true;
    if (event.key === "s") controls.backward = true;
    if (event.key === "a") controls.left = true;
    if (event.key === "d") controls.right = true;
});

document.addEventListener("keyup", (event) => {
    if (event.key === "w") controls.forward = false;
    if (event.key === "s") controls.backward = false;
    if (event.key === "a") controls.left = false;
    if (event.key === "d") controls.right = false;
});

// **Animation Loop**
function animate() {
    requestAnimationFrame(animate);

    // Player Movement
    const speed = 0.05;
    if (controls.forward) camera.position.z -= speed;
    if (controls.backward) camera.position.z += speed;
    if (controls.left) camera.position.x -= speed;
    if (controls.right) camera.position.x += speed;

    renderer.render(scene, camera);
}
animate();
