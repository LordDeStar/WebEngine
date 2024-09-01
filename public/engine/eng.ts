const THREE = require('three')
const CANNON = require('../libs/cannon.js')
let scene
let camera
let renderer
let world
let loader

interface IComponent{
  Init():void
  GetName():string
  OnUpdate():void
  BeforeRemove():void
}
class Collider implements IComponent{
  private form: string
  private params: any
  private Shape: any
  constructor(form: string, params: any){
    this.form = form.toLowerCase()
    this.params = params
  }
  public Init(): void {
    switch(this.form){
      case "box":
        this.Shape = new CANNON.Box(this.params.halfSize)
        break
      case "capsule":
        this.Shape = new CANNON.Capsule(this.params.radius, this.params.lenght, this.params.orientation)
        break
      case "plane":
        this.Shape = new CANNON.Plane(this.params.normal, this.params.constant)
        break
    }
  }
  public GetName(): string {
    return `${this.form} collider`
  }
  public GetShape(): any{
    return this.Shape
  }
  public OnUpdate(): void {
    
  }
  public BeforeRemove(): void {
    
  }


}
class RigidBody implements IComponent{
  private mass: number
  private renderer: any
  private shape: any
  private body: any
  private position: any
  private quaternion: any
  private collider
  constructor(meshRenderer, collider: Collider, mass){
    this.renderer = meshRenderer
    this.collider = collider
    this.mass = mass

    let {x,y,z} = this.renderer.GetPosition()
    let q = this.renderer.GetQuaternion()

    this.position = new CANNON.Vec3(x,y,z)
    this.quaternion = new CANNON.Quaternion(q.x, q.y, q.z, q.w)
  }
  private InitBody(): void{
    this.body = new CANNON.Body({
      mass: this.mass,
      shape: this.shape,
      position: this.position,
      quaternion: this.quaternion
    })
  }

  public Init(): void {
    this.shape = this.collider.GetShape()
    this.InitBody()
    world.addBody(this.body)
  }
  public GetName(): string {
    return "Rigid body"
  }
  public OnUpdate(): void{
    let {x,y,z} = this.body.position
    let q = this.body.quaternion
    this.renderer.SetPosition(x,y,z)
    this.renderer.SetQuaternion(q.x,q.y,q.z,q.w)
  }
  public BeforeRemove(): void {
    world.removeBody(this.body)
  }
  public GetPosition(): any{
    return this.body.position
  }
  public SetPosition(x: number, y: number, z: number): void{
    this.body.position.set(x,y,z)
  }
}
class MeshRenderer implements IComponent{
  private geometry: any
  private material: any
  private mesh: any
  constructor(geometry: any, material: any){
    this.geometry = geometry
    this.material = material
    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }
  public Init(): void{
    scene.add(this.mesh)
  }
  public GetName(): string {
    return "Mesh renderer"
  }
  public OnUpdate():void{

  }
  public BeforeRemove(): void {
    scene.remove(this.mesh)
  }
  public SetPosition(x:number, y:number, z: number): void{
    this.mesh.position.set(x,y,z)
  }
  public GetPosition(): any{
    return this.mesh.position
  }
  public SetEuler(x,y,z): void{
    this.mesh.rotation.set(x,y,z)
  }
  public GetEuler(): any{
    return this.mesh.rotation
  }
  public SetQuaternion(x,y,z,w): void{
    this.mesh.quaternion.copy(new THREE.Quaternion(x,y,z,w));
  }
  public GetQuaternion(): any{
    return this.mesh.quaternion
  }
  public GetGeometry(): any{
    return this.mesh.geometry
  }
}
class MeshController implements IComponent{
  private renderer: any
  private speed: number
  private keys = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
  } 
  constructor(meshRenderer, speed){
    this.renderer = meshRenderer
    this.speed = speed
  }
  public Init(): void {
    document.addEventListener('keydown',(e)=>{
      if (this.keys[e.key] !== undefined){
        this.keys[e.key] = true
      }
    })
    document.addEventListener('keyup', (e)=>{
      if (this.keys[e.key] !== undefined){
        this.keys[e.key] = false
      }
    })
  }
  private Move(): void{
    let currentPos = this.renderer.GetPosition()
    if (this.keys.a){
      currentPos.x -= this.speed
    }
    if (this.keys.d){
      currentPos.x += this.speed
    }
    if (this.keys.s){
      currentPos.z += this.speed
    }
    if(this.keys.w){
      currentPos.z -= this.speed
    }
    let {x, y, z} = currentPos
    this.renderer.SetPosition(x,y,z)
  }
  public GetName(): string {
    return "Character controller"
  }
  public OnUpdate(): void {
    this.Move()
  }
  public BeforeRemove(): void {
    
  }
  
}
class RigidBodyController implements IComponent{
  private body: any
  private speed: number
  private keys = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
  }
  constructor(body: RigidBody, speed: number){
    this.body = body
    this.speed = speed
  }
  public Init(): void {
    document.addEventListener('keydown',(e)=>{
      if (this.keys[e.key] !== undefined){
        this.keys[e.key] = true
      }
    })
    document.addEventListener('keyup', (e)=>{
      if (this.keys[e.key] !== undefined){
        this.keys[e.key] = false
      }
    })
  }
  public GetName(): string {
    return "Rigid body controller"  
  }
  public OnUpdate(): void{
    this.Move()
  }
  public BeforeRemove(): void {
    
  }
  private Move(): void{
    let currentPos = this.body.GetPosition()
    if (this.keys.a){
      currentPos.x -= this.speed
    }
    if (this.keys.d){
      currentPos.x += this.speed
    }
    if (this.keys.s){
      currentPos.z += this.speed
    }
    if(this.keys.w){
      currentPos.z -= this.speed
    }
    let {x, y, z} = currentPos
    this.body.SetPosition(x,y,z)
  }

}
class GameObject{
  public Components: IComponent[]
  constructor(){
    this.Components = []
  }
  public AddComponent(component: IComponent): void{
    this.Components.push(component)
  }
  public GetComponentByName(name: string): IComponent| undefined{
    return this.Components.find(item => item.GetName() === name)
  }
  public RemoveComponent(name:string): void{
    let component = this.GetComponentByName(name)
    if (component){
      component.BeforeRemove()
      const index = this.Components.indexOf(component)
      if (index !== -1) {
        this.Components.splice(index, 1)
      }
    }
    
  }
}
class Animation{
  private target: any
  private func: any
  constructor(obj, f){
    this.target = obj
    this.func = f
  }
  public OnUpdate(): void{
    this.func(this.target)
  }
}
export class Engine{
  private aspect: number
  private animationPull: Animation[]
  private objectPull: GameObject[]
  constructor(settings:any){   
    this.animationPull = []
    this.objectPull = []
    this.InitRenderer(settings.container)
    this.InitCamera(settings.camera)
    this.InitScene()
    this.InitLight()
    this.InitPhysics()
    
  }
  private InitRenderer(container: HTMLElement):void{
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    this.aspect = container.clientWidth / container.clientHeight

  }
  private InitCamera(settings): void{
    camera = new THREE.PerspectiveCamera(settings.fov, this.aspect, settings.near, settings.far)
    camera.position.set(0, 5, 5)
    camera.lookAt(new THREE.Vector3(0,0,0))
  }
  private InitScene():void{
    scene = new THREE.Scene()
  }
  private InitLight():void{
    let ambientLight = new THREE.AmbientLight(0xffffff, 1)
    let light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(0,10,0)
    scene.add(light)
    scene.add(ambientLight)
  }
  private InitPhysics(): void{
    world = new CANNON.World()
    world.gravity.set(0, -9.81, 0)
  }
  private InitPlane():void{

    let planeGeometry = new THREE.PlaneGeometry(50,50)
    let planeMaterial = new THREE.MeshStandardMaterial({color: 'green'})
    let meshRenderer = new MeshRenderer(planeGeometry, planeMaterial)
    meshRenderer.SetPosition(0, -15, 0)
    let collider = new Collider("box", {halfSize: new CANNON.Vec3(25,0.05,25)})
    let body = new RigidBody(meshRenderer, collider, 0)
    let plane = new GameObject()
    plane.AddComponent(meshRenderer)
    plane.AddComponent(collider)
    plane.AddComponent(body)

    this.AddGameObject(plane)
  }
  private TestScene():void{
    this.InitPlane()
    let geometry = new THREE.BoxGeometry(1,1,1)
    let material = new THREE.MeshStandardMaterial({color: 'blue'})
    let meshRenderer = new MeshRenderer(geometry, material)
    meshRenderer.SetPosition(0, 10, 0)
    let collider = new Collider("box", {halfSize: new CANNON.Vec3(0.5,0.5,0.5)})
    let body = new RigidBody(meshRenderer, collider, 1)
    let controller = new RigidBodyController(body, 0.5)
    let box = new GameObject()
    box.AddComponent(meshRenderer)
    box.AddComponent(collider)
    box.AddComponent(body)
    box.AddComponent(controller)
    this.AddGameObject(box)
  }
  public AddAnimation(target: any, func: any): void{
    this.animationPull.push(new Animation(target, func))
  }
  public AddGameObject(gameObject: GameObject): void{
    this.objectPull.push(gameObject)
  }
  Start = () =>{
    this.objectPull.forEach(item=>{
      item.Components.forEach(component=>{
        component.Init()
      })
    })
  }
  Update = ()=>{
    requestAnimationFrame(this.Update)
    this.animationPull.forEach(anim =>{
      anim.OnUpdate()
    })
    this.objectPull.forEach(item=>{
      item.Components.forEach(component=>{
        component.OnUpdate()
      })
    })
    world.step(1/60)
    renderer.render(scene, camera)
  }
}