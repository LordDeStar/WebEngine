import { gl } from "./gl";

export class Texture {
  private _texture: WebGLTexture | null;
  private _width: number = 0;
  private _height: number = 0;
  private _isLoaded: boolean = false;
  constructor() {
    this._texture = null;
  }

  public loadTexture(gl: WebGLRenderingContext, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const texture = gl.createTexture();
      if (!texture) {
        reject(new Error("Failed to create WebGL texture"));
        return;
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);

      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1;
      const height = 1;
      const border = 0;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([0, 0, 255, 255]); // Непрозрачный синий пиксель
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

      const image = new Image();
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
          gl.generateMipmap(gl.TEXTURE_2D);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        this._texture = texture;
        this._width = image.width;
        this._height = image.height;

        resolve(); // Указываем, что текстура загружена
      };

      image.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      image.crossOrigin = 'anonymous';
      image.src = url;
    });
  }
  public bind(gl: WebGLRenderingContext, unit: number): void {
    if (this._texture) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
    } else {
      console.error(`Texture not loaded`);
    }
  }
  public isLoaded(): boolean {
    return this._texture !== null;
  }
  private isPowerOf2(value: number): boolean {
    return (value & (value - 1)) == 0;
  }

  public async toJson(): Promise<string> {
    if (!this.isLoaded()) {
      throw new Error("Texture is not loaded or dimensions are unknown");
    }

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);

    const pixels = new Uint8Array(this._width * this._height * 4);
    gl.readPixels(0, 0, this._width, this._height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(framebuffer);

    // Преобразуем пиксели в Base64
    const canvas = document.createElement("canvas");
    canvas.width = this._width;
    canvas.height = this._height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to create 2D context");
    }

    const imageData = ctx.createImageData(this._width, this._height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    const base64 = canvas.toDataURL("image/png");

    return JSON.stringify({
      base64: base64,
      width: this._width,
      height: this._height
    });
  }

  /**
   * Загрузка текстуры из Base64
   */
  public static fromJson(json: string): Promise<Texture> {
    const data = JSON.parse(json);
    const texture = new Texture();

    const image = new Image();
    image.src = data.base64;

    return new Promise<Texture>((resolve, reject) => {
      image.onload = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        texture._texture = tex;
        texture._width = data.width;
        texture._height = data.height;

        resolve(texture);
      };
      image.onerror = () => {
        reject(new Error("Failed to load texture from Base64"));
      };
    });
  }

}
