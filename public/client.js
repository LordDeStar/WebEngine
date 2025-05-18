import { Engine, Renderer, GameObject, Animator, TemplateGeometry, Script, Camera } from './build/engine.js';
import { testScript } from './test.js';

let world = new Engine("100%", "100%");
world.init("main");

let box = new GameObject("box");
let camera = new GameObject('camera');


let cameraComponent = new Camera();
let geometry = await TemplateGeometry.loadFromOBJ('./Vector.obj');
let renderer = new Renderer(geometry, './default.mtl', true);

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
    if(e.key == 'd') camera.transform.position[0] += 1;
    if(e.key == 'a') camera.transform.position[0] -= 1;
    if(e.key == 'w') camera.transform.position[2] += 1;
    if(e.key == 's') camera.transform.position[2] -= 1;


    console.log(Engine.viewMatrix)
})

document.getElementById('main').addEventListener('mousemove', (e)=>{
    let x = e.clientX;
    let y = e.clientY;


    cameraComponent.setCenter(x,y);
})
