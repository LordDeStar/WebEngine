import {Engine, Material, Renderer, Cube, GameObject, Animator, Sphere, Script} from './build/engine.js';
import { testScript } from './test.js';
let world = new Engine();

let box = new GameObject("box");
let renderer = new Renderer(new Cube());
renderer.material = new Material(Engine._light);
renderer.material.setColor(0.0, 0.6, 0.0, 1.0);

box.transform.position[0] = 0;
box.transform.position[1] = 0;
box.transform.position[2] = 15;

let animator = new Animator();


box.AddComponent(animator);
box.AddComponent(renderer);
//box.AddComponent(new Script(testScript));
animator.AddClip((object) =>{
    object.transform.rotation[1] += 0.01;
});
animator.AddClip((object) => {
    object.transform.rotation[0] += 0.01;
});

world._objects.push(box);
world.start();
animator.Next();

setTimeout(()=>{
    animator.Next();
    //renderer.loadGeometry(new Sphere());
    renderer.loadTexture("./fox.jpg");
},5000);