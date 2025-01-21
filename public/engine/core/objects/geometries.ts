export class TemplateGeometry {
    public vertices: number[];
    public normals: number[];
    public texCoords: number[];
    public indices: number[];
    public edges: number[];

    constructor(vertices: number[], normals: number[], texCoords: number[], indices: number[], edges: number[]) {
        this.vertices = vertices;
        this.normals = normals;
        this.texCoords = texCoords;
        this.indices = indices;
        this.edges = edges;
    }

    public static async loadFromOBJ(url: string): Promise<TemplateGeometry> {
        try {
            const response = await fetch(url);
            const data = await response.text();

            const vertices: number[] = [];
            const normals: number[] = [];
            const texCoords: number[] = [];
            const indices: number[] = [];
            const edges: number[] = [];

            const lines = data.split('\n');
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/); // Используем регулярное выражение для разделения по любым пробельным символам
                if (parts[0] === 'v') {
                    vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                } else if (parts[0] === 'vn') {
                    normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                } else if (parts[0] === 'vt') {
                    texCoords.push(parseFloat(parts[1]), 1 - parseFloat(parts[2])); // Инвертируем V-координату
                } else if (parts[0] === 'f') {
                    const v1 = parts[1].split('/').map(Number);
                    const v2 = parts[2].split('/').map(Number);
                    const v3 = parts[3].split('/').map(Number);
                    const v4 = parts[4] ? parts[4].split('/').map(Number) : null;

                    indices.push(
                        v1[0] - 1, v2[0] - 1, v3[0] - 1
                    );

                    if (v4) {
                        indices.push(
                            v4[0] - 1
                        );
                    }

                    // Добавим ребра
                    edges.push(
                        v1[0] - 1, v2[0] - 1,
                        v2[0] - 1, v3[0] - 1,
                        v3[0] - 1, v1[0] - 1
                    );

                    if (v4) {
                        edges.push(
                            v3[0] - 1, v4[0] - 1,
                            v4[0] - 1, v1[0] - 1
                        );
                    }
                }
            });

            return new TemplateGeometry(vertices, normals, texCoords, indices, edges);
        } catch (error) {
            console.error('Ошибка загрузки модели:', error);
            throw error;
        }
    }



}



export class Cube extends TemplateGeometry {
    constructor() {
        const vertices = [
            // Передняя грань
            -1, -1, -1,
            1, -1, -1,
            1, 1, -1,
            -1, 1, -1,
            // Задняя грань
            -1, -1, 1,
            1, -1, 1,
            1, 1, 1,
            -1, 1, 1,
        ];

        const normals = [
            // Нормали для каждой грани
            0, 0, -1, // передняя грань
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, 1,  // задняя грань
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            // Нормали для остальных граней
            0, -1, 0, // нижняя грань
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            1, 0, 0,  // правая грань
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            -1, 0, 0, // левая грань
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            0, 1, 0,  // верхняя грань
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
        ];

        const texCoords = [
            // Передняя грань
            2, 1, // левый верхний
            -1, -1, // левый нижний
            1, -1, // правый нижний
            1, 1, // правый верхний

            // Задняя грань
            1, 1, // правый верхний
            1, -1, // правый нижний
            -1, -1, // левый нижний
            -1, 1, // левый верхний

            // Верхняя грань
            -1, 1, // левый верхний
            -1, -1, // левый нижний
            1, -1, // правый нижний
            1, 1, // правый верхний

            // Нижняя грань
            -1, -1, // левый нижний
            -1, 1, // левый верхний
            1, 1, // правый верхний
            1, -1, // правый нижний

            // Левая грань
            -1, 1, // левый верхний
            -1, -1, // левый нижний
            1, -1, // правый нижний
            1, 1, // правый верхний

            // Правая грань
            1, 1, // правый верхний
            1, -1, // правый нижний
            -1, -1, // левый нижний
            -1, 1, // левый верхний
        ];
        const indices = [
            // Индексы
            0, 1, 2, 0, 2, 3, // передняя грань
            4, 5, 6, 4, 6, 7, // задняя грань
            0, 1, 5, 0, 5, 4, // нижняя грань
            2, 3, 7, 2, 7, 6, // верхняя грань
            1, 2, 6, 1, 6, 5, // правая грань
            0, 3, 7, 0, 7, 4  // левая грань
        ];

        const edges = [
            // Ребра
            0, 1, 1, 2, 2, 3, 3, 0, // передняя грань
            4, 5, 5, 6, 6, 7, 7, 4, // задняя грань
            0, 4, 1, 5, 2, 6, 3, 7 // соединяющие ребра
        ];

        super(vertices, normals, indices, edges, texCoords);
    }
}



function createSphere(radius: number, widthSegments: number, heightSegments: number) {
    const _vertices: number[] = [];
    const _normals: number[] = [];
    const _texCoords: number[] = [];
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
            _texCoords.push(u, 1 - v); // Текстурные координаты
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

    return { _vertices, _normals, _indices, _edgeIndices, _texCoords };
}


export class Sphere extends TemplateGeometry {
    constructor() {
        const { _vertices, _normals, _indices, _edgeIndices, _texCoords } = createSphere(1, 32, 32);
        super(_vertices, _normals, _indices, _edgeIndices, _texCoords);
    }
}
