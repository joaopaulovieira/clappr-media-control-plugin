import { Browser, Events, Playback, Styler } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

export default class SeekBarPlugin extends MediaControlComponentPlugin {
  get name() { return 'seek_bar' }

  get layer() { return 1 }

  get section() { return 2 }

  get position() { return 1 }

  get tagName() { return 'input' }

  get attributes() {
    return {
      class: 'seek-bar',
      type: 'range',
      value: 0,
      max: 100,
    }
  }
  bindEvents() {
    const coreEventListenerData = [{ object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged }]
    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  onContainerChanged() {
    this.container && this.stopListening(this.container)
    this.container = this.core.activeContainer
    if (!this.container) return
    this.bindContainerEvents()
  }

  bindContainerEvents() {
  }

  updatePosition(position) {
    this.$el[0].value = position
  }

  render() {
    if (this.isRendered) return
    this.el.innerHTML = ''
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.isRendered = true
    return this
  }
}
