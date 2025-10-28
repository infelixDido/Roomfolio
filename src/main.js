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
scene.background = new THREE.Color("##B2BBD9");

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

document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener("click", (e) => {
    const modal = e.target.closest(".modal");
    hideModal(modal);
  });
});

const Minecraft_Block = [];

const raycasterObjects = [];
let currentIntersects = [];

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//Loaders

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
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
controls.maxPolarAngle = Math.PI / 2.5;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

controls.update();
controls.target.set(0, 2, 0);

window.addEventListener("mousemove", (event) => {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
})

window.addEventListener("click", (event) => {
  if(currentIntersects.length > 0){
    const object = currentIntersects[0].object;
    if (object.name.includes("Poster")){
      showModal(modals.about);
    }
  }
});

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
