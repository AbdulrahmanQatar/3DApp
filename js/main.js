// Global variables
let scene, camera, renderer, controls;
let currentModel = null;
let models = {};
let isWireframe = false;
let autoRotate = false;
let ambientLight, directionalLight;

// Model information
const modelInfo = {
  cola: {
    title: "Cola Classic",
    description:
      "The original refreshing cola with a perfect blend of sweetness and fizz. A timeless classic enjoyed around the world.",
  },
  orange: {
    title: "Orange Fizz",
    description:
      "A bright and tangy orange-flavored soda that delivers a burst of citrus refreshment with every sip.",
  },
  lemon: {
    title: "Lemon Spark",
    description:
      "A crisp, lemon-lime beverage that provides a clean, refreshing taste with a perfect balance of tartness and sweetness.",
  },
};

// Initialize Three.js scene
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    800
  );
  camera.position.z = 5;

  // Create renderer
  const container = document.getElementById("canvas-container");
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Add orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Add lights
  setupLights();

  // Load models
  loadModels();

  // Add event listeners
  addEventListeners();

  // Start animation loop
  animate();

  // Handle window resize
  window.addEventListener("resize", onWindowResize);
}

// Set up scene lighting
function setupLights() {
  // Ambient light
  ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Directional light (main light)
  directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Add hemisphere light for more natural lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);
}

// Load all 3D models
function loadModels() {
  const loader = new THREE.GLTFLoader();
  const modelNames = ["cola", "orange", "lemon"];

  // Load each model
  modelNames.forEach((name) => {
    loader.load(
      `models/${name}.glb`,
      (gltf) => {
        const model = gltf.scene;

        // Set different scales based on the model name
        if (name === "lemon") {
          model.scale.set(0.07, 0.07, 0.07); // For lemon
          model.rotation.y = THREE.MathUtils.degToRad(240);
        } else if (name === "cola") {
          model.scale.set(0.3, 0.3, 0.3); // For cola
        } else if (name === "orange") {
          model.scale.set(15, 15, 15); // For lemon
        }

        model.position.set(0, 0, 0);
        model.castShadow = true;
        model.receiveShadow = true;

        // Store the model
        models[name] = model;

        // If this is the first model (cola), show it
        if (name === "cola") {
          showModel("cola");
        }
      },
      (xhr) => {
        console.log(`${name} model: ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error(`Error loading ${name} model:`, error);
      }
    );
  });
}

// Show a specific model
function showModel(modelName) {
  // Remove current model if it exists
  if (currentModel) {
    scene.remove(currentModel);
  }

  // Add the new model
  if (models[modelName]) {
    currentModel = models[modelName];
    scene.add(currentModel);

    // Update model info
    document.getElementById("model-title").textContent =
      modelInfo[modelName].title;
    document.getElementById("model-description").textContent =
      modelInfo[modelName].description;

    // Reset camera position
    resetCamera();

    // Update active button
    document.querySelectorAll(".model-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.model === modelName) {
        btn.classList.add("active");
      }
    });

    // Apply current wireframe setting
    setWireframe(isWireframe);
  }
}

// Toggle wireframe mode
function setWireframe(wireframeOn) {
  isWireframe = wireframeOn;

  if (currentModel) {
    currentModel.traverse((child) => {
      if (child.isMesh) {
        child.material.wireframe = wireframeOn;
      }
    });
  }

  // Update button state
  const wireframeBtn = document.getElementById("wireframe-toggle");
  if (wireframeOn) {
    wireframeBtn.classList.add("active");
    wireframeBtn.textContent = "Solid View";
  } else {
    wireframeBtn.classList.remove("active");
    wireframeBtn.textContent = "Wireframe View";
  }
}

// Toggle auto-rotation
function toggleAutoRotate() {
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;

  // Update button state
  const rotateBtn = document.getElementById("rotate-toggle");
  if (autoRotate) {
    rotateBtn.classList.add("active");
  } else {
    rotateBtn.classList.remove("active");
  }
}

// Toggle ambient lighting
function toggleAmbientLight() {
  if (ambientLight.intensity > 0) {
    ambientLight.intensity = 0;
    document.getElementById("lighting-toggle").classList.remove("active");
  } else {
    ambientLight.intensity = 0.4;
    document.getElementById("lighting-toggle").classList.add("active");
  }
}

// Set camera positions
function setCameraPosition(position) {
  switch (position) {
    case "front":
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 5,
        duration: 1,
      });
      break;
    case "top":
      gsap.to(camera.position, {
        x: 0,
        y: 5,
        z: 0,
        duration: 1,
      });
      break;
    case "side":
      gsap.to(camera.position, {
        x: 5,
        y: 0,
        z: 0,
        duration: 1,
      });
      break;
    default:
      resetCamera();
  }
}

// Reset camera to default position
function resetCamera() {
  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 5,
    duration: 1,
  });
  controls.target.set(0, 0, 0);
}

// Add all event listeners
function addEventListeners() {
  // Model selection buttons
  document.querySelectorAll(".model-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      showModel(btn.dataset.model);
    });
  });

  // Toggle wireframe
  document.getElementById("wireframe-toggle").addEventListener("click", () => {
    setWireframe(!isWireframe);
  });

  // Toggle auto-rotate
  document
    .getElementById("rotate-toggle")
    .addEventListener("click", toggleAutoRotate);

  // Toggle ambient light
  document
    .getElementById("lighting-toggle")
    .addEventListener("click", toggleAmbientLight);

  // Camera position buttons
  document.getElementById("camera-front").addEventListener("click", () => {
    setCameraPosition("front");
  });
  document.getElementById("camera-top").addEventListener("click", () => {
    setCameraPosition("top");
  });
  document.getElementById("camera-side").addEventListener("click", () => {
    setCameraPosition("side");
  });
  document
    .getElementById("camera-reset")
    .addEventListener("click", resetCamera);
}

// Handle window resize
function onWindowResize() {
  const container = document.getElementById("canvas-container");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  // Render scene
  renderer.render(scene, camera);
}

// Initialize the application when the DOM is loaded
if (document.getElementById("canvas-container")) {
  init();
}
