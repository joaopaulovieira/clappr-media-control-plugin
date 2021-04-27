import { Browser, Events, Styler, template } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import levelSelectorIcon from './public/level_selector_icon.svg'
import pluginStyle from './public/style.scss'
import templateHTML from './public/template.html'

export default class LevelSelectorPlugin extends MediaControlComponentPlugin {
  get name() { return 'level_selector' }

  get config() { return this.options.mediaControl && this.options.mediaControl.levelSelectorComponent }

  get layer() { return this.config && this.config.layer || 1 }

  get section() { return this.config && this.config.section || 1 }

  get position() { return this.config && this.config.position || 2 }

  get separator() { return this.config && typeof this.config.separator !== 'undefined' ? this.config.separator : true }

  get attributes() { return { class: 'level-selector media-control__button' } }

  get template() { return template(templateHTML) }

  get events() {
    const touchOnlyEvents = { click: this.showList }
    const containerEvents = { 'click .level-selector__list-item': this.onLevelSelect }
    const hoverTriggerEvents = {
      mouseenter: this.showList,
      mouseleave: this.hideList,
    }

    return Browser.isMobile || this.config && this.config.onlyShowWithClick
      ? { ...containerEvents, ...touchOnlyEvents }
      : { ...containerEvents, ...hoverTriggerEvents }
  }

  showList() {
    this.$menu.classList.remove('level-selector__container--hidden')
  }

  hideList() {
    this.$menu.classList.add('level-selector__container--hidden')
  }

  render() {
    this.el.innerHTML = ''
    this.$el.html(this.template({ levels: this.levels || [], hasMP4Levels: this.hasMP4Levels }))
    this.cacheElements()
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.$el.append(levelSelectorIcon)
    super.render()
  }

  cacheElements() {
    this.$menu = this.$el[0].querySelector('.level-selector__container')
    this.$levelsList = this.$el[0].querySelector('.level-selector__list')
  }
}
