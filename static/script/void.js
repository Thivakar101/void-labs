const heroContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
heroContainer.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.02,
});

const starsCount = 1500;
const starsPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i += 3) {
  starsPositions[i] = (Math.random() - 0.5) * 10;
  starsPositions[i + 1] = (Math.random() - 0.5) * 10;
  starsPositions[i + 2] = (Math.random() - 0.5) * 10;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
const wireframe = new THREE.WireframeGeometry(sphereGeometry);
const line = new THREE.LineSegments(wireframe);
line.material.color.setHex(0x8a2be2);
line.material.transparent = true;
line.material.opacity = 0.6;
scene.add(line);

const icoGeometry = new THREE.IcosahedronGeometry(0.2, 0);
const icoMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x8a2be2,
  wireframe: true
});
const ico = new THREE.Mesh(icoGeometry, icoMaterial);
ico.position.set(1, 0.5, 0);
scene.add(ico);

let astronaut;

function loadAstronautModel() {
  const loader = new THREE.GLTFLoader();
  loader.load(
    'static/models/stanging_astronaut_fl_0321045322_texture.glb', 
    function (gltf) {
      astronaut = gltf.scene;
      astronaut.position.set(5, -1, 0); 
      astronaut.scale.set(1.5, 1.5, 1.5); 
      astronaut.rotation.y = Math.PI / 4;
      scene.add(astronaut);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.error('An error happened loading the astronaut model:', error);
    }
  );
}

loadAstronautModel();

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  
  stars.rotation.x += 0.0005;
  stars.rotation.y += 0.0005;
  
  line.rotation.x += 0.001;
  line.rotation.y += 0.001;
  
  ico.rotation.x += 0.01;
  ico.rotation.y += 0.01;
  ico.position.y = Math.sin(Date.now() * 0.001) * 0.1 + 0.5;
  
  if (astronaut) {
    astronaut.position.y = Math.sin(Date.now() * 0.0008) * 0.2 - 1;
    astronaut.rotation.y += 0.002;
  }
  
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function setupSectionModel(containerId, geometry, color, position) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  const material = new THREE.MeshBasicMaterial({ 
    color: color,
    wireframe: true
  });
  const object = new THREE.Mesh(geometry, material);
  scene.add(object);
  
  camera.position.z = position;
  
  function animate() {
    requestAnimationFrame(animate);
    object.rotation.x += 0.01;
    object.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
}

document.addEventListener('DOMContentLoaded', function() {
  setupSectionModel('mission-model', new THREE.TorusGeometry(1, 0.3, 16, 100), 0x8a2be2, 4);
  setupSectionModel('vision-model', new THREE.OctahedronGeometry(1, 0), 0x8a2be2, 4);
  setupSectionModel('vr-model', new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16), 0x8a2be2, 4);
  setupSectionModel('twin-model', new THREE.DodecahedronGeometry(1, 0), 0x8a2be2, 4);
  setupSectionModel('metaverse-model', new THREE.BoxGeometry(1, 1, 1), 0x8a2be2, 4);
  
  let lastScrollTop = 0;
  const header = document.querySelector('header');
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }
    lastScrollTop = scrollTop;
    
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
      if (scrollTop > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
    
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    reveals.forEach(reveal => {
      const windowHeight = window.innerHeight;
      const elementTop = reveal.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
    
    const serviceCards = document.querySelectorAll('.services-staggered .service-card');
    serviceCards.forEach(card => {
      const windowHeight = window.innerHeight;
      const elementTop = card.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        card.classList.add('active');
      }
    });
  });
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  const scrollTopBtn = document.createElement('a');
  scrollTopBtn.classList.add('scroll-top');
  scrollTopBtn.href = '#';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(scrollTopBtn);
  
  scrollTopBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
