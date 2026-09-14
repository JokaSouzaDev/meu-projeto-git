import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.querySelector('#scene');
const loaderEl = document.querySelector('#loader');
const loaderBar = document.querySelector('#loader-bar');
const progressLabel = document.querySelector('#progress-label');
const scrollDot = document.querySelector('#scroll-dot');
const chapters = [...document.querySelectorAll('.chapter')];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.055);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(5.4, 2.35, 7.6);
const carRig = new THREE.Group();
scene.add(carRig);

const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
keyLight.position.set(-4, 7, 5);
keyLight.castShadow = true;
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xd9e8ff, 55, 18, 2);
rimLight.position.set(4, 3.5, -4);
scene.add(rimLight);
const redLight = new THREE.PointLight(0xff0026, 0, 10, 2);
redLight.position.set(2.7, 1.1, 0);
scene.add(redLight);
scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 1.1));

const ground = new THREE.Mesh(new THREE.CircleGeometry(7.5, 96), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.46, metalness: 0.1, transparent: true, opacity: 0.62 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
ground.receiveShadow = true;
scene.add(ground);
const shadow = new THREE.Mesh(new THREE.CircleGeometry(2.7, 64), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2;
shadow.scale.set(1.5, .55, 1);
shadow.position.y = 0.015;
scene.add(shadow);

const materials = {
  paint: new THREE.MeshPhysicalMaterial({ color: 0xe9e9e5, metalness: 0.62, roughness: 0.23, clearcoat: 1, clearcoatRoughness: 0.08 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x0a1016, metalness: 0.05, roughness: 0.12, transmission: 0.18, transparent: true, opacity: 0.84, clearcoat: 1 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x070707, metalness: 0.0, roughness: 0.8 }),
  rim: new THREE.MeshPhysicalMaterial({ color: 0x8f9397, metalness: 1, roughness: 0.18, clearcoat: .4 }),
  brake: new THREE.MeshStandardMaterial({ color: 0xb80f1b, metalness: 0.5, roughness: 0.35 }),
  trim: new THREE.MeshStandardMaterial({ color: 0x0a0a0b, metalness: 0.65, roughness: 0.28 }),
  head: new THREE.MeshPhysicalMaterial({ color: 0xf5fbff, emissive: 0xb9dcff, emissiveIntensity: 1.4, roughness: .12, clearcoat: 1 }),
  tail: new THREE.MeshPhysicalMaterial({ color: 0xff1738, emissive: 0xff001e, emissiveIntensity: 3.2, roughness: .2 })
};

function applyMaterial(mesh) {
  const n = mesh.name.toLowerCase();
  if (n.includes('glass')) mesh.material = materials.glass;
  else if (n.includes('tire')) mesh.material = materials.tire;
  else if (n.includes('rim') || n.includes('hub')) mesh.material = materials.rim;
  else if (n.includes('brake')) mesh.material = materials.brake;
  else if (n.includes('light_head')) mesh.material = materials.head;
  else if (n.includes('light_tail')) mesh.material = materials.tail;
  else if (n.includes('trim') || n.includes('exhaust')) mesh.material = materials.trim;
  else mesh.material = materials.paint;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function createFallbackCar() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), materials.paint);
  body.scale.set(2.35, .48, .92); body.position.y = .74; g.add(body);
  const cabin = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), materials.glass);
  cabin.scale.set(1.18, .58, .75); cabin.position.set(.15, 1.28, 0); g.add(cabin);
  for (const x of [-1.38, 1.4]) for (const z of [-.95, .95]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .28, 48), materials.tire);
    wheel.rotation.x = Math.PI / 2; wheel.position.set(x, .46, z); g.add(wheel);
  }
  return g;
}

