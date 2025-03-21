
    const heroContainer = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    heroContainer.appendChild(renderer.domElement);
    
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
    
    setupSectionModel('mission-model', new THREE.TorusGeometry(1, 0.3, 16, 100), 0x8a2be2, 4);
    setupSectionModel('vision-model', new THREE.OctahedronGeometry(1, 0), 0x8a2be2, 4);
    setupSectionModel('vr-model', new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16), 0x8a2be2, 4);
    setupSectionModel('twin-model', new THREE.DodecahedronGeometry(1, 0), 0x8a2be2, 4);
    setupSectionModel('metaverse-model', new THREE.BoxGeometry(1, 1, 1), 0x8a2be2, 4);

  // Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Header scroll effect
  let lastScrollTop = 0;
  const header = document.querySelector('header');
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Header hide/show on scroll
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down & not at the top
      header.classList.add('header-hidden');
    } else {
      // Scrolling up
      header.classList.remove('header-hidden');
    }
    lastScrollTop = scrollTop;
    
    // Scroll to top button visibility
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTop > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
    
    // Reveal elements on scroll
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    reveals.forEach(reveal => {
      const windowHeight = window.innerHeight;
      const elementTop = reveal.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
    
    // Service cards staggered animation
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
  
  // Smooth scroll for anchor links
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
  
  // Scroll to top button
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
