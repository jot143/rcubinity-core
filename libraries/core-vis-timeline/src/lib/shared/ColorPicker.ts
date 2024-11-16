import Hammer from 'hammerjs';
import util from '../util';

interface RGBA {
    r: number;
    g: number;
    b: number;
    a?: number;
}

interface HSV {
    h: number;
    s: number;
    v: number;
}

interface Coordinates {
    x: number;
    y: number;
}

interface HTMLColors {
    [key: string]: string;
}

const htmlColors: HTMLColors = {
    black: '#000000', navy: '#000080', darkblue: '#00008B', mediumblue: '#0000CD', blue: '#0000FF', darkgreen: '#006400',
    green: '#008000', teal: '#008080', darkcyan: '#008B8B', deepskyblue: '#00BFFF', darkturquoise: '#00CED1',
    mediumspringgreen: '#00FA9A', lime: '#00FF00', springgreen: '#00FF7F', aqua: '#00FFFF', cyan: '#00FFFF',
    midnightblue: '#191970', dodgerblue: '#1E90FF', lightseagreen: '#20B2AA', forestgreen: '#228B22',
    seagreen: '#2E8B57', darkslategray: '#2F4F4F', limegreen: '#32CD32', mediumseagreen: '#3CB371',
    turquoise: '#40E0D0', royalblue: '#4169E1', steelblue: '#4682B4', darkslateblue: '#483D8B',
    mediumturquoise: '#48D1CC', indigo: '#4B0082', darkolivegreen: '#556B2F', cadetblue: '#5F9EA0',
    cornflowerblue: '#6495ED', mediumaquamarine: '#66CDAA', dimgray: '#696969', slateblue: '#6A5ACD',
    olivedrab: '#6B8E23', slategray: '#708090', lightslategray: '#778899', mediumslateblue: '#7B68EE',
    lawngreen: '#7CFC00', chartreuse: '#7FFF00', aquamarine: '#7FFFD4', maroon: '#800000', purple: '#800080',
    olive: '#808000', gray: '#808080', skyblue: '#87CEEB', lightskyblue: '#87CEFA', blueviolet: '#8A2BE2',
    darkred: '#8B0000', darkmagenta: '#8B008B', saddlebrown: '#8B4513', darkseagreen: '#8FBC8F',
    lightgreen: '#90EE90', mediumpurple: '#9370D8', darkviolet: '#9400D3', palegreen: '#98FB98',
    darkorchid: '#9932CC', yellowgreen: '#9ACD32', sienna: '#A0522D', brown: '#A52A2A', darkgray: '#A9A9A9',
    lightblue: '#ADD8E6', greenyellow: '#ADFF2F', paleturquoise: '#AFEEEE', lightsteelblue: '#B0C4DE',
    powderblue: '#B0E0E6', firebrick: '#B22222', darkgoldenrod: '#B8860B', mediumorchid: '#BA55D3',
    rosybrown: '#BC8F8F', darkkhaki: '#BDB76B', silver: '#C0C0C0', mediumvioletred: '#C71585',
    indianred: '#CD5C5C', peru: '#CD853F', chocolate: '#D2691E', tan: '#D2B48C', lightgrey: '#D3D3D3',
    palevioletred: '#D87093', thistle: '#D8BFD8', orchid: '#DA70D6', goldenrod: '#DAA520', crimson: '#DC143C',
    gainsboro: '#DCDCDC', plum: '#DDA0DD', burlywood: '#DEB887', lightcyan: '#E0FFFF', lavender: '#E6E6FA',
    darksalmon: '#E9967A', violet: '#EE82EE', palegoldenrod: '#EEE8AA', lightcoral: '#F08080',
    khaki: '#F0E68C', aliceblue: '#F0F8FF', honeydew: '#F0FFF0', azure: '#F0FFFF', sandybrown: '#F4A460',
    wheat: '#F5DEB3', beige: '#F5F5DC', whitesmoke: '#F5F5F5', mintcream: '#F5FFFA', ghostwhite: '#F8F8FF',
    salmon: '#FA8072', antiquewhite: '#FAEBD7', linen: '#FAF0E6', lightgoldenrodyellow: '#FAFAD2',
    oldlace: '#FDF5E6', red: '#FF0000', fuchsia: '#FF00FF', magenta: '#FF00FF', deeppink: '#FF1493',
    orangered: '#FF4500', tomato: '#FF6347', hotpink: '#FF69B4', coral: '#FF7F50', darkorange: '#FF8C00',
    lightsalmon: '#FFA07A', orange: '#FFA500', lightpink: '#FFB6C1', pink: '#FFC0CB', gold: '#FFD700',
    peachpuff: '#FFDAB9', navajowhite: '#FFDEAD', moccasin: '#FFE4B5', bisque: '#FFE4C4', mistyrose: '#FFE4E1',
    blanchedalmond: '#FFEBCD', papayawhip: '#FFEFD5', lavenderblush: '#FFF0F5', seashell: '#FFF5EE',
    cornsilk: '#FFF8DC', lemonchiffon: '#FFFACD', floralwhite: '#FFFAF0', snow: '#FFFAFA', yellow: '#FFFF00',
    lightyellow: '#FFFFE0', ivory: '#FFFFF0', white: '#FFFFFF'
};


interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Coordinates {
  x: number;
  y: number;
}

export class ColorPicker {
  pixelRatio: number;
  generated: boolean;
  centerCoordinates: Coordinates;
  r: number;
  color: Color;
  hueCircle?: ImageData;
  initialColor: Color;
  previousColor?: Color;
  applied: boolean;

  updateCallback: (initialColor?: any) => void;
  closeCallback: (() => void) | undefined;

  container?: Element;
  frame!: HTMLDivElement;
  colorPickerDiv!: HTMLDivElement;
  colorPickerSelector!: HTMLDivElement;
  colorPickerCanvas!: HTMLCanvasElement;
  opacityDiv!: HTMLDivElement;
  brightnessDiv!: HTMLDivElement;
  arrowDiv!: HTMLDivElement;
  opacityRange!: HTMLInputElement;
  brightnessRange!: HTMLInputElement;
  brightnessLabel!: HTMLDivElement;
  opacityLabel!: HTMLDivElement;
  newColorDiv!: HTMLDivElement;
  initialColorDiv!: HTMLDivElement;
  cancelButton!: HTMLDivElement;
  applyButton!: HTMLDivElement;
  saveButton!: HTMLDivElement;
  loadButton!: HTMLDivElement;
  hammer?: HammerManager;

  constructor(pixelRatio: number = 1) {
    this.pixelRatio = pixelRatio;
    this.generated = false;
    this.centerCoordinates = { x: 289 / 2, y: 289 / 2 };
    this.r = 289 * 0.49;
    this.color = { r: 255, g: 255, b: 255, a: 1.0 };
    this.hueCircle = undefined;
    this.initialColor = { r: 255, g: 255, b: 255, a: 1.0 };
    this.previousColor = undefined;
    this.applied = false;

    this.updateCallback = () => {};
    this.closeCallback = () => {};

    this._create();
  }

  insertTo(container: Element) {
    if (this.hammer) {
      this.hammer.destroy();
      this.hammer = undefined;
    }
    this.container = container;
    this.container.appendChild(this.frame);
    this._bindHammer();
    this._setSize();
  }

  setUpdateCallback(callback: () => void) {
    if (typeof callback === 'function') {
      this.updateCallback = callback;
    } else {
      throw new Error("Function attempted to set as colorPicker update callback is not a function.");
    }
  }

  setCloseCallback(callback: () => void) {
    if (typeof callback === 'function') {
      this.closeCallback = callback;
    } else {
      throw new Error("Function attempted to set as colorPicker closing callback is not a function.");
    }
  }

  private _isColorString(color: string): string | undefined {
    return htmlColors[color];
  }

  setColor(color: string | Partial<Color>, setInitial: boolean = true) {
    if (color === 'none') return;

    let rgba: Color | undefined;

    const htmlColor = this._isColorString(color as string);
    if (htmlColor) color = htmlColor;

    if (typeof color === 'string') {
      if (util.isValidRGB(color)) {
        const rgbaArray = color.substring(4, color.length - 1).split(',');
        rgba = { r: +rgbaArray[0], g: +rgbaArray[1], b: +rgbaArray[2], a: 1.0 };
      } else if (util.isValidRGBA(color)) {
        const rgbaArray = color.substring(5, color.length - 1).split(',');
        rgba = { r: +rgbaArray[0], g: +rgbaArray[1], b: +rgbaArray[2], a: +rgbaArray[3] };
      } else if (util.isValidHex(color)) {
        const rgbObj = util.hexToRGB(color);
        if(rgbObj) {
          rgba = { r: rgbObj.r, g: rgbObj.g, b: rgbObj.b, a: 1.0 };
        }
      }
    } else if (color instanceof Object && color.r !== undefined && color.g !== undefined && color.b !== undefined) {
      const alpha = color.a !== undefined ? color.a : 1.0;
      rgba = { r: color.r, g: color.g, b: color.b, a: alpha };
    }

    if (!rgba) {
      throw new Error(`Unknown color passed to the colorPicker. Supported formats are: strings (rgb, rgba, hex) or objects (rgb, rgba). Supplied: ${JSON.stringify(color)}`);
    } else {
      this._setColor(rgba, setInitial);
    }
  }

  show() {
    if (this.closeCallback) {
      this.closeCallback();
      this.closeCallback = undefined;
    }

    this.applied = false;
    this.frame.style.display = 'block';
    this._generateHueCircle();
  }

  private _hide(storePrevious: boolean = true) {
    if (storePrevious) {
      this.previousColor = { ...this.color };
    }

    if (this.applied) {
      this.updateCallback(this.initialColor);
    }

    this.frame.style.display = 'none';

    setTimeout(() => {
      if (this.closeCallback) {
        this.closeCallback();
        this.closeCallback = undefined;
      }
    }, 0);
  }

  private _save() {
    this.updateCallback(this.color);
    this.applied = false;
    this._hide();
  }

  private _apply() {
    this.applied = true;
    this.updateCallback(this.color);
    this._updatePicker(this.color);
  }

  private _loadLast() {
    if (this.previousColor) {
      this.setColor(this.previousColor, false);
    } else {
      alert("There is no last color to load...");
    }
  }

  private _setColor(rgba: Color, setInitial: boolean = true) {
    if (setInitial) {
      this.initialColor = { ...rgba };
    }

    this.color = rgba;
    const hsv = util.RGBToHSV(rgba.r, rgba.g, rgba.b);

    const angleConvert = 2 * Math.PI;
    const radius = this.r * hsv.s;
    const x = this.centerCoordinates.x + radius * Math.sin(angleConvert * hsv.h);
    const y = this.centerCoordinates.y + radius * Math.cos(angleConvert * hsv.h);

    this.colorPickerSelector.style.left = `${x - 0.5 * this.colorPickerSelector.clientWidth}px`;
    this.colorPickerSelector.style.top = `${y - 0.5 * this.colorPickerSelector.clientHeight}px`;

    this._updatePicker(rgba);
  }

  private _setOpacity(value: number) {
    this.color.a = value / 100;
    this._updatePicker(this.color);
  }

  private _setBrightness(value: number) {
    const hsv = util.RGBToHSV(this.color.r, this.color.g, this.color.b);
    hsv.v = value / 100;
    const rgba = util.HSVToRGB(hsv.h, hsv.s, hsv.v);
    (rgba as any).a = this.color.a;
    this.color = rgba as any;
    this._updatePicker();
  }

