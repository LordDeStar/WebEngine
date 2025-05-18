import { gl } from "./gl";

export class Shader {
    private _name: string;
    private _program: WebGLProgram;
    private _attributes: { [name: string]: number } = {};
    private _uniforms: { [name: string]: WebGLUniformLocation } = {};
    private _vertexSrc: string;
    private _fragmentSrc: string;
    public constructor(name: string, vertexSrc: string, fragmentSrc: string) {
        this._name = name;
        this._vertexSrc = vertexSrc;
        this._fragmentSrc = fragmentSrc;
        let vertex = this.loadShader(vertexSrc, gl.VERTEX_SHADER);
        let fragment = this.loadShader(fragmentSrc, gl.FRAGMENT_SHADER);
        this._program = this.createProgram(vertex, fragment);
        this.detectAttributes();
        this.detectUniforms();
    }
    public get name(): string {
        return this._name;
    }
    public use(): void {
        gl.useProgram(this._program);
    }
    public getAttributeLocation(name: string): number {
        if (this._attributes[name] === undefined) throw new Error(`Shader [${this._name}] has no attribute [${name}]`);
        return this._attributes[`${name}`];
    }
    public getUniformLocation(name: string): WebGLUniformLocation {
        if (this._uniforms[name] === undefined) throw new Error(`Shader [${this._name}] has no uniform [${name}]`);
        return this._uniforms[`${name}`];
    }
    public toJson(): string {
        return JSON.stringify({
            name: this._name,
            vertexSrc: this._vertexSrc,
            fragmentSrc: this._fragmentSrc,
            attributes: Object.keys(this._attributes),
            uniforms: Object.keys(this._uniforms)
        });
    }
    public static fromJson(json: string): Shader {
        const data = JSON.parse(json);
        const shader = new Shader(data.name, data.vertexSrc, data.fragmentSrc);
        data.attributes.forEach((attr: string) => {
            if (!shader._attributes[attr]) {
                throw new Error(`Attribute [${attr}] not found in restored shader [${data.name}]`);
            }
        });

        data.uniforms.forEach((uniform: string) => {
            if (!shader._uniforms[uniform]) {
                throw new Error(`Uniform [${uniform}] not found in restored shader [${data.name}]`);
            }
        });
        return shader;
    }

    private loadShader(source: string, shaderType: number): WebGLShader {
        let shader: WebGLShader = <WebGLShader>gl.createShader(shaderType);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        let error = gl.getShaderInfoLog(shader);
        if (error !== "") {
            throw new Error(`Error compiling shader [${this._name}]: ` + error);
        }

        return shader;
    }
    private createProgram(vertex: WebGLShader, fragment: WebGLShader): WebGLProgram {
        let program = <WebGLProgram>gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);

        let error = gl.getProgramInfoLog(program);
        if (error !== "") {
            throw new Error(`Error creating program for shader [${this._name}]: ` + error);
        }

        return program;
    }
    private detectAttributes(): void {
        let count = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < count; i++) {
            let attrInfo = <WebGLActiveInfo | null>gl.getActiveAttrib(this._program, i);
            if (!attrInfo) break;
            this._attributes[attrInfo.name] = gl.getAttribLocation(this._program, attrInfo.name);
        }
    }
    private detectUniforms(): void {
        let count = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < count; i++) {
            let info = <WebGLActiveInfo | null>gl.getActiveUniform(this._program, i);
            if (!info) break;
            this._uniforms[info.name] = <WebGLUniformLocation>gl.getUniformLocation(this._program, info.name);
        }
    }

}
