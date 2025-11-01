import * as THREE from "three";
import './style.scss';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { anaglyphPass } from "three/examples/jsm/tsl/display/AnaglyphPassNode.js";
import { AmbientLight } from 'three';  
import gsap from "gsap";

const canvas = document.querySelector("#experience-canvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6efff);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const modals = {
  about: document.querySelector(".modal.about"), 
};


const showModal = (modal) => {
  modal.style.display = "block";
  gsap.set(modal, {opacity: 0});
  gsap.to(modal, {opacity: 1, duration: 0.5});
};

const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0, 
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    },
  });
};

/**  -------------------------- Loading Screen & Intro Animation -------------------------- */

const manager = new THREE.LoadingManager();

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");

manager.onLoad = function () {
  loadingScreenButton.style.border = "8px solid #d4e6e0";
  loadingScreenButton.style.background = "#01072c";
  loadingScreenButton.style.color = "#e6dede";
  loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
  loadingScreenButton.textContent = "Enter!";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.style.transition =
    "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
  let isDisabled = false;

  function handleEnter() {
    if (isDisabled) return;

    loadingScreenButton.style.cursor = "default";
    loadingScreenButton.style.border = "8px solid #2d365c";
    loadingScreenButton.style.background = "#d4e6e0";
    loadingScreenButton.style.color = "#2a0f4e";
    loadingScreenButton.style.boxShadow = "none";
    loadingScreenButton.textContent = "- Welcome -";
    loadingScreen.style.background = "#d4e6e0";
    isDisabled = true;

    playReveal();
  }

  loadingScreenButton.addEventListener("mouseenter", () => {
    loadingScreenButton.style.transform = "scale(1.3)";
  });

  loadingScreenButton.addEventListener("touchend", (e) => {
    touchHappened = true;
    e.preventDefault();
    handleEnter();
  });

  loadingScreenButton.addEventListener("click", (e) => {
    if (touchHappened) return;
    handleEnter(true);
  });

  loadingScreenButton.addEventListener("mouseleave", () => {
    loadingScreenButton.style.transform = "none";
  });
};

function playReveal() {
  const tl = gsap.timeline();

  tl.to(loadingScreen, {
    scale: 0.5,
    duration: 1.2,
    delay: 0.25,
    ease: "back.in(1.8)",
  }).to(
    loadingScreen,
    {
      y: "200vh",
      transform: "perspective(1000px) rotateX(45deg) rotateY(-35deg)",
      duration: 1.2,
      ease: "back.in(1.8)",
      onComplete: () => {
        loadingScreen.remove();
      },
    },
    "-=0.1"
  );
}

let touchHappened = false;
document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener(
    "touchend", 
    (e) => {
      touchHappened = true;
      const modal = e.target.closest(".modal");
      hideModal(modal);
    },
    {passive: false}
  );
  
  button.addEventListener(
    "click", 
    (e) => {
      if (touchHappened) return;
      const modal = e.target.closest(".modal");
      hideModal(modal);
    },
    {passive: false}
  );
});

const Minecraft_Block = [];

const raycasterObjects = [];
let currentIntersects = [];

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);



loader.load(
  'models/roomfolio_no_bake_v2-v1.glb',
  (glb) => {
    glb.scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name.includes("Minecraft_Block")){
          Minecraft_Block.push(child);
        }
        if (child.name.includes("_Target")){
          raycasterObjects.push(child);
        }
      }
    });
    scene.add(glb.scene);
  },
  function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  function (error) {
      console.error('An error happened', error);
  }
);

const ambientLight = new AmbientLight(0xfff5b6, 5); // Color, Intensity
scene.add(ambientLight);

const handSprite = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load('/textures/click_full_white.png'),
    transparent: true,
  })
);
handSprite.scale.set(1, 1, 1);
handSprite.position.set(-2.8, 8, -5.8);
scene.add(handSprite);


const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  200
);

camera.position.set(
  30,
  9,
  30,
)

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
/*
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
*/

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.minDistance = 5;
controls.maxDistance = 45;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

controls.update();
controls.target.set(0, 2, 0);

window.addEventListener("mousemove", (event) => {
    touchHappened = false;
    pointer.x = ( event.clientX / sizes.width ) * 2 - 1;
    pointer.y = - ( event.clientY / sizes.height ) * 2 + 1;
});

window.addEventListener(
  "touchstart", 
  (event) => {
    event.preventDefault();
    pointer.x = ( event.touches[0].clientX / sizes.width ) * 2 - 1;
    pointer.y = - ( event.touches[0].clientY / sizes.height ) * 2 + 1;
  }, 
  {passive: false}
);

window.addEventListener(
  "touchend", 
  (event) => {
    event.preventDefault();
    handleRaycasterInteraction();
  },
  {passive: false}
);

function handleRaycasterInteraction() {
  if(currentIntersects.length > 0){
    const object = currentIntersects[0].object;
    if (object.name.includes("Poster") || object.name.includes()){
      showModal(modals.about);
      handSprite.visible = false;
    }
  }
}

window.addEventListener("click", handleRaycasterInteraction);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const render = () => {
  controls.update();
  /*
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  */
  Minecraft_Block.forEach((block) => {
    block.rotation.y += 0.01;
  });

  const pulsetime = Date.now() * 0.003;
  const brightness = 0.8 + Math.sin(pulsetime) * 0.2;
  handSprite.material.color.setRGB(brightness, brightness, brightness);
  handSprite.material.opacity = 0.8 + Math.sin(pulsetime) * 0.2;

  //Raycaster
  raycaster.setFromCamera( pointer, camera );
  
  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  for ( let i = 0; i < currentIntersects.length; i ++ ) {
  }

  if(currentIntersects.length > 0){
    document.body.style.cursor = 'pointer';
  }else{
    document.body.style.cursor = 'default';
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame( render );
};

render();
