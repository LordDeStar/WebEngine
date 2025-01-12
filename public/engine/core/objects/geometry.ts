// geometry.js
import { gl } from "../gl/gl";
import { TemplateGeometry } from "./geometries";

export class Geometry {
    private _vertexBuffer: WebGLBuffer | null;
    private _texCoordBuffer: WebGLBuffer | null;
    private _indexBuffer: WebGLBuffer | null;
    private _edgeIndexBuffer: WebGLBuffer | null;
    private _vertexCount: number;
    private _edgeCount: number;
  
    constructor() {
      this._vertexBuffer = null;
      this._texCoordBuffer = null;
      this._indexBuffer = null;
      this._edgeIndexBuffer = null;
      this._vertexCount = 0;
      this._edgeCount = 0;
    }
  
    public static loadFromClass(template: TemplateGeometry): Geometry {
      const geometry = new Geometry();
  
      // Создаем буферы для вершин
      geometry._vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry._vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(template.vertices), gl.STATIC_DRAW);
  
      // Создаем буферы для текстурных координат
      geometry._texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry._texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(template.texCoords), gl.STATIC_DRAW);
  
      // Создаем буферы для индексов
      geometry._indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry._indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(template.indices), gl.STATIC_DRAW);
      geometry._vertexCount = template.indices.length;
  
      // Создаем буферы для ребер
      geometry._edgeIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry._edgeIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(template.edges), gl.STATIC_DRAW);
      geometry._edgeCount = template.edges.length;
  
      return geometry;
    }
  
    public bindBuffers(): void {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
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
  }
  