const gltfLoader = new GLTFLoader();
gltfLoader.load('./assets/porsche-911-concept.glb', (gltf) => {
  const car = gltf.scene;
  car.traverse((o) => { if (o.isMesh) applyMaterial(o); });
  carRig.add(car);
  loaderBar.style.width = '100%';
  setTimeout(() => loaderEl.classList.add('is-hidden'), 260);
}, (evt) => {
  if (evt.total) loaderBar.style.width = `${Math.min(92, (evt.loaded / evt.total) * 92)}%`;
}, () => {
  carRig.add(createFallbackCar());
  loaderBar.style.width = '100%';
  setTimeout(() => loaderEl.classList.add('is-hidden'), 260);
});

const state = { scroll: 0, smooth: 0, cameraPos: new THREE.Vector3(), target: new THREE.Vector3(0, .85, 0) };
function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function ease(t) { return t * t * (3 - 2 * t); }
function lerp(a,b,t) { return a + (b-a)*t; }
function keyframe(progress, frames) {
  const p = clamp01(progress);
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i], b = frames[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = ease((p - a.p) / (b.p - a.p));
      return lerp(a.v, b.v, t);
    }
  }
  return p < frames[0].p ? frames[0].v : frames[frames.length - 1].v;
}

const cameraZFrames = [{p:0,v:7.6},{p:.18,v:6.55},{p:.36,v:6.8},{p:.52,v:4.45},{p:.62,v:4.2},{p:.72,v:5.3},{p:.88,v:6.6},{p:1,v:7.5}];
const cameraXFrames = [{p:0,v:4.9},{p:.18,v:4.0},{p:.36,v:4.6},{p:.52,v:3.15},{p:.62,v:3.35},{p:.72,v:4.0},{p:.88,v:4.7},{p:1,v:5.1}];
const cameraYFrames = [{p:0,v:2.4},{p:.22,v:2.0},{p:.52,v:1.55},{p:.70,v:3.1},{p:.84,v:2.15},{p:1,v:2.4}];
const rigXFrames = [{p:0,v:0},{p:.43,v:0},{p:.52,v:-.72},{p:.63,v:-.78},{p:.72,v:0},{p:1,v:0}];
const rigYFrames = [{p:0,v:0},{p:.50,v:0},{p:.62,v:.12},{p:.74,v:0},{p:1,v:0}];

function updateScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  state.scroll = clamp01(window.scrollY / max);
}
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

function updateChapters(p) {
  let nearest = chapters[0];
  let nearestD = Infinity;
  chapters.forEach((el) => {
    const anchor = Number(el.dataset.progress || 0);
    const d = Math.abs(p - anchor);
    if (d < nearestD) { nearestD = d; nearest = el; }
  });
  chapters.forEach((el) => el.classList.toggle('is-current', el === nearest));
  progressLabel.textContent = `${String(Math.round(p * 100)).padStart(2,'0')}%`;
  scrollDot.style.top = `${p * 100}%`;
}

function animate() {
  requestAnimationFrame(animate);
  state.smooth += (state.scroll - state.smooth) * 0.065;
  const p = state.smooth;
  carRig.rotation.y = -0.56 - p * Math.PI * 4.3;
  carRig.rotation.x = Math.sin(p * Math.PI * 2.2) * 0.035;
  carRig.position.x += (keyframe(p, rigXFrames) - carRig.position.x) * .08;
  carRig.position.y += (keyframe(p, rigYFrames) - carRig.position.y) * .08;
  state.cameraPos.set(keyframe(p, cameraXFrames), keyframe(p, cameraYFrames), keyframe(p, cameraZFrames));
  camera.position.lerp(state.cameraPos, .075);
  const wheelFocus = Math.max(0, 1 - Math.abs(p - .57) / .12);
  state.target.lerp(new THREE.Vector3(lerp(0, -1.15, ease(wheelFocus)), lerp(.83, .52, ease(wheelFocus)), 0), .08);
  camera.lookAt(state.target);
  redLight.intensity = 8 + 52 * Math.max(0, 1 - Math.abs(p - .36) / .14);
  keyLight.intensity = 3.5 + Math.sin(p * Math.PI * 2) * .35;
  shadow.position.x = carRig.position.x * .7;
  updateChapters(p);
  renderer.render(scene, camera);
}
animate();

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 760 ? 1.35 : 1.8));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < 760 ? 42 : 34;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
