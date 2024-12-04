import { gl } from "../gl/gl";

export class Geometry {
    private _vertices: Float32Array;
    private _indices: Uint16Array;
    private _edges: Uint16Array;
    private _vertexBuffer: WebGLBuffer | null;
    private _indicesBuffer: WebGLBuffer | null;
    private _edgesBuffer: WebGLBuffer | null;

    constructor(vertices: number[], indices: number[], edges: number[]) {
        this._vertices = new Float32Array(vertices);
        this._indices = new Uint16Array(indices);
        this._edges = new Uint16Array(edges);

        this._vertexBuffer = gl.createBuffer();
        this._indicesBuffer = gl.createBuffer();
        this._edgesBuffer = gl.createBuffer();

        this.bindData();
    }

    private bindData(): void {
        this.bindBuffers();
        gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);

        this.bindEdgeBuffers();
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._edges, gl.STATIC_DRAW);
    }

    public bindBuffers(): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
    }

    public bindEdgeBuffers(): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._edgesBuffer);
    }

    public draw(): void {
        gl.drawElements(gl.TRIANGLES, this._indices.length, gl.UNSIGNED_SHORT, 0);
    }

    public drawEdges(): void {
        gl.drawElements(gl.LINES, this._edges.length, gl.UNSIGNED_SHORT, 0);
    }
}