import { gl, GLUtilities } from "./gl";
import { vec4 } from "gl-matrix";
import { Shader } from "./shader";
import { Light } from "./light";
import { Texture } from "./texture"; // Импортируем новый класс Texture

export interface MaterialProperties {
  name: string;
  Ns: number;
  Ka: vec4;
  Kd: vec4;
  Ks: vec4;
  d: number;
  illum: number;
  map_Kd?: string;
}

export class Material {
  private _shader: Shader;
  private _edgeShader: Shader;
  private _color: vec4;
  private _light: Light;
  private _texture: Texture;
  private _properties: MaterialProperties;

  constructor(light: Light, properties: MaterialProperties) {
    this._color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this._light = light;
    this._texture = new Texture();
    this._properties = properties;
    this._shader = this.loadShader();
    this._edgeShader = this.loadEdgeShader();

    if (this._properties.map_Kd) {
      this.loadTexture(this._properties.map_Kd);
    }
  }

  // Метод для загрузки текстуры
  public loadTexture(url: string): void {
    this._texture.loadTexture(gl, url);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // черный цвет для ребер
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
uniform bool hasTexture;
varying vec3 vPos;
varying vec2 vTexCoord;

void main(void) {
    vec3 normal = normalize(vPos);
    vec3 lightDir = normalize(lightDirection);
    float diff = max(dot(normal, lightDir), 0.0);

    // Используем Ka для амбиентного освещения
    vec4 ambient = ambientLight * Ka;

    // Используем Kd для диффузного освещения
    vec4 diffuse = diffuseLight * Kd * diff;

    // Используем Ks для зеркального отражения
    vec4 specular = vec4(1.0) * Ks * pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);

    vec4 finalColor = ambient + diffuse + specular;

    vec4 texColor = texture2D(uSampler, vTexCoord);
    if (hasTexture) {
        gl_FragColor = finalColor * texColor;
    } else {
        gl_FragColor = finalColor;
    }
}

    `;

    return new Shader('basic', vertex, fragment);
  }

  public setColor(red: number, green: number, blue: number, alpha: number): void {
    this._color = vec4.fromValues(red, green, blue, alpha);
  }

  public getAttributePosition(attr: string, shaderName: string): number {
    return (shaderName != 'edge') ? this._shader.getAttributeLocation(attr) : this._edgeShader.getAttributeLocation(attr);
  }

  public getUniformPosition(uniform: string, shaderName: string): WebGLUniformLocation {
    return (shaderName != 'edge') ? this._shader.getUniformLocation(uniform) : this._edgeShader.getUniformLocation(uniform);
  }

  public async loadFromMLT(url: string): Promise<void> {
    this._properties = await GLUtilities.loadMTL(url);
  }

  public basicUse(): void {
    this._shader.use();

    let loc = this._shader.getUniformLocation('Ka');
    gl.uniform4fv(loc, this._properties.Ka);

    loc = this._shader.getUniformLocation('Kd');
    gl.uniform4fv(loc, this._properties.Kd);

    loc = this._shader.getUniformLocation('Ks');
    gl.uniform4fv(loc, this._properties.Ks);

    loc = this._shader.getUniformLocation('lightDirection');
    gl.uniform3fv(loc, this._light.direction);

    loc = this._shader.getUniformLocation('ambientLight');
    gl.uniform4fv(loc, this._light.ambient);

    loc = this._shader.getUniformLocation('diffuseLight');
    gl.uniform4fv(loc, this._light.diffuse);

    loc = this._shader.getUniformLocation('hasTexture');
    gl.uniform1i(loc, this._texture.isLoaded() ? 1 : 0);

    if (this._texture.isLoaded()) {
      this._texture.bind(gl, 0);
      loc = this._shader.getUniformLocation('uSampler');
      gl.uniform1i(loc, 0);
    }
  }

  public edgeUse(): void {
    this._edgeShader.use();
  }
}
