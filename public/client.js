import { Engine, Renderer, GameObject, Animator, TemplateGeometry, Script } from './build/engine.js';
import { testScript } from './test.js';

let world = new Engine("100vw", "100vh");

let box = new GameObject("box");
let geometry = await TemplateGeometry.loadFromOBJ('./Vector.obj');
let renderer = new Renderer(geometry, './default.mtl');


box.transform.position[0] = 0;
box.transform.position[1] = 0;
box.transform.position[2] = 15;

let animator = new Animator();

box.AddComponent(animator);
box.AddComponent(renderer);
box.AddComponent(new Script(testScript));
animator.AddClip((object) => {
    object.transform.rotation[1] += 0.01;
    object.transform.rotation[0] += 0.01;

});
animator.AddClip((object) => {
    object.transform.rotation[0] += 0.01;
});


world._objects.push(box);
await world.start();
renderer.loadTexture('./minecraft_desk.png');

//renderer.setColor(6, 0, 0, 1);
animator.Next();