  private _updatePicker(rgba: Color = this.color) {
    const hsv = util.RGBToHSV(rgba.r, rgba.g, rgba.b);
    const ctx = this.colorPickerCanvas.getContext('2d');
    if (!ctx) return;

    if (!this.pixelRatio) {
      this.pixelRatio = (window.devicePixelRatio || 1) / ((ctx as any).webkitBackingStorePixelRatio ||
        (ctx as any).mozBackingStorePixelRatio ||
        (ctx as any).msBackingStorePixelRatio ||
        (ctx as any).oBackingStorePixelRatio ||
        (ctx as any).backingStorePixelRatio || 1);
    }
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

    const w = this.colorPickerCanvas.clientWidth;
    const h = this.colorPickerCanvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    if (this.hueCircle) {
      ctx.putImageData(this.hueCircle, 0, 0);
    }
    ctx.fillStyle = `rgba(0,0,0,${1 - hsv.v})`;
    ctx.beginPath();
    ctx.arc(this.centerCoordinates.x, this.centerCoordinates.y, this.r, 0, 2 * Math.PI);
    ctx.fill();

    this.brightnessRange.value = (100 * hsv.v).toString();
    this.opacityRange.value = (100 * rgba.a).toString();

    this.initialColorDiv.style.backgroundColor = `rgba(${this.initialColor.r},${this.initialColor.g},${this.initialColor.b},${this.initialColor.a})`;
    this.newColorDiv.style.backgroundColor = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a})`;
  }

  private _setSize() {
    this.colorPickerCanvas.style.width = '100%';
    this.colorPickerCanvas.style.height = '100%';

    this.colorPickerCanvas.width = 289 * this.pixelRatio;
    this.colorPickerCanvas.height = 289 * this.pixelRatio;
  }

  private _create() {
    this.frame = document.createElement('div');
    this.frame.className = 'vis-color-picker';

    this.colorPickerDiv = document.createElement('div');
    this.colorPickerSelector = document.createElement('div');
    this.colorPickerSelector.className = 'vis-selector';
    this.colorPickerDiv.appendChild(this.colorPickerSelector);
    this.colorPickerCanvas = document.createElement('canvas');
    this.colorPickerDiv.appendChild(this.colorPickerCanvas);

    this.opacityDiv = document.createElement('div');
    this.opacityDiv.className = 'vis-slider';
    this.opacityRange = document.createElement('input');
    this.opacityRange.type = 'range';
    this.opacityRange.min = '0';
    this.opacityRange.max = '100';
    this.opacityRange.step = '1';
    this.opacityDiv.appendChild(this.opacityRange);

    this.brightnessDiv = document.createElement('div');
    this.brightnessDiv.className = 'vis-slider';
    this.brightnessRange = document.createElement('input');
    this.brightnessRange.type = 'range';
    this.brightnessRange.min = '0';
    this.brightnessRange.max = '100';
    this.brightnessRange.step = '1';
    this.brightnessDiv.appendChild(this.brightnessRange);

    this.arrowDiv = document.createElement('div');
    this.arrowDiv.className = 'vis-arrow';

    this.brightnessLabel = document.createElement('div');
    this.brightnessLabel.className = 'vis-slider-label';
    this.opacityLabel = document.createElement('div');
    this.opacityLabel.className = 'vis-slider-label';

    this.newColorDiv = document.createElement('div');
    this.initialColorDiv = document.createElement('div');

    this.cancelButton = document.createElement('div');
    this.cancelButton.className = 'vis-button vis-button-cancel';
    this.applyButton = document.createElement('div');
    this.applyButton.className = 'vis-button vis-button-apply';
    this.saveButton = document.createElement('div');
    this.saveButton.className = 'vis-button vis-button-save';
    this.loadButton = document.createElement('div');
    this.loadButton.className = 'vis-button vis-button-load';

    this.frame.appendChild(this.colorPickerDiv);
    this.frame.appendChild(this.opacityDiv);
    this.frame.appendChild(this.brightnessDiv);
    this.frame.appendChild(this.arrowDiv);
    this.frame.appendChild(this.brightnessLabel);
    this.frame.appendChild(this.opacityLabel);
    this.frame.appendChild(this.newColorDiv);
    this.frame.appendChild(this.initialColorDiv);
    this.frame.appendChild(this.cancelButton);
    this.frame.appendChild(this.applyButton);
    this.frame.appendChild(this.saveButton);
    this.frame.appendChild(this.loadButton);

    this.colorPickerDiv.appendChild(this.colorPickerCanvas);
  }

  private _generateHueCircle() {
    if (this.generated) return;

    const ctx = this.colorPickerCanvas.getContext('2d');
    if (!ctx) return;

    const angleConvert = 2 * Math.PI;
    const w = this.colorPickerCanvas.width;
    const h = this.colorPickerCanvas.height;

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const dx = x - this.centerCoordinates.x;
        const dy = y - this.centerCoordinates.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d <= this.r) {
          const angle = Math.atan2(dy, dx) + Math.PI / 2;
          const h = angleConvert * (angle < 0 ? angle + 2 * Math.PI : angle);
          const hsv = { h: h / angleConvert, s: d / this.r, v: 1 };
          const rgba = util.HSVToRGB(hsv.h, hsv.s, hsv.v);
          ctx.fillStyle = `rgb(${rgba.r},${rgba.g},${rgba.b})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    this.hueCircle = ctx.getImageData(0, 0, w, h);
    this.generated = true;
  }

  private _bindHammer() {
    if (!this.hammer) {
      this.hammer = new Hammer(this.colorPickerDiv);
      if(this.hammer) {
        this.hammer.on('panmove', (e) => {
          const pos = this._getLocalPosition(e.center);
          const dx = pos.x - this.centerCoordinates.x;
          const dy = pos.y - this.centerCoordinates.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d <= this.r) {
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            const h = 2 * Math.PI * (angle < 0 ? angle + 2 * Math.PI : angle);
            const hsv = { h: h / 2 / Math.PI, s: d / this.r, v: 1 };
            const rgba = util.HSVToRGB(hsv.h, hsv.s, hsv.v);
            (rgba as any).a = this.color.a;
            this._setColor((rgba as any), false);
          }
        });
      }

    }
  }

  private _getLocalPosition(position: { x: number; y: number }) {
    const rect = this.colorPickerDiv.getBoundingClientRect();
    const x = position.x - rect.left - window.pageXOffset;
    const y = position.y - rect.top - window.pageYOffset;
    return { x: x / this.pixelRatio, y: y / this.pixelRatio };
  }
}
