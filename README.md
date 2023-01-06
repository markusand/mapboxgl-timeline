# Mapbox GL Timeline Slider

[![NPM](https://img.shields.io/npm/v/mapboxgl-timeline)](https://npmjs.org/package/mapboxgl-timeline)
[![NPM](https://img.shields.io/bundlephobia/minzip/mapboxgl-timeline)](https://npmjs.org/package/mapboxgl-timeline)
[![NPM](https://img.shields.io/npm/l/mapboxgl-timeline)](https://npmjs.org/package/mapboxgl-timeline)

Add a timeline slider to a mapbox map.

![mapbox timeline slider control](https://user-images.githubusercontent.com/12972543/211089136-9ccf9578-0d96-4fab-985e-eca82c5d9022.gif)

## Get started

Install npm package

```bash
npm install mapboxgl-timeline
```

Add timeline control to map

```javascript
import TimelineControl from 'mapboxgl-timeline';
import 'mapboxgl-timeline/dist/style.css';

const timeline = new TimelineControl({
  start: '2022-01-01',
  end: '2022-12-31',
  step: 1000 * 3600 * 24,
  onChange: date => {
    /*  Magic happening here 🎉 */
  },
});

map.addControl(timeline, 'top-left');
```

Example setup file in [index.html](./index.html)

## Options

Timeline can be configured on instantiation or using the `set()`.

| option | type | default | description |
| --- | --- | --- | --- |
| **start**, **end** | Date, number, string | `undefined` | Bounding dates. Can be any valid parseable Date. |
| **initial** | Date, number, string | `start` | Initial date |
| **step** | number | `1` | Time distance between timeline stops in milliseconds |
| **placeholder** | string | `undefined` | Label placeholder |
| **speed** | number | `1` | Speed rate of slider play. Base running time is 1s |
| **lazy** | boolean | `false` | Call to onChange is done once the slider is released. Use for computationaly expensive callback operations. |
| **stacked** | boolean | `false` | Show label and control stacked for narrower control. |
| **autoplay** | boolean | `false` | Play timeline on start |
| **autohide** | boolean | `false` | Hide timeline when values are undefined |
| **format** | function | `undefined` | Label formatting function. Receives de current Date object and must return a string. |
| **onStart**, **onEnd**, **onChange**, **onPause**, **onResume** | function | `undefined` | Callbacks for timeline events. Receive the current Date object and the index of the stop |

## Styles

Timeline defaults to a simple design inspired by standard mapbox-gl controls, but can be tunned by changing CSS variables or overriding styles. Check default values in `/src/timeline.scss`.

```css
.mapboxgl-ctrl-timeline {
  --color-bg: #333;
  --color-text: #eee;
  --color-track: #fff2;
  --border: 1px solid #fff2;
}
```

## Development

Create a `.env` file and set your Mapbox token as `VITE_MAPBOX_TOKEN`.

Run the development server with the command

```bash
npm run dev
```
