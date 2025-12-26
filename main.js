import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

// 1. Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// 3. Blocks (The World)
const loader = new THREE.TextureLoader();
// Using a placeholder green color, but you can load a grass.png here
const material = new THREE.MeshLambertMaterial({ color: 0x4d9043 });
const geometry = new THREE.BoxGeometry(1, 1, 1);

for (let x = -10; x < 10; x++) {
    for (let z = -10; z < 10; z++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, z);
        scene.add(mesh);
    }
}

// 4. Controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = (e) => {
    if (e.code === 'KeyW') moveForward = true;
    if (e.code === 'KeyS') moveBackward = true;
    if (e.code === 'KeyA') moveLeft = true;
    if (e.code === 'KeyD') moveRight = true;
};
const onKeyUp = (e) => {
    if (e.code === 'KeyW') moveForward = false;
    if (e.code === 'KeyS') moveBackward = false;
    if (e.code === 'KeyA') moveLeft = false;
    if (e.code === 'KeyD') moveRight = false;
};
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

camera.position.y = 2; // Eyes level

// 5. Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const delta = 0.15; // Movement speed
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * delta;

        controls.moveRight(-velocity.x);
        controls.moveForward(-velocity.z);

        velocity.set(0, 0, 0); // Reset velocity each frame for simple movement
    }

    renderer.render(scene, camera);
}
animate();
