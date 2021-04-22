# Play/Pause Component plugin

## Configuration
The options for the component go in the `mediaControl.playPauseComponent` property as shown below:
```javascript
var player = new Clappr.Player({
  source: 'https://your.video/here.mp4',
  plugins: [
    MediaControl.MainPlugin,
    MediaControl.PlayPauseButtonPlugin,
  ],
  mediaControl: {
    playPauseComponent: { 
      layer: 1,
      section: 1,
      position: 1,
      separator: false,
    }
  }
});
```

### `mediaControl.playPauseComponent.layer {Integer}`
Defines the layer to which the section that the plugin has to be rendered.

### `mediaControl.playPauseComponent.section {Integer}`
Defines the section that the plugin has to be rendered.

### `mediaControl.playPauseComponent.position {Integer}`
Defines the position that the plugin has to be rendered within the wanted section. In horizontal sections, the order of position will be from left to right and in vertical sections, the order will be from top to bottom.

### `mediaControl.playPauseComponent.separator {Integer}`
If it's configured with the value `true`, it will cause the plugin to be rendered at the opposite point from the starting position and causing all rendered plugins after it to follow the same rendering order.