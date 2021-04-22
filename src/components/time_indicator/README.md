# Time Indicator Component plugin

## Configuration
The options for the component go in the `mediaControl.timeIndicatorComponent` property as shown below:
```javascript
var player = new Clappr.Player({
  source: 'https://your.video/here.mp4',
  plugins: [
    MediaControl.MainPlugin,
    MediaControl.TimeIndicatorPlugin,
  ],
  mediaControl: {
    timeIndicatorComponent: { 
      layer: 1, 
      section: 2, 
      position: 2, 
      separator: false,
    }
  }
});
```

### `mediaControl.timeIndicatorComponent.layer {Integer}`
Defines the layer to which the section that the plugin has to be rendered.

### `mediaControl.timeIndicatorComponent.section {Integer}`
Defines the section that the plugin has to be rendered.

### `mediaControl.timeIndicatorComponent.position {Integer}`
Defines the position that the plugin has to be rendered within the wanted section. In horizontal sections, the order of position will be from left to right and in vertical sections, the order will be from top to bottom.

### `mediaControl.timeIndicatorComponent.separator {Integer}`
If it's configured with the value `true`, it will cause the plugin to be rendered at the opposite point from the starting position and causing all rendered plugins after it to follow the same rendering order.