"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
var THREE = require('three');
var CANNON = require('../libs/cannon.js');
var scene;
var camera;
var renderer;
var world;
var loader;
var Collider = /** @class */ (function () {
    function Collider(form, params) {
        this.form = form.toLowerCase();
        this.params = params;
    }
    Collider.prototype.Init = function () {
        switch (this.form) {
            case "box":
                this.Shape = new CANNON.Box(this.params.halfSize);
                break;
            case "capsule":
                this.Shape = new CANNON.Capsule(this.params.radius, this.params.lenght, this.params.orientation);
                break;
            case "plane":
                this.Shape = new CANNON.Plane(this.params.normal, this.params.constant);
                break;
        }
    };
    Collider.prototype.GetName = function () {
        return "".concat(this.form, " collider");
    };
    Collider.prototype.GetShape = function () {
        return this.Shape;
    };
    Collider.prototype.OnUpdate = function () {
    };
    Collider.prototype.BeforeRemove = function () {
    };
    return Collider;
}());
var RigidBody = /** @class */ (function () {
    function RigidBody(meshRenderer, collider, mass) {
        this.renderer = meshRenderer;
        this.collider = collider;
        this.mass = mass;
        var _a = this.renderer.GetPosition(), x = _a.x, y = _a.y, z = _a.z;
        var q = this.renderer.GetQuaternion();
        this.position = new CANNON.Vec3(x, y, z);
        this.quaternion = new CANNON.Quaternion(q.x, q.y, q.z, q.w);
    }
    RigidBody.prototype.InitBody = function () {
        this.body = new CANNON.Body({
            mass: this.mass,
            shape: this.shape,
            position: this.position,
            quaternion: this.quaternion
        });
    };
    RigidBody.prototype.Init = function () {
        this.shape = this.collider.GetShape();
        this.InitBody();
        world.addBody(this.body);
    };
    RigidBody.prototype.GetName = function () {
        return "Rigid body";
    };
    RigidBody.prototype.OnUpdate = function () {
        var _a = this.body.position, x = _a.x, y = _a.y, z = _a.z;
        var q = this.body.quaternion;
        this.renderer.SetPosition(x, y, z);
        this.renderer.SetQuaternion(q.x, q.y, q.z, q.w);
    };
    RigidBody.prototype.BeforeRemove = function () {
        world.removeBody(this.body);
    };
    RigidBody.prototype.GetPosition = function () {
        return this.body.position;
    };
    RigidBody.prototype.SetPosition = function (x, y, z) {
        this.body.position.set(x, y, z);
    };
    return RigidBody;
}());
var MeshRenderer = /** @class */ (function () {
    function MeshRenderer(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }
    MeshRenderer.prototype.Init = function () {
        scene.add(this.mesh);
    };
    MeshRenderer.prototype.GetName = function () {
        return "Mesh renderer";
    };
    MeshRenderer.prototype.OnUpdate = function () {
    };
    MeshRenderer.prototype.BeforeRemove = function () {
        scene.remove(this.mesh);
    };
    MeshRenderer.prototype.SetPosition = function (x, y, z) {
        this.mesh.position.set(x, y, z);
    };
    MeshRenderer.prototype.GetPosition = function () {
        return this.mesh.position;
    };
    MeshRenderer.prototype.SetEuler = function (x, y, z) {
        this.mesh.rotation.set(x, y, z);
    };
    MeshRenderer.prototype.GetEuler = function () {
        return this.mesh.rotation;
    };
    MeshRenderer.prototype.SetQuaternion = function (x, y, z, w) {
        this.mesh.quaternion.copy(new THREE.Quaternion(x, y, z, w));
    };
    MeshRenderer.prototype.GetQuaternion = function () {
        return this.mesh.quaternion;
    };
    MeshRenderer.prototype.GetGeometry = function () {
        return this.mesh.geometry;
    };
    return MeshRenderer;
}());
var MeshController = /** @class */ (function () {
    function MeshController(meshRenderer, speed) {
        this.keys = {
            "w": false,
            "a": false,
            "s": false,
            "d": false
        };
        this.renderer = meshRenderer;
        this.speed = speed;
    }
    MeshController.prototype.Init = function () {
        var _this = this;
        document.addEventListener('keydown', function (e) {
            if (_this.keys[e.key] !== undefined) {
                _this.keys[e.key] = true;
            }
        });
        document.addEventListener('keyup', function (e) {
            if (_this.keys[e.key] !== undefined) {
                _this.keys[e.key] = false;
            }
        });
    };
    MeshController.prototype.Move = function () {
        var currentPos = this.renderer.GetPosition();
        if (this.keys.a) {
            currentPos.x -= this.speed;
        }
        if (this.keys.d) {
            currentPos.x += this.speed;
        }
        if (this.keys.s) {
            currentPos.z += this.speed;
        }
        if (this.keys.w) {
            currentPos.z -= this.speed;
        }
        var x = currentPos.x, y = currentPos.y, z = currentPos.z;
        this.renderer.SetPosition(x, y, z);
    };
    MeshController.prototype.GetName = function () {
        return "Character controller";
    };
    MeshController.prototype.OnUpdate = function () {
        this.Move();
    };
    MeshController.prototype.BeforeRemove = function () {
    };
    return MeshController;
}());
var RigidBodyController = /** @class */ (function () {
    function RigidBodyController(body, speed) {
        this.keys = {
            "w": false,
            "a": false,
            "s": false,
            "d": false
        };
        this.body = body;
        this.speed = speed;
    }
    RigidBodyController.prototype.Init = function () {
        var _this = this;
        document.addEventListener('keydown', function (e) {
            if (_this.keys[e.key] !== undefined) {
                _this.keys[e.key] = true;
            }
        });
        document.addEventListener('keyup', function (e) {
            if (_this.keys[e.key] !== undefined) {
                _this.keys[e.key] = false;
            }
        });
    };
    RigidBodyController.prototype.GetName = function () {
        return "Rigid body controller";
    };
    RigidBodyController.prototype.OnUpdate = function () {
        this.Move();
    };
    RigidBodyController.prototype.BeforeRemove = function () {
    };
    RigidBodyController.prototype.Move = function () {
        var currentPos = this.body.GetPosition();
        if (this.keys.a) {
            currentPos.x -= this.speed;
        }
        if (this.keys.d) {
            currentPos.x += this.speed;
        }
        if (this.keys.s) {
            currentPos.z += this.speed;
        }
        if (this.keys.w) {
            currentPos.z -= this.speed;
        }
        var x = currentPos.x, y = currentPos.y, z = currentPos.z;
        this.body.SetPosition(x, y, z);
    };
    return RigidBodyController;
}());
var GameObject = /** @class */ (function () {
    function GameObject() {
        this.Components = [];
    }
    GameObject.prototype.AddComponent = function (component) {
        this.Components.push(component);
    };
    GameObject.prototype.GetComponentByName = function (name) {
        return this.Components.find(function (item) { return item.GetName() === name; });
    };
    GameObject.prototype.RemoveComponent = function (name) {
        var component = this.GetComponentByName(name);
        if (component) {
            component.BeforeRemove();
            var index = this.Components.indexOf(component);
            if (index !== -1) {
                this.Components.splice(index, 1);
            }
        }
    };
    return GameObject;
}());
var Animation = /** @class */ (function () {
    function Animation(obj, f) {
        this.target = obj;
        this.func = f;
    }
    Animation.prototype.OnUpdate = function () {
        this.func(this.target);
    };
    return Animation;
}());
var Engine = /** @class */ (function () {
    function Engine(settings) {
        var _this = this;
        this.Start = function () {
            _this.objectPull.forEach(function (item) {
                item.Components.forEach(function (component) {
                    component.Init();
                });
            });
        };
        this.Update = function () {
            requestAnimationFrame(_this.Update);
            _this.animationPull.forEach(function (anim) {
                anim.OnUpdate();
            });
            _this.objectPull.forEach(function (item) {
                item.Components.forEach(function (component) {
                    component.OnUpdate();
                });
            });
            world.step(1 / 60);
            renderer.render(scene, camera);
        };
        this.animationPull = [];
        this.objectPull = [];
        this.InitRenderer(settings.container);
        this.InitCamera(settings.camera);
        this.InitScene();
        this.InitLight();
        this.InitPhysics();
    }
    Engine.prototype.InitRenderer = function (container) {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        this.aspect = container.clientWidth / container.clientHeight;
    };
    Engine.prototype.InitCamera = function (settings) {
        camera = new THREE.PerspectiveCamera(settings.fov, this.aspect, settings.near, settings.far);
        camera.position.set(0, 5, 5);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    };
    Engine.prototype.InitScene = function () {
        scene = new THREE.Scene();
    };
    Engine.prototype.InitLight = function () {
        var ambientLight = new THREE.AmbientLight(0xffffff, 1);
        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 10, 0);
        scene.add(light);
        scene.add(ambientLight);
    };
    Engine.prototype.InitPhysics = function () {
        world = new CANNON.World();
        world.gravity.set(0, -9.81, 0);
    };
    Engine.prototype.InitPlane = function () {
        var planeGeometry = new THREE.PlaneGeometry(50, 50);
        var planeMaterial = new THREE.MeshStandardMaterial({ color: 'green' });
        var meshRenderer = new MeshRenderer(planeGeometry, planeMaterial);
        meshRenderer.SetPosition(0, -15, 0);
        var collider = new Collider("box", { halfSize: new CANNON.Vec3(25, 0.05, 25) });
        var body = new RigidBody(meshRenderer, collider, 0);
        var plane = new GameObject();
        plane.AddComponent(meshRenderer);
        plane.AddComponent(collider);
        plane.AddComponent(body);
        this.AddGameObject(plane);
    };
    Engine.prototype.TestScene = function () {
        this.InitPlane();
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshStandardMaterial({ color: 'blue' });
        var meshRenderer = new MeshRenderer(geometry, material);
        meshRenderer.SetPosition(0, 10, 0);
        var collider = new Collider("box", { halfSize: new CANNON.Vec3(0.5, 0.5, 0.5) });
        var body = new RigidBody(meshRenderer, collider, 1);
        var controller = new RigidBodyController(body, 0.5);
        var box = new GameObject();
        box.AddComponent(meshRenderer);
        box.AddComponent(collider);
        box.AddComponent(body);
        box.AddComponent(controller);
        this.AddGameObject(box);
    };
    Engine.prototype.AddAnimation = function (target, func) {
        this.animationPull.push(new Animation(target, func));
    };
    Engine.prototype.AddGameObject = function (gameObject) {
        this.objectPull.push(gameObject);
    };
    return Engine;
}());
exports.Engine = Engine;
