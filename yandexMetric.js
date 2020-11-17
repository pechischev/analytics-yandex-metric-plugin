/* global ym */

const defaultConfig = {
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: true,
}

function ymNotLoaded(scriptSrc) {
  if (scriptSrc) {
    const scripts = document.querySelectorAll('script[src]')
    const scriptLoaded = !!Object.keys(scripts).filter((key) => (scripts[key].src || '') === scriptSrc).length

    return !scriptLoaded
  }
  return typeof ym === 'undefined'
}

let isYmInitialized = false

/**
 * Yandex metric plugin
 * @param pluginConfig
 * @return {*}
 *
 * @example
 * yandexMetric({
 *   ymId: 12345678
 * })
 */
const yandexMetric = (pluginConfig = {}) => {
  return {
    name: 'yandex-metric',
    config: {
      ...defaultConfig,
      ...pluginConfig,
    },
    initialize: ({ config }) => {
      if (!config.ymId) {
        throw new Error('No YM ymId defined')
      }
      const scriptSrc = 'https://mc.yandex.ru/metrika/tag.js'

      if (ymNotLoaded(scriptSrc)) {
        /* eslint-disable */
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", scriptSrc, "ym");
        /* eslint-enable */
      }
      if (!isYmInitialized) {
        const { ymId, id, ...rest } = config

        ym(ymId, 'init', rest)
      }
      isYmInitialized = true
    },
    page: ({ payload, config }) => {
      if (ymNotLoaded()) {
        return
      }
      const { properties } = payload
      ym(config.ymId, 'hit', properties.url, { title: properties.title, referer: properties.referrer })
    },
    track: ({ payload, config }) => {
      if (ymNotLoaded()) {
        return
      }
      const { event } = payload
      ym(config.ymId, 'reachGoal', event)
    },
    identify: ({ payload, config }) => {
      if (ymNotLoaded()) {
        return
      }
      const { id, ...rest } = payload.traits
      ym(config.ymId, 'userParams', { UserID: id, ...rest })
      ym(config.ymId, 'params', { UserID: id, ...rest })
    },
    loaded: () => !ymNotLoaded(),
  }
}

export { yandexMetric }
