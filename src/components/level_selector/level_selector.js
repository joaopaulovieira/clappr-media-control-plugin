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

  get hasMP4Levels() { return this.config && this.config.mp4Levels && this.config.mp4Levels.length > 0 }

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

  bindEvents() {
    const coreEventListenerData = [{ object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged }]
    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))

    this.bindCustomEvents()
  }

  onContainerChanged() {
    this.playback && this.stopListening(this.playback)
    this.playback = this.core.activePlayback

    this.hasMP4Levels ? this.fillLevels(this.config.mp4Levels) : this.bindPlaybackEvents()
  }

  bindPlaybackEvents() {
    const playbackEventListenerData = [{ object: this.playback, event: Events.PLAYBACK_LEVELS_AVAILABLE, callback: this.fillLevels }]
    playbackEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    playbackEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))

    this.playback.levels && this.playback.levels.length > 0 && this.fillLevels(this.playback.levels)
  }

  fillLevels(levels) {
    this.levels = levels

    this.config
      && this.config.onLevelsAvailable
      && typeof this.config.onLevelsAvailable === 'function'
      && (this.levels = this.config.onLevelsAvailable(this.levels))

    this.setCustomLabels(this.levels)
    this.render()

    this._currentLevel = this.hasMP4Levels
      ? this.updateMP4CurrentLevel()
      : Object.values(this.$levelsList.children).find(listItem => parseInt(listItem.id, 10) === this.playback.currentLevel)

    this._currentLevel && this._currentLevel.classList && this._currentLevel.classList.add('level-selector__list-item--current')
  }

  setCustomLabels(levels) {
    this.config && this.config.labels && levels.map(level => this.config.labels[level.id] && (level.label = this.config.labels[level.id]))
  }

  updateMP4CurrentLevel() {
    const selectedMP4Level = this.config.mp4Levels.find(level => level.default === true)
    return Object.values(this.$levelsList.children).find(listItem => parseInt(listItem.id, 10) === selectedMP4Level.id)
  }

  bindCustomEvents() {
    this.hideList = this.hideList.bind(this)
    document.removeEventListener('click', this.hideList)
    document.addEventListener('click', this.hideList)
  }

  showList() {
    this.$menu.classList.remove('level-selector__container--hidden')
  }

  hideList() {
    this.$menu.classList.add('level-selector__container--hidden')
  }

  onLevelSelect(event) {
    if (event.target.id === this._currentLevel.id) return setTimeout(this.hideList)

    this._currentLevel.classList.remove('level-selector__list-item--current')
    this._currentLevel = event.target
    this.playback.currentLevel = parseInt(event.target.id, 10)
    this._currentLevel.classList.add('level-selector__list-item--current')

    this.hasMP4Levels && this.updateMP4Source()

    event.stopPropagation()
    setTimeout(this.hideList)
  }

  updateMP4Source() {
    this.listenToOnce(this.playback, Events.PLAYBACK_LOADEDMETADATA, () => {
      this.playback._setupSrc(this.config.mp4Levels[this._currentLevel.id].source)
      this.playback.play()
    })
    this.playback.$el[0].load(this.config.mp4Levels[this._currentLevel.id].source)
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

  destroy() {
    document.removeEventListener('click', this.hideList)
    super.destroy()
  }
}
