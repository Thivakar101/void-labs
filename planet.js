document.addEventListener("DOMContentLoaded", () => {
    // Get planet from URL parameters first, then localStorage as fallback
    const urlParams = new URLSearchParams(window.location.search);
    let planetName = urlParams.get('planet') || localStorage.getItem("selectedPlanet") || "Earth";
    
    // Save the current selection to localStorage for persistence
    localStorage.setItem("selectedPlanet", planetName);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Background Nebula Texture
    const textureLoader = new THREE.TextureLoader();
    scene.background = textureLoader.load("textures/8k_stars_milky_way.jpg");

    const planetTextures = {
        "Mercury": "textures/8k_mercury.jpg",
        "Venus": "textures/8k_venus_surface.jpg",
        "Earth": "textures/8k_earth_daymap.jpg",
        "Mars": "textures/8k_mars.jpg",
        "Jupiter": "textures/8k_jupiter.jpg",
        "Saturn": "textures/8k_saturn.jpg",
        "Uranus": "textures/2k_uranus.jpg",
        "Neptune": "textures/2k_neptune.jpg",
        "Sun": "textures/8k_sun.jpg"
    };

    // Planet size scale based on relative sizes
    const planetSizes = {
        "Mercury": 1,
        "Venus": 1.5,
        "Earth": 1.6,
        "Mars": 1.2,
        "Jupiter": 3.5,
        "Saturn": 3,
        "Uranus": 2.5,
        "Neptune": 2.4,
        "Sun": 5
    };
    
    // Create the planet with appropriate size
    const planetSize = planetSizes[planetName] || 2;
    const geometry = new THREE.SphereGeometry(planetSize, 64, 64);
    const material = new THREE.MeshStandardMaterial();
    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);

    let saturnRing;

    function updatePlanetTexture(planetName) {
        console.log("Loading texture for:", planetName);
        const texturePath = planetTextures[planetName] || planetTextures["Earth"];

        // Remove Saturn ring if exists and we're switching to a different planet
        if (saturnRing && planetName !== "Saturn") {
            scene.remove(saturnRing);
            saturnRing = null;
        }

        // Add Saturn ring if needed
        if (planetName === "Saturn" && !saturnRing) {
            createSaturnRing();
        }
        
        // Adjust camera distance based on planet size
        camera.position.z = 5 + (planetSizes[planetName] || 0);

        textureLoader.load(texturePath, (texture) => {
            material.map = texture;
            material.needsUpdate = true;
            
            // Update page title with planet name
            document.title = `${planetName} - Planet Viewer`;
            
            renderer.render(scene, camera);
        });
    }

    function createSaturnRing() {
        // Load the ring texture
        const ringTexture = textureLoader.load("textures/8k_saturn_ring.png");
        
        // Create a larger, more realistic ring
        const ringGeometry = new THREE.RingGeometry(
            planetSizes["Saturn"] + 0.8,  // Inner radius
            planetSizes["Saturn"] + 2.8,  // Outer radius
            128  // More segments for better detail
        );
        
        // Create vertices for the ring to properly map the texture
        const pos = ringGeometry.attributes.position;
        const v3 = new THREE.Vector3();
        
        // Modify UVs to correctly map the ring texture
        const uv = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            const normalizedRadius = (v3.length() - (planetSizes["Saturn"] + 0.8)) / ((planetSizes["Saturn"] + 2.8) - (planetSizes["Saturn"] + 0.8));
            
            // Map UV coordinates
            uv[i * 2] = normalizedRadius;
            uv[i * 2 + 1] = (i % 2) ? 0 : 1;
        }
        
        ringGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        
        // Create the ring material with proper transparency
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        
        saturnRing = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Position the ring to be tilted
        saturnRing.rotation.x = Math.PI / 2.5;
        scene.add(saturnRing);
    }

    // Initial setup
    updatePlanetTexture(planetName);

    // Lighting depends on the planet (Sun doesn't need external light)
    if (planetName === "Sun") {
        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);
    } else {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);
        
        const light = new THREE.PointLight(0xffffff, 1.5);
        light.position.set(5, 5, 5);
        scene.add(light);
    }

    camera.position.z = 5 + (planetSizes[planetName] || 0);
    planet.rotation.x = Math.PI / 8;

    function animate() {
        requestAnimationFrame(animate);
        
        // Different rotation speeds based on planet
        const rotationSpeeds = {
            "Mercury": 0.0041,
            "Venus": 0.0010, // Venus rotates very slowly
            "Earth": 0.005,
            "Mars": 0.0048,
            "Jupiter": 0.012, // Jupiter rotates quickly
            "Saturn": 0.011,
            "Uranus": 0.007,
            "Neptune": 0.008,
            "Sun": 0.002
        };
        
        planet.rotation.y += rotationSpeeds[planetName] || 0.005;

        if (saturnRing) {
            saturnRing.position.set(planet.position.x, planet.position.y, planet.position.z);
            saturnRing.rotation.z += 0.0005;
        }

        renderer.render(scene, camera);
    }
    animate();

    function showPopup(message) {
        const popup = document.getElementById("popup");
        const popupText = document.getElementById("popupText");

        popupText.innerText = message;
        popup.style.display = "block";
        setTimeout(() => popup.style.display = "none", 3000);
    }

    const planetMessages = {
        "Mercury": "Mercury: The smallest planet, closest to the Sun.",
        "Venus": "Venus: The hottest planet with a toxic atmosphere.",
        "Earth": "Earth: Our home planet, the only known world with life.",
        "Mars": "Mars: The red planet with polar ice caps and ancient riverbeds.",
        "Jupiter": "Jupiter: The largest planet with a Great Red Spot storm.",
        "Saturn": "Saturn: The ringed planet with more than 80 moons.",
        "Uranus": "Uranus: The sideways planet that rotates on its side.",
        "Neptune": "Neptune: The windiest planet with speeds up to 1,200 mph.",
        "Sun": "Sun: Our star, containing 99.8% of the solar system's mass."
    };

    // Show popup immediately and then periodically
    showPopup(planetMessages[planetName] || planetMessages["Earth"]);
    setInterval(() => showPopup(planetMessages[planetName] || planetMessages["Earth"]), 10000);

    // Add back button to return to solar system view
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

    // Add planet selector
    const planetSelector = document.createElement("select");
    planetSelector.style.position = "absolute";
    planetSelector.style.top = "20px";
    planetSelector.style.right = "20px";
    planetSelector.style.padding = "5px";
    planetSelector.style.background = "rgba(0, 0, 0, 0.7)";
    planetSelector.style.color = "white";
    planetSelector.style.border = "none";
    planetSelector.style.borderRadius = "5px";
    
    Object.keys(planetTextures).forEach(planet => {
        const option = document.createElement("option");
        option.value = planet;
        option.textContent = planet;
        if (planet === planetName) {
            option.selected = true;
        }
        planetSelector.appendChild(option);
    });
    
    planetSelector.addEventListener("change", () => {
        const newPlanet = planetSelector.value;
        planetName = newPlanet;
        localStorage.setItem("selectedPlanet", planetName);
        updatePlanetTexture(planetName);
    });
    
    document.body.appendChild(planetSelector);

    // Handle window resize
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});