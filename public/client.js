import { Engine, Renderer, GameObject, Animator, TemplateGeometry, Script, Camera } from './build/engine.js';
import { testScript } from './test.js';

let world = new Engine("100%", "100%");
world.init("main");

let box = new GameObject("box");
let camera = new GameObject('camera');


let cameraSpeed = 0.2;
let cameraComponent = new Camera();
let renderer = new Renderer('http://localhost:3003/user-1/qwe/123/Vector.obj', './default.mtl', true, 'http://localhost:3003/user-1/qwe/123/foxy.png');

box.transform.position[0] = 0;
box.transform.position[1] = 0;
box.transform.position[2] = 15;


box.AddComponent(renderer);
camera.AddComponent(cameraComponent);
cameraComponent.isGameStart = true;
world._objects.push(box);
world._objects.push(camera);

await world.start();





document.addEventListener('keydown', (e)=>{
    if(e.key == 'd') camera.transform.position[0] -= cameraSpeed;
    if(e.key == 'a') camera.transform.position[0] += cameraSpeed;
    if(e.key == 'w') camera.transform.position[2] += cameraSpeed;
    if(e.key == 's') camera.transform.position[2] -= cameraSpeed;


    console.log(Engine.viewMatrix)
})


