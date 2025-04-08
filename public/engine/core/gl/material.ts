import { gl, GLUtilities } from "./gl";
import { vec4 } from "gl-matrix";
import { Shader } from "./shader";
import { Light } from "./light";
import { Texture } from "./texture";

export interface MaterialProperties {
  name: string;
  Ns: number;
  Ka: vec4;
  Kd: vec4;
  Ks: vec4;
  d: number;
  illum: number;
  map_Kd?: string;
  map_Bump?: string;
  map_Ks?: string;
}

export class Material {
  private _shader: Shader;
  private _edgeShader: Shader;
  private _color: vec4;
  private _light: Light;
  private _textures: Texture[] = [];
  private _materials: MaterialProperties[] = [];
  private _currentMaterialIndex: number = 0;

  constructor(light: Light, materials: MaterialProperties[]) {
    this._color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this._light = light;
    this._materials = materials;
    this._shader = this.loadShader();
    this._edgeShader = this.loadEdgeShader();
    this._materials.forEach((material, index) => {
      if (material.map_Kd) {
        const texture = new Texture();
        texture.loadTexture(gl, material.map_Kd);
        this._textures[index] = texture;
      }
    });
  }
  public setCurrentMaterial(index: number): void {
    if (index >= 0 && index < this._materials.length) {
      this._currentMaterialIndex = index;
    } else {
      console.warn(`Индекс материала ${index} вне диапазона.`);
    }
  }
  public getCurrentMaterial(): MaterialProperties {
    return this._materials[this._currentMaterialIndex];
  }
  public getCurrentMaterialIndex(): number {
    return this._currentMaterialIndex;
  }
  public loadTexture(url: string, index: number): void {
    console.log(this._textures)
    if (index >= 0 && index < this._materials.length) {
      const texture = new Texture();
      texture.loadTexture(gl, url);
      this._textures[index] = texture;
    } else {
      console.warn(`Индекс материала ${index} вне диапазона.`);
    }
  }
  private loadEdgeShader(): Shader {
    const vertex = `
      attribute vec3 pos;
      uniform mat4 matrix;
      void main(){
        gl_Position = matrix * vec4(pos, 1.0);
      }
    `;
    const fragment = `
      precision mediump float;
      void main(void) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // зеленый цвет для ребер
      }
    `;

    return new Shader('edge', vertex, fragment);
  }
  private loadShader(): Shader {
    const vertex = `
      attribute vec3 pos;
      attribute vec2 texCoord;
      uniform mat4 matrix;
      varying vec3 vPos;
      varying vec2 vTexCoord;
      void main(){
        gl_Position = matrix * vec4(pos, 1.0);
        vPos = vec3(matrix * vec4(pos, 1.0));
        vTexCoord = texCoord;
      }
    `;
    const fragment = `
      precision mediump float;

      uniform vec4 Ka;
      uniform vec4 Kd;
      uniform vec4 Ks;
      uniform vec3 lightDirection;
      uniform vec4 ambientLight;
      uniform vec4 diffuseLight;
      uniform sampler2D uSampler;
      uniform vec4 uColor;
      uniform bool hasTexture;
      varying vec3 vPos;
      varying vec2 vTexCoord;

      void main(void) {
        vec3 normal = normalize(vPos);
        vec3 lightDir = normalize(lightDirection);
        float diff = max(dot(normal, lightDir), 0.0);

        vec4 ambient = ambientLight * Ka;

        vec4 diffuse = diffuseLight * Kd * diff;

        // Используем Ks для зеркального отражения
        vec4 specular = vec4(1.0) * Ks * pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);

        vec4 finalColor = ambient + diffuse + specular;

        vec4 texColor = texture2D(uSampler, vTexCoord);
        if (hasTexture) {
          gl_FragColor = finalColor * texColor * uColor;
        } else {
          gl_FragColor = finalColor * uColor;
        }
      }
    `;

    return new Shader('basic', vertex, fragment);
  }
  public setColor(red: number, green: number, blue: number, alpha: number): void {
    this._color = vec4.fromValues(red, green, blue, alpha);
  }
  public getAttributePosition(attr: string, shaderName: string): number {
    return (shaderName !== 'edge') ? this._shader.getAttributeLocation(attr) : this._edgeShader.getAttributeLocation(attr);
  }
  public getUniformPosition(uniform: string, shaderName: string): WebGLUniformLocation {
    return (shaderName !== 'edge') ? this._shader.getUniformLocation(uniform) : this._edgeShader.getUniformLocation(uniform);
  }
  public async loadFromMLT(url: string): Promise<void> {
    const materials = await GLUtilities.loadMTL(url);
    this._materials = materials;
    this._textures = []; // Сбрасываем текстуры
    materials.forEach((material, index) => {
      if (material.map_Kd) {
        const texture = new Texture();
        texture.loadTexture(gl, material.map_Kd);
        this._textures[index] = texture;
      }
    });
  }
  public basicUse(): void {
    this._shader.use();

    const currentMaterial = this.getCurrentMaterial();

    let loc = this._shader.getUniformLocation('Ka');
    gl.uniform4fv(loc, currentMaterial.Ka);

    loc = this._shader.getUniformLocation('Kd');
    gl.uniform4fv(loc, currentMaterial.Kd);

    loc = this._shader.getUniformLocation('Ks');
    gl.uniform4fv(loc, currentMaterial.Ks);

    loc = this._shader.getUniformLocation('lightDirection');
    gl.uniform3fv(loc, this._light.direction);

    loc = this._shader.getUniformLocation('ambientLight');
    gl.uniform4fv(loc, this._light.ambient);

    loc = this._shader.getUniformLocation('diffuseLight');
    gl.uniform4fv(loc, this._light.diffuse);

    loc = this._shader.getUniformLocation('uColor');
    gl.uniform4fv(loc, this._color);

    const texture = this._textures[this._currentMaterialIndex];
    loc = this._shader.getUniformLocation('hasTexture');
    gl.uniform1i(loc, texture && texture.isLoaded() ? 1 : 0);

    if (texture && texture.isLoaded()) {
      texture.bind(gl, 0);
      loc = this._shader.getUniformLocation('uSampler');
      gl.uniform1i(loc, 0);
    }
  }
  public edgeUse(): void {
    this._edgeShader.use();
  }
  public async toJson(): Promise<string> {
    try {
      // Ожидаем завершения всех асинхронных операций для текстур
      const texturesJson = await Promise.all(
        this._textures.map(async (texture) => await texture.toJson())
      );

      // Ожидаем завершения всех асинхронных операций для материалов
      const materialsJson = await Promise.all(
        this._materials.map(async (material) => await this.stringifyProperties(material))
      );

      // Сериализуем данные после завершения всех операций
      return JSON.stringify({
        shader: await this._shader.toJson(),
        edgeShader: await this._edgeShader.toJson(),
        color: this._color,
        textures: texturesJson,
        materials: materialsJson,
        currentIndex: this._currentMaterialIndex
      });
    } catch (error) {
      console.error("Error during material serialization:", error);
      throw error;
    }
  }
  private stringifyProperties(property: MaterialProperties): Promise<string> {
    return new Promise<string>(resolve => {
      resolve(JSON.stringify({
        name: property.name,
        Ns: property.Ns,
        Ka: property.Ka,
        Kd: property.Kd,
        Ks: property.Ks,
        d: property.d,
        illum: property.illum,
        map_Kd: property.map_Kd,
        map_Bump: property.map_Bump,
        map_Ks: property.map_Ks
      }));
    });
  };
}