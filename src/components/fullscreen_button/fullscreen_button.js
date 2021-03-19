import { Events, Styler, Utils } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

export default class FullscreenButtonPlugin extends MediaControlComponentPlugin {
  get name() { return 'fullscreen_button' }

  get layer() { return 1 }

  get section() { return 1 }

  get position() { return 3 }

  get tagName() { return 'button' }

  get attributes() { return { class: 'fullscreen-button media-control__button' } }

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

  toggle() {
  }

  changeIcon() {
  }

  render() {
    if (this.isRendered || !Utils.Fullscreen.fullscreenEnabled()) return
    this.$el[0].innerHTML = ''
    this.isRendered = true
    return this
  }
}
