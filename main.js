import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

// --- CONFIGURATION ---
const blockSize = 1;
const worldSize = 32; // Size of the ground
const blocks = new Map(); // Store block data: "x,y,z" => meshId

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(50, 100, 50);
scene.add(sunLight);

// --- MATERIALS & GENERATION ---
const loader = new THREE.TextureLoader();
// Using a high-quality grass texture link
const texture = loader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
texture.magFilter = THREE.NearestFilter; // Makes it look pixelated like Minecraft
const material = new THREE.MeshLambertMaterial({ map: texture });
const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);

// Create a function to add blocks to the scene
function addBlock(x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    blocks.set(`${x},${y},${z}`, mesh);
}

// Generate a starter floor
for (let x = -worldSize/2; x < worldSize/2; x++) {
    for (let z = -worldSize/2; z < worldSize/2; z++) {
        addBlock(x, 0, z);
    }
}

// --- CONTROLS & INTERACTION ---
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
    if (!controls.isLocked) controls.lock();
});

// BUILD & BREAK LOGIC
window.addEventListener('mousedown', (e) => {
    if (!controls.isLocked) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        
        if (e.button === 0) { // Left Click: BREAK
            scene.remove(intersect.object);
        } 
        else if (e.button === 2) { // Right Click: PLACE
            const pos = intersect.object.position.clone().add(intersect.face.normal);
            addBlock(pos.x, pos.y, pos.z);
        }
    }
});
// Prevent right-click menu from popping up
window.addEventListener('contextmenu', e => e.preventDefault());

// --- PHYSICS & MOVEMENT ---
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let canJump = false;

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveForward = true;
    if (e.code === 'KeyS') moveBackward = true;
    if (e.code === 'KeyA') moveLeft = true;
    if (e.code === 'KeyD') moveRight = true;
    if (e.code === 'Space' && canJump) { velocity.y += 5; canJump = false; }
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveForward = false;
    if (e.code === 'KeyS') moveBackward = false;
    if (e.code === 'KeyA') moveLeft = false;
    if (e.code === 'KeyD') moveRight = false;
});

camera.position.set(0, 5, 10);

let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked) {
        // Simple Gravity
        velocity.y -= 15 * delta;

        // WASD Movement
        const speed = 150.0;
        if (moveForward) velocity.z -= speed * delta;
        if (moveBackward) velocity.z += speed * delta;
        if (moveLeft) velocity.x -= speed * delta;
        if (moveRight) velocity.x += speed * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        
        camera.position.y += velocity.y * delta;

        // Floor Collision
        if (camera.position.y < 2.5) {
            velocity.y = 0;
            camera.position.y = 2.5;
            canJump = true;
        }
        
        // Damping (Makes movement feel smooth)
        velocity.x *= 0.9;
        velocity.z *= 0.9;
    }

    prevTime = time;
    renderer.render(scene, camera);
}
animate();
