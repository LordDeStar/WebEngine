import { Engine } from './engine/engine.js'
const settings = {
	container: document.body,
	camera: {
		fov: 75,
		near: 0.1,
		far: 1000,
	},
}
const world = new Engine(settings)
world.TestScene()

world.Start()
world.Update()
