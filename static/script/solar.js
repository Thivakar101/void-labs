    // Constants and configurations for the solar system
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
    let planetObjects = {};
    let saturnRing = null;

    // Initialize the application
    document.addEventListener("DOMContentLoaded", init);

    function init() {
        // Set up Three.js basics
        setupScene();
        
        // Load UI and start animation
        setupSolarSystem();
        createSystemUI();
        
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
        camera.position.set(0, 50, 150);
        
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
        
        const pointLight = new THREE.PointLight(0xffffff, 1.5, 300);
        pointLight.position.set(0, 0, 0); // Light from the sun's position
        scene.add(pointLight);
    }

    function setupSolarSystem() {
        const textureLoader = new THREE.TextureLoader();
        
        // Pre-load all textures
        const textures = {};
        Object.keys(PLANETS).forEach(planetName => {
            textures[planetName] = textureLoader.load(PLANETS[planetName].texture);
            if (PLANETS[planetName].ringTexture) {
                textures[`${planetName}Ring`] = textureLoader.load(PLANETS[planetName].ringTexture);
            }
            if (PLANETS[planetName].nightTexture) {
                textures[`${planetName}Night`] = textureLoader.load(PLANETS[planetName].nightTexture);
            }
        });
        
        // Create Sun
        const sunGeometry = new THREE.SphereGeometry(PLANETS["Sun"].size, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ map: textures["Sun"] });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.userData = { name: "Sun" };
        scene.add(sun);
        planetObjects["Sun"] = { planet: sun, angle: 0 };
        
        // Create planets and their orbits
        Object.keys(PLANETS).forEach(planetName => {
            if (planetName === "Sun") return; // Skip Sun, already created
            
            const planetData = PLANETS[planetName];
            
            // Create planet
            const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);
            const material = new THREE.MeshStandardMaterial({ 
                map: textures[planetName] 
            });
            const planet = new THREE.Mesh(geometry, material);
            planet.userData = { name: planetName };
            
            // Set initial position
            const angle = Math.random() * Math.PI * 2;
            planet.position.set(
                Math.cos(angle) * planetData.orbitDistance,
                0,
                Math.sin(angle) * planetData.orbitDistance
            );
            
            scene.add(planet);
            
            // Store planet data for animation
            planetObjects[planetName] = {
                planet: planet,
                angle: angle,
                distance: planetData.orbitDistance,
                speed: planetData.orbitSpeed
            };
            
            // Create orbit visualizer
            const orbitGeometry = new THREE.RingGeometry(
                planetData.orbitDistance - 0.1, 
                planetData.orbitDistance + 0.1, 
                64
            );
            const orbitMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x444444, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);
        });
        
        // Add Saturn's ring
        const saturn = planetObjects["Saturn"];
        if (saturn) {
            const ringGeometry = new THREE.RingGeometry(
                PLANETS["Saturn"].size + 1, 
                PLANETS["Saturn"].size + 3.5, 
                64
            );
            
            const ringMaterial = new THREE.MeshBasicMaterial({
                map: textures["SaturnRing"],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            
            saturnRing = new THREE.Mesh(ringGeometry, ringMaterial);
            saturnRing.rotation.x = Math.PI / 2.5;
            saturnRing.position.copy(saturn.planet.position);
            scene.add(saturnRing);
        }
        
        // Setup raycaster for click interactions
        setupRaycaster();
    }

    function setupRaycaster() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        window.addEventListener('click', () => {
            raycaster.setFromCamera(mouse, camera);
            
            // Create array of all planets for intersection testing
            const planets = Object.values(planetObjects).map(p => p.planet);
            
            const intersects = raycaster.intersectObjects(planets);
            
            if (intersects.length > 0) {
                const clickedPlanet = intersects[0].object.userData.name;
                
                // Save selected planet and navigate to planet view
                localStorage.setItem("selectedPlanet", clickedPlanet);
                window.location.href = `solar.html?planet=${clickedPlanet}`;
            }
        });
    }

    function createSystemUI() {
        // Add title
        const title = document.createElement("div");
        title.textContent = "Solar System Explorer";
        title.style.position = "absolute";
        title.style.top = "20px";
        title.style.left = "20px";
        title.style.color = "white";
        title.style.fontSize = "24px";
        title.style.fontFamily = "Arial, sans-serif";
        document.body.appendChild(title);
        
        // Add instructions
        const instructions = document.createElement("div");
        instructions.textContent = "Click on any planet or the Sun to explore it up close";
        instructions.style.position = "absolute";
        instructions.style.bottom = "20px";
        instructions.style.width = "100%";
        instructions.style.textAlign = "center";
        instructions.style.color = "white";
        instructions.style.fontSize = "16px";
        instructions.style.fontFamily = "Arial, sans-serif";
        document.body.appendChild(instructions);
    }

    function animate() {
        requestAnimationFrame(animate);
        animateSolarSystem();
        renderer.render(scene, camera);
    }

    function animateSolarSystem() {
        // Rotate planets and update positions
        Object.keys(planetObjects).forEach(planetName => {
            const planetObj = planetObjects[planetName];
            const planetData = PLANETS[planetName];
            
            // Rotate planet on its axis
            planetObj.planet.rotation.y += planetData.rotationSpeed;
            
            // Orbit planets (except the Sun)
            if (planetName !== "Sun") {
                planetObj.angle += planetData.orbitSpeed;
                planetObj.planet.position.x = Math.cos(planetObj.angle) * planetData.orbitDistance;
                planetObj.planet.position.z = Math.sin(planetObj.angle) * planetData.orbitDistance;
            }
        });
        
        // Update Saturn's ring position
        if (saturnRing && planetObjects["Saturn"]) {
            saturnRing.position.copy(planetObjects["Saturn"].planet.position);
            saturnRing.rotation.z += 0.0005;
        }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }