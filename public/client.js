import { Engine, Material, Renderer, GameObject, Animator, TemplateGeometry } from './build/engine.js';
import { testScript } from './test.js';

let world = new Engine();

let box = new GameObject("box");
let geometry = await TemplateGeometry.loadFromOBJ('./cube.obj');
let renderer = new Renderer(geometry);


box.transform.position[0] = 0;
box.transform.position[1] = 0;
box.transform.position[2] = 15;

let animator = new Animator();

box.AddComponent(animator);
box.AddComponent(renderer);

animator.AddClip((object) => {
    object.transform.rotation[1] += 0.01;
    object.transform.rotation[0] += 0.01;

    object.transform.position[1] = Math.sin(object.transform.position[1] + 0.1);
});
animator.AddClip((object) => {
    object.transform.rotation[0] += 0.01;
});


world._objects.push(box);
await world.start();
renderer.loadTexture('./minecraft_desk.png');
animator.Next();