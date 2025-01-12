export class Texture {
    private _texture: WebGLTexture | null;
  
    constructor() {
      this._texture = null;
    }
  
    public loadTexture(gl: WebGLRenderingContext, url: string): void {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
  
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1;
      const height = 1;
      const border = 0;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([0, 0, 255, 255]);  // непрозрачный синий пиксель
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
  
      const image = new Image();
      image.onload = () => {
        console.log(`Image loaded: ${url}`);
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
        console.log(`Texture loaded and bound: ${url}`);
      };
      image.onerror = () => {
        console.error(`Failed to load image: ${url}`);
      };
      image.src = url;
    }
  
    public bind(gl: WebGLRenderingContext, unit: number): void {
      if (this._texture) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        console.log(`Texture bound to unit: ${unit}`);
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
  }
  