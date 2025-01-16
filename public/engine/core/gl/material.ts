import { gl } from "./gl";
import { vec4 } from "gl-matrix";
import { Shader } from "./shader";
import { Light } from "./light";
import { Texture } from "./texture"; // Импортируем новый класс Texture

export class Material {
  private _shader: Shader;
  private _edgeShader: Shader;
  private _color: vec4;
  private _light: Light;
  private _texture: Texture;

  constructor(light: Light) {
    this._color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this._light = light;
    this._texture = new Texture();
    this._shader = this.loadShader();
    this._edgeShader = this.loadEdgeShader();
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
        uniform vec4 color;
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
            vec4 finalColor = ambientLight + diffuseLight * diff;
            vec4 texColor = texture2D(uSampler, vTexCoord);
            if (hasTexture) {
                gl_FragColor = finalColor * texColor;
            } else {
                gl_FragColor = finalColor * color;
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

  public basicUse(): void {
    this._shader.use();
    let loc = this._shader.getUniformLocation('color');
    gl.uniform4fv(loc, this._color);

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
