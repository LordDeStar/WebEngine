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
});
animator.AddClip((object) => {
    object.transform.rotation[0] += 0.01;
});

world._objects.push(box);
world.start();
renderer.material.loadFromMLT('./cube.mlt');
let rotating = false;
document.addEventListener('keydown', (e) => {
    if (e.key == 'ArrowRight') {
        box.transform.rotation[1] += 0.03;
    } else if (e.key == 'ArrowLeft') {
        box.transform.rotation[1] -= 0.03;
    } else if (e.key == 'ArrowUp') {
        box.transform.rotation[0] += 0.03;
    } else if (e.key == 'ArrowDown') {
        box.transform.rotation[0] -= 0.03;
    } else if (e.key == "Escape") {
        rotating = !rotating;
    }
});

document.addEventListener('mousemove', (e) => {
    if (rotating) {
        box.transform.rotation[1] = e.clientX * 0.01;
        box.transform.rotation[0] = e.clientY * 0.01;
    }
});
