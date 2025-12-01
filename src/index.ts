import './timeline.scss';

type Moment = Date | string | number;
type RangeEvent = Event & { target: HTMLInputElement };
type RangeCallback = (value: Date, position: number) => void;

type TimelineConfig = {
  placeholder?: string;
  speed?: number;
  lazy?: boolean;
  stops?: number;
  stacked?: boolean;
  autoplay?: boolean;
  autohide?: boolean;
  format?: (value: Date) => string,
  onStart?: RangeCallback,
  onEnd?: RangeCallback,
  onChange?: RangeCallback,
  onPause?: RangeCallback,
  onResume?: RangeCallback,
};

export type TimelineOptions = {
  start?: Moment;
  end?: Moment;
  initial?: Moment;
  step?: number;
} & Omit<TimelineConfig, 'stops'>;

const parseOptions = (options: TimelineOptions) => {
  const { start, end, initial = start, step = 1, ...rest } = options;
  const min = start && new Date(start).getTime();
  const max = end && new Date(end).getTime();
  const value = initial && new Date(initial).getTime();
  const disabled = !min || !max;
  const slider = { min, max, value, step, disabled };
  const stops = max && min ? Math.round((max - min) / step) : 0;
  const global = { ...rest, stops };
  return { slider, global };
};

export default class Timeline {
  private config: TimelineConfig = {};
  private container: HTMLDivElement;
  private toggler: HTMLButtonElement;
  private slider: HTMLInputElement;
  private interval: ReturnType<typeof setInterval> | undefined;
  private position: number = 0;

  constructor(options: TimelineOptions = {}) {
    const label = Object.assign(document.createElement('div'), {
      className: 'mapboxgl-ctrl-timeline__label',
      innerHTML: options.placeholder,
    });

    const setLabel = (value: Moment | undefined) => {
      const { format, placeholder } = this.config;
      label.innerHTML = value
        ? format?.(new Date(value)) ?? new Date(value).toLocaleString()
        : placeholder || '';
    };

    this.slider = Object.assign(document.createElement('input'), {
      className: 'mapboxgl-ctrl-timeline__slider',
      type: 'range',
      oninput: ({ target: { value } }: RangeEvent) => {
        const { lazy, onChange } = this.config;
        setLabel(+value);
        if (!lazy) onChange?.(new Date(+value), this.position);
      },
      onchange: ({ target: { value, disabled } }: RangeEvent) => {
        const { lazy, onChange } = this.config;
        setLabel(+value);
        this.updatePosition();
        if (lazy && !disabled) onChange?.(new Date(+value), this.position);
      },
    });

    this.toggler = Object.assign(document.createElement('button'), {
      className: 'mapboxgl-ctrl-timeline__toggler',
      onclick: () => {
        if (this.interval) this.pause();
        else this.resume();
      },
    });

    this.container = Object.assign(document.createElement('div'), {
      className: 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-timeline',
    });

    const control = Object.assign(document.createElement('div'), {
      className: 'mapboxgl-ctrl-timeline__control',
    });
    control.append(this.toggler, this.slider);

    this.container.append(control, label);

    this.set(options);
    setLabel(+this.slider.value);
  }

  reset() {
    t = parseFloat(this.slider.min);
    this.slider.value = `${new Date(t).getTime()}`;
    this.slider.dispatchEvent(new Event('change'));
  }

  set(options: TimelineOptions) {
    const { global, slider } = parseOptions(options);
    Object.assign(this.config, global);
    Object.assign(this.slider, slider);
    this.container.classList.toggle('stacked', global.stacked ?? false);
    this.toggler.disabled = slider.disabled;
    if (global.autoplay) this.resume();
    if (global.autohide) this.display(!!slider.value);
    this.slider.dispatchEvent(new Event('input'));
  }

  private updatePosition() {
    const { stops, onStart, onEnd } = this.config;
    const { min, step, value } = this.slider;
    this.position = Math.round((+value - +min) / +step);
  
    const isStart = this.position === 0;
    const isEnd = this.position === stops;
    
    if (isStart) onStart?.(new Date(+value), this.position);
  
    if (isEnd) {
      this.pause();
      onEnd?.(new Date(+value), this.position);
    }

    this.toggler.classList.toggle('restart', isEnd);
  }

  pause() {
    if (this.interval) {
      this.toggler.classList.remove('running');
      clearInterval(this.interval);
      this.interval = undefined;
    }
    this.config.onPause?.(new Date(+this.slider.value), this.position);
  }

  resume() {
    const { speed, stops, onResume } = this.config;

    this.toggler.classList.add('running');
    if (this.position === stops) this.reset();
    
    this.interval = setInterval(() => {
      this.slider.stepUp();
      this.slider.dispatchEvent(new Event('input'));
      this.slider.dispatchEvent(new Event('change'));
    }, 1000 / (speed || 1));
    
    onResume?.(new Date(+this.slider.value), this.position);
  }

  display(display: boolean = this.container.classList.contains('hidden')) {
    this.container.classList.toggle('hidden', !display);
    if (display) this.slider.focus();
    else this.slider.blur();
  }

  onAdd() {
    return this.container;
  }

  onRemove() {
    this.container.parentNode?.removeChild(this.container);
    if (this.interval) clearInterval(this.interval);
  }
}
