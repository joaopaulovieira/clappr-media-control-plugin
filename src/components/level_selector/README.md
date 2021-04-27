# Level Selector Component plugin

<div align=center>
  <img src="https://raw.githubusercontent.com/joaopaulovieira/clappr-media-control-plugin/main/public/images/examples/level_selector_example.png">
</div>
<br>

## Configuration
The options for the component go in the `mediaControl.levelSelectorComponent` property as shown below:
```javascript
var player = new Clappr.Player({
  source: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  plugins: [
    MediaControl.MainPlugin,
    ..., // Others component plugins.
    MediaControl.LevelSelectorPlugin,
  ],
  mediaControl: {
    levelSelectorComponent: { 
      layer: 1, 
      section: 1, 
      position: 2, 
      separator: true,
      onlyShowWithClick: false,
      labels: {
        0: 'low',
        1: 'medium',
        2: 'high',
        3: 'max', 
      },
      onLevelsAvailable: function(levels) { return levels.reverse() },
    }
  }
});
```

### `layer {Integer}`
Defines the layer to which the section that the plugin has to be rendered.

### `section {Integer}`
Defines the section that the plugin has to be rendered.

### `position {Integer}`
Defines the position that the plugin has to be rendered within the wanted section. In horizontal sections, the order of position will be from left to right and in vertical sections, the order will be from top to bottom.

### `separator {Integer}`
If it's configured with the value `true`, it will cause the plugin to be rendered at the opposite point from the starting position and causing all rendered plugins after it to follow the same rendering order.

### `onlyShowWithClick {Integer}`
By default, the level menu is displayed when the mouse hovers over the plugin icon rendered in the media control for devices that supports mouse events. If this config has the `true` value, the menu will only be displayed when a click event occurs on the component icon.

### `labels {Object}`
A dictionary to which the key represents the level id to be customized and the value is the label that will be used for that level.

### `onLevelsAvailable {Function}`
A callback that receives the levels as soon as they are available. This function should return the levels that will be used to render the menu.

-----
### For MP4 medias, it's necessary specific configs. See below:

```javascript
var player = new Clappr.Player({
  source: 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_1920_18MG.mp4',
  plugins: [
    MediaControl.MainPlugin,
    ..., // Others component plugins.
    MediaControl.LevelSelectorPlugin,
  ],
  mediaControl: {
    levelSelectorComponent: { 
      ... // Other configs.
      mp4Levels: [
        { id: 0, label: 'low', source: 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4' },
        { id: 1, label: 'medium', source: 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_640_3MG.mp4' },
        { id: 2, label: 'high', source: 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_1280_10MG.mp4' },
        { id: 3, label: 'max', source: 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_1920_18MG.mp4', default: true },
      ],
    }
  }
});
```

### `mp4Levels {Array}`
  A list of objects that represent a level. This object must have the following properties: `id`, `label`, `source` and `default`.

* #### `id {Integer}`
  The level identifier. This value must be unique.

* #### `label {String}`
  Value used to describe the level rendered in the level menu.

* #### `source {String}`
  The URL of the level that will be configured in playback when a level is selected.

* #### `default {Boolean}`
  Indicates which level will be displayed as the current one when the level menu is rendered for the first time.