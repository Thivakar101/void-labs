// Constants and configurations for the planets
const PLANETS = {
    "Sun": { 
        texture: "textures/8k_sun.jpg", 
        size: 10,
        orbitDistance: 0,
        orbitSpeed: 0,
        rotationSpeed: 0.001,
        description: "Sun: Our star, containing 99.8% of the solar system's mass."
    },
    "Mercury": { 
        texture: "textures/8k_mercury.jpg", 
        size: 1.5,
        orbitDistance: 15,
        orbitSpeed: 0.02,
        rotationSpeed: 0.0041,
        description: "Mercury: The smallest planet, closest to the Sun."
    },
    "Venus": { 
        texture: "textures/8k_venus_surface.jpg", 
        size: 2,
        orbitDistance: 25,
        orbitSpeed: 0.015,
        rotationSpeed: 0.0010,
        description: "Venus: The hottest planet with a toxic atmosphere."
    },
    "Earth": { 
        texture: "textures/8k_earth_daymap.jpg",
        nightTexture: "textures/8k_earth_nightmap.jpg",
        size: 2.5, 
        orbitDistance: 35,
        orbitSpeed: 0.01,
        rotationSpeed: 0.005,
        description: "Earth: Our home planet, the only known world with life."
    },
    "Mars": { 
        texture: "textures/8k_mars.jpg", 
        size: 2,
        orbitDistance: 45,
        orbitSpeed: 0.008,
        rotationSpeed: 0.0048,
        description: "Mars: The red planet with polar ice caps and ancient riverbeds."
    },
    "Jupiter": { 
        texture: "textures/8k_jupiter.jpg", 
        size: 5,
        orbitDistance: 65,
        orbitSpeed: 0.005,
        rotationSpeed: 0.012,
        description: "Jupiter: The largest planet with a Great Red Spot storm."
    },
    "Saturn": { 
        texture: "textures/8k_saturn.jpg", 
        size: 4.5,
        orbitDistance: 85,
        orbitSpeed: 0.004,
        rotationSpeed: 0.011,
        ringTexture: "textures/8k_saturn_ring.png",
        description: "Saturn: The ringed planet with more than 80 moons."
    },
    "Uranus": { 
        texture: "textures/2k_uranus.jpg", 
        size: 3.5,
        orbitDistance: 105,
        orbitSpeed: 0.003,
        rotationSpeed: 0.007,
        description: "Uranus: The sideways planet that rotates on its side."
    },
    "Neptune": { 
        texture: "textures/2k_neptune.jpg", 
        size: 3,
        orbitDistance: 125,
        orbitSpeed: 0.002,
        rotationSpeed: 0.008,
        description: "Neptune: The windiest planet with speeds up to 1,200 mph."
    }
};

// Initialize key variables
let scene, camera, renderer;
let currentPlanet = null;
let planetObject = null;
let saturnRing = null;

// Initialize the application
document.addEventListener("DOMContentLoaded", init);

function init() {
    // Get planet from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentPlanet = urlParams.get('planet') || localStorage.getItem("selectedPlanet") || "Earth";
    
    // Validate planet selection
    if (!Object.keys(PLANETS).includes(currentPlanet)) {
        currentPlanet = "Earth";
    }
    
    localStorage.setItem("selectedPlanet", currentPlanet);
    
    // Set up Three.js basics
    setupScene();
    
    // Load planet view and UI
    setupPlanetView(currentPlanet);
    createPlanetUI();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener("resize", onWindowResize);
}

function setupScene() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera with appropriate position
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const planetData = PLANETS[currentPlanet];
    camera.position.z = 5 + (planetData.size * 1.5);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Add background
    const textureLoader = new THREE.TextureLoader();
    scene.background = textureLoader.load("textures/8k_stars_milky_way.jpg");
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    if (currentPlanet !== "Sun") {
        const pointLight = new THREE.PointLight(0xffffff, 1.5, 300);
        pointLight.position.set(-50, 50, 50); // Light from a distance
        scene.add(pointLight);
    } else {
        // Sun emits its own light
        const sunLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(sunLight);
    }
}

function setupPlanetView(planetName) {
    const planetData = PLANETS[planetName];
    
    const textureLoader = new THREE.TextureLoader();
    
    // Create the planet with appropriate size
    const geometry = new THREE.SphereGeometry(planetData.size * 1.2, 64, 64);
    const material = new THREE.MeshStandardMaterial();
    const planet = new THREE.Mesh(geometry, material);
    
    // Set initial rotation
    planet.rotation.x = Math.PI / 8;
    
    scene.add(planet);
    planetObject = { planet: planet };
    
    // Load texture
    textureLoader.load(planetData.texture, (texture) => {
        material.map = texture;
        material.needsUpdate = true;
    });
    
    // Add Saturn's ring if needed
    if (planetName === "Saturn") {
        textureLoader.load(planetData.ringTexture, (ringTexture) => {
            const ringGeometry = new THREE.RingGeometry(
                planetData.size + 1.5,
                planetData.size + 4,
                128
            );
            
            // Create vertices for the ring to properly map the texture
            const pos = ringGeometry.attributes.position;
            const v3 = new THREE.Vector3();
            
            // Modify UVs to correctly map the ring texture
            const uv = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
                v3.fromBufferAttribute(pos, i);
                const innerRadius = planetData.size + 1.5;
                const outerRadius = planetData.size + 4;
                const normalizedRadius = (v3.length() - innerRadius) / (outerRadius - innerRadius);
                
                // Map UV coordinates
                uv[i * 2] = normalizedRadius;
                uv[i * 2 + 1] = (i % 2) ? 0 : 1;
            }
            
            ringGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
            
            const ringMaterial = new THREE.MeshBasicMaterial({
                map: ringTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            
            saturnRing = new THREE.Mesh(ringGeometry, ringMaterial);
            saturnRing.rotation.x = Math.PI / 2.5;
            scene.add(saturnRing);
        });
    }
    
    // Update page title
    document.title = `${planetName} - Planet Viewer`;
}

function createPlanetUI() {
    // Create back button
    const backButton = document.createElement("button");
    backButton.textContent = "Back to Solar System";
    backButton.style.position = "absolute";
    backButton.style.bottom = "20px";
    backButton.style.left = "20px";
    backButton.style.padding = "10px";
    backButton.style.background = "rgba(0, 0, 0, 0.7)";
    backButton.style.color = "white";
    backButton.style.border = "none";
    backButton.style.borderRadius = "5px";
    backButton.style.cursor = "pointer";
    
    backButton.addEventListener("click", () => {
        window.location.href = "str.html";
    });
    
    document.body.appendChild(backButton);
    
    // Create planet selector
    const planetSelector = document.createElement("select");
    planetSelector.style.position = "absolute";
    planetSelector.style.top = "20px";
    planetSelector.style.right = "20px";
    planetSelector.style.padding = "5px";
    planetSelector.style.background = "rgba(0, 0, 0, 0.7)";
    planetSelector.style.color = "white";
    planetSelector.style.border = "none";
    planetSelector.style.borderRadius = "5px";
    
    Object.keys(PLANETS).forEach(planet => {
        const option = document.createElement("option");
        option.value = planet;
        option.textContent = planet;
        if (planet === currentPlanet) {
            option.selected = true;
        }
        planetSelector.appendChild(option);
    });
    
    planetSelector.addEventListener("change", () => {
        const newPlanet = planetSelector.value;
        localStorage.setItem("selectedPlanet", newPlanet);
        window.location.href = `solar.html?planet=${newPlanet}`;
    });
    
    document.body.appendChild(planetSelector);
    
    // Create popup element
    createPopupElement();
    
    // Show initial popup
    const planetData = PLANETS[currentPlanet];
    showPopup(planetData.description);
    
    // Schedule periodic popups
    setInterval(() => {
        showPopup(planetData.description);
    }, 10000);
}

function createPopupElement() {
    const popup = document.createElement("div");
    popup.id = "popup";
    popup.style.position = "absolute";
    popup.style.bottom = "60px";
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.background = "rgba(0, 0, 0, 0.7)";
    popup.style.color = "white";
    popup.style.padding = "10px";
    popup.style.borderRadius = "5px";
    popup.style.display = "none";
    
    const popupText = document.createElement("div");
    popupText.id = "popupText";
    popup.appendChild(popupText);
    
    document.body.appendChild(popup);
    return popup;
}

function showPopup(message) {
    const popup = document.getElementById("popup");
    const popupText = document.getElementById("popupText");
    
    popupText.innerText = message;
    popup.style.display = "block";
    
    setTimeout(() => {
        popup.style.display = "none";
    }, 3000);
}

function animate() {
    requestAnimationFrame(animate);
    animatePlanetView();
    renderer.render(scene, camera);
}

function animatePlanetView() {
    // Get current planet data
    const planetData = PLANETS[currentPlanet];
    
    if (planetObject && planetObject.planet) {
        // Rotate the planet
        planetObject.planet.rotation.y += planetData.rotationSpeed;
    }
    
    // Update Saturn's ring if applicable
    if (currentPlanet === "Saturn" && saturnRing) {
        saturnRing.rotation.z += 0.0005;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}