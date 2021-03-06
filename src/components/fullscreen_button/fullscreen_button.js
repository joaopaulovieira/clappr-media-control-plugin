import { Events, Styler, Utils } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import enterFullscreenIcon from './public/enter_fullscreen_icon.svg'
import exitFullscreenIcon from './public/exit_fullscreen_icon.svg'
import pluginStyle from './public/style.scss'

export default class FullscreenButtonPlugin extends MediaControlComponentPlugin {
  get name() { return 'fullscreen_button' }

  get config() { return this.options.mediaControl && this.options.mediaControl.fullscreenComponent }

  get layer() { return this.config && this.config.layer || 1 }

  get section() { return this.config && this.config.section || 1 }

  get position() { return this.config && this.config.position || 3 }

  get separator() { return this.config && typeof this.config.separator !== 'undefined' ? this.config.separator : null }

  get tagName() { return 'button' }

  get attributes() { return { class: 'fullscreen-button media-control__button' } }

  get events() {
    const events = { click: this.toggle }
    return events
  }

  bindCustomEvents() {
    this.boundedCheckFullscreenTarget = this.checkFullscreenTarget.bind(this)
    document.addEventListener('fullscreenchange', this.boundedCheckFullscreenTarget)
  }

  checkFullscreenTarget(ev) {
    ev.target === this.core.$el[0] && this.changeIcon()
  }

  bindEvents() {
    const coreEventListenerData = [{ object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged }]
    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
    this.bindCustomEvents()
  }

  onContainerChanged() {
    this.container && this.stopListening(this.container)
    this.container = this.core.activeContainer
    if (!this.container) return
    this.bindContainerEvents()
  }

  bindContainerEvents() {
    const containerEventListenerData = [{ object: this.container, event: Events.CONTAINER_DBLCLICK, callback: this.toggle }]
    this.container && containerEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  toggle() {
    this.container.fullscreen()
    this.core.toggleFullscreen()
  }

  changeIcon() {
    setTimeout(() => {
      this.$el[0].innerHTML = ''
      Utils.Fullscreen.fullscreenElement() ? this.$el.append(exitFullscreenIcon) : this.$el.append(enterFullscreenIcon)
    }, 600)
  }

  render() {
    if (this.isRendered || !Utils.Fullscreen.fullscreenEnabled()) return
    this.$el[0].innerHTML = ''
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.changeIcon()
    this.isRendered = true
    super.render()
  }

  destroy() {
    document.removeEventListener('fullscreenchange', this.boundedCheckFullscreenTarget)
    super.destroy()
  }
}
