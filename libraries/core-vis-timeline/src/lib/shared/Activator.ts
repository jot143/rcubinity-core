import keycharm, { Keycharm } from 'keycharm';
import Emitter from 'component-emitter';
import Hammer from 'hammerjs';

import './activator.css';
import util from '../util';

type DomElements = {
  container: HTMLElement;
  overlay?: HTMLElement;
};

class Activator {
  active: boolean;
  dom: DomElements;
  hammer: HammerManager;
  keycharm: Keycharm | null;
  onClick: ((event: MouseEvent) => void) | null;
  escListener: () => void;
  static current: Activator | null = null;

  constructor(container: HTMLElement) {
    this.active = false;

    this.dom = {
      container: container
    };

    this.dom.overlay = document.createElement('div');
    this.dom.overlay.className = 'vis-overlay';

    this.dom.container.appendChild(this.dom.overlay);

    this.hammer = new Hammer(this.dom.overlay);
    this.hammer.on('tap', this._onTapOverlay.bind(this));

    const events = [
      'tap', 'doubletap', 'press',
      'pinch',
      'pan', 'panstart', 'panmove', 'panend'
    ];

    events.forEach((event) => {
      this.hammer.on(event, (e) => {
        (e as unknown as Event).stopPropagation();
      });
    });

    if (document && document.body) {
      this.onClick = (event) => {
        if (!_hasParent(event.target as HTMLElement, container)) {
          this.deactivate();
        }
      };
      document.body.addEventListener('click', this.onClick);
    } else {
      this.onClick = null;
    }

    if ((this as any).keycharm !== undefined) {
      (this as any).keycharm.destroy();
    }
    this.keycharm = keycharm();

    this.escListener = this.deactivate.bind(this);
  }

  destroy(): void {
    this.deactivate();

    // remove dom
    if (this.dom.overlay && this.dom.overlay.parentNode) {
      this.dom.overlay.parentNode.removeChild(this.dom.overlay);
    }

    // remove global event listener
    if (this.onClick) {
      document.body.removeEventListener('click', this.onClick);
    }

    // remove keycharm
    if (this.keycharm !== null) {
      this.keycharm.destroy();
    }
    this.keycharm = null;

    // cleanup hammer instances
    this.hammer.destroy();
    this.hammer = null as any;
  }

  activate(): void {
    if (Activator.current) {
      Activator.current.deactivate();
    }
    Activator.current = this;

    this.active = true;
    if (this.dom.overlay) {
      this.dom.overlay.style.display = 'none';
    }
    util.addClassName(this.dom.container, 'vis-active');

    this.emit('change');
    this.emit('activate');

    this.keycharm?.bind('esc', this.escListener);
  }

  deactivate(): void {
    if (Activator.current === this) {
      Activator.current = null;
    }

    this.active = false;
    if (this.dom.overlay) {
      this.dom.overlay.style.display = '';
    }
    util.removeClassName(this.dom.container, 'vis-active');
    this.keycharm?.unbind('esc', this.escListener);

    this.emit('change');
    this.emit('deactivate');
  }

  private _onTapOverlay(event: HammerInput): void {
    this.activate();
    (event as unknown as Event).stopPropagation();
  }

  emit(event: string, ...args: any[]): void {
    // Placeholder for the actual Emitter function implementation
  }
}

// Convert the function to TypeScript
function _hasParent(element: HTMLElement | null, parent: HTMLElement): boolean {
  while (element) {
    if (element === parent) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}

// Convert the Emitter initialization to TypeScript
Emitter(Activator.prototype as any);

export default Activator;
