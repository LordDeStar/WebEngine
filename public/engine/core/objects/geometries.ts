// geometries.js
export class TemplateGeometry {
    public vertices: number[];
    public normals: number[];
    public indices: number[];
    public edges: number[];

    constructor(vertices: number[], normals: number[], indices: number[], edges: number[]) {
        this.vertices = vertices;
        this.normals = normals;
        this.indices = indices;
        this.edges = edges;
    }
}

export class Cube extends TemplateGeometry {
    constructor() {
        super(
            [
                -1, -1, -1,
                1, -1, -1,
                1, 1, -1,
                -1, 1, -1,
                -1, -1, 1,
                1, -1, 1,
                1, 1, 1,
                -1, 1, 1,
            ],
            [
                -1, -1, -1,
                1, -1, -1,
                1, 1, -1,
                -1, 1, -1,
                -1, -1, 1,
                1, -1, 1,
                1, 1, 1,
                -1, 1, 1,
            ],
            [
                0, 1, 2, 0, 2, 3,
                4, 5, 6, 4, 6, 7,
                0, 1, 5, 0, 5, 4,
                2, 3, 7, 2, 7, 6,
                1, 2, 6, 1, 6, 5,
                0, 3, 7, 0, 7, 4
            ],
            [
                0, 1, 1, 2, 2, 3, 3, 0,
                4, 5, 5, 6, 6, 7, 7, 4,
                0, 4, 1, 5, 2, 6, 3, 7
            ]
        );
    }
}

function createSphere(radius: number, widthSegments: number, heightSegments: number) {
    const _vertices: number[] = [];
    const _normals: number[] = [];
    const _indices: number[] = [];
    const _edgeIndices: number[] = [];

    for (let i = 0; i <= heightSegments; i++) {
        const v = i / heightSegments;
        const theta = v * Math.PI;

        for (let j = 0; j <= widthSegments; j++) {
            const u = j / widthSegments;
            const phi = u * 2 * Math.PI;

            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);

            _vertices.push(x, y, z);

            _normals.push(x, y, z);
        }
    }

    for (let i = 0; i < heightSegments; i++) {
        for (let j = 0; j < widthSegments; j++) {
            const first = (i * (widthSegments + 1)) + j;
            const second = first + widthSegments + 1;
            _indices.push(first, second, first + 1);
            _indices.push(second, second + 1, first + 1);

            _edgeIndices.push(first, second);
            _edgeIndices.push(first, first + 1);
        }
    }

    return { _vertices, _normals, _indices, _edgeIndices };
}


export class Sphere extends TemplateGeometry {
    constructor() {
        const { _vertices, _normals, _indices, _edgeIndices } = createSphere(1, 32, 32);
        super(_vertices, _normals, _indices, _edgeIndices);
    }
}