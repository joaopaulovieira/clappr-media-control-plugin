import { Events, Playback, Styler } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

export default class PlayPauseButtonPlugin extends MediaControlComponentPlugin {
  get name() { return 'play_pause_button' }

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

  changeIcon() {
  }

  toggle() {
  }

  render() {
    if (this.isRendered) return
    this.$el[0].innerHTML = ''
    this.isRendered = true
    return this
  }
}
