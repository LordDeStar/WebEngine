// geometry.js
import { gl } from "../gl/gl";
import { TemplateGeometry } from "./geometries";

export class Geometry {
  private _vertexBuffer: WebGLBuffer | null;
  private _texCoordBuffer: WebGLBuffer | null;
  private _indexBuffer: WebGLBuffer | null;
  private _edgeIndexBuffer: WebGLBuffer | null;

  private _vertices: Float32Array | null;
  private _texCoords: Float32Array | null;
  private _indices: Uint16Array | null;
  private _edges: Uint16Array | null;

  private _vertexCount: number;
  private _edgeCount: number;

  constructor() {
    this._vertexBuffer = null;
    this._texCoordBuffer = null;
    this._indexBuffer = null;
    this._edgeIndexBuffer = null;
    this._vertexCount = 0;
    this._edgeCount = 0;
    this._vertices = null;
    this._texCoords = null;
    this._indices = null;
    this._edges = null;
  }

  public static loadFromClass(template: TemplateGeometry): Geometry {
    const geometry = new Geometry();

    // Вершины
    geometry._vertices = new Float32Array(template.vertices);
    geometry._vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry._vertices, gl.STATIC_DRAW);

    // Текстурные координаты
    geometry._texCoords = new Float32Array(template.texCoords);
    geometry._texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry._texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry._texCoords, gl.STATIC_DRAW);

    // Индексы
    geometry._indices = new Uint16Array(template.indices);
    geometry._indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry._indices, gl.STATIC_DRAW);
    geometry._vertexCount = template.indices.length;

    // Ребра
    geometry._edges = new Uint16Array(template.edges);
    geometry._edgeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry._edgeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry._edges, gl.STATIC_DRAW);
    geometry._edgeCount = template.edges.length;

    return geometry;
  }

  public bindBuffers(): void {
    // Привязываем буфер вершин
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    // Привязываем буфер текстурных координат
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);

    // Привязываем буфер индексов
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
  }
  public bindEdgeBuffers(): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._edgeIndexBuffer);
  }
  public draw(): void {
    gl.drawElements(gl.TRIANGLES, this._vertexCount, gl.UNSIGNED_SHORT, 0);
  }
  public drawEdges(): void {
    gl.drawElements(gl.LINES, this._edgeCount, gl.UNSIGNED_SHORT, 0);
  }

  public toJson(): Promise<string> {
    return new Promise<string>(resolve => {
      resolve(JSON.stringify({
        vertices: Array.from(this._vertices || []),
        texCoords: Array.from(this._texCoords || []),
        indices: Array.from(this._indices || []),
        edges: Array.from(this._edges || []),
        vertexCount: this._vertexCount,
        edgeCount: this._edgeCount
      }));
    });
  }
}
