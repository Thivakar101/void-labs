const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 150);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(pointLight);

const textureLoader = new THREE.TextureLoader();

// ✅ Background Texture
scene.background = textureLoader.load('textures/8k_stars_milky_way.jpg');

const textures = {
    Sun: textureLoader.load('textures/8k_sun.jpg'),
    Mercury: textureLoader.load('textures/8k_mercury.jpg'),
    Venus: textureLoader.load('textures/8k_venus_surface.jpg'),
    Earth: textureLoader.load('textures/8k_earth_nightmap.jpg'),
    Mars: textureLoader.load('textures/8k_mars.jpg'),
    Jupiter: textureLoader.load('textures/8k_jupiter.jpg'),
    Saturn: textureLoader.load('textures/8k_saturn.jpg'),
    SaturnRing: textureLoader.load('textures/8k_sing.png'), // ✅ Added Saturn's Ring Texture
    Uranus: textureLoader.load('textures/2k_uranus.jpg'),
    Neptune: textureLoader.load('textures/2k_neptune.jpg')
};

const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: textures.Sun });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.userData = { name: "Sun" };
scene.add(sun);

function createPlanet(name, size, texture, distance, speed) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const planet = new THREE.Mesh(geometry, material);
    planet.userData = { name };
    return { planet, distance, angle: Math.random() * Math.PI * 2, speed };
}

const planets = [
    createPlanet("Mercury", 1.5, textures.Mercury, 15, 0.02),
    createPlanet("Venus", 2, textures.Venus, 25, 0.015),
    createPlanet("Earth", 2.5, textures.Earth, 35, 0.01),
    createPlanet("Mars", 2, textures.Mars, 45, 0.008),
    createPlanet("Jupiter", 5, textures.Jupiter, 65, 0.005),
    createPlanet("Saturn", 4.5, textures.Saturn, 85, 0.004),
    createPlanet("Uranus", 3.5, textures.Uranus, 105, 0.003),
    createPlanet("Neptune", 3, textures.Neptune, 125, 0.002),
];

planets.forEach(p => scene.add(p.planet));

// ✅ Add Saturn's Ring
const saturn = planets.find(p => p.planet.userData.name === "Saturn");

if (saturn) {
    const ringGeometry = new THREE.RingGeometry(5.5, 8, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: textures.SaturnRing,
        side: THREE.DoubleSide,
        transparent: true
    });
    const saturnRing = new THREE.Mesh(ringGeometry, ringMaterial);

    saturnRing.rotation.x = Math.PI / 2.5; // ✅ Tilt the ring for realism
    saturnRing.position.copy(saturn.planet.position); // ✅ Position the ring with Saturn

    scene.add(saturnRing);
    saturn.ring = saturnRing; // Save reference for animation
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([sun, ...planets.map(p => p.planet)]);
    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object.userData.name;
        window.location.href = `solar.html?planet=${clickedPlanet}`;
    }
});

function animate() {
    requestAnimationFrame(animate);
    sun.rotation.y += 0.001;

    planets.forEach(p => {
        p.angle += p.speed;
        p.planet.position.set(Math.cos(p.angle) * p.distance, 0, Math.sin(p.angle) * p.distance);
    });

    if (saturn && saturn.ring) {
        saturn.ring.position.copy(saturn.planet.position); // ✅ Keep ring with Saturn
    }

    renderer.render(scene, camera);
}
animate();
