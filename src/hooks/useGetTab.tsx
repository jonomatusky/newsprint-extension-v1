/* global chrome */

import { useEffect, useState } from 'react'
import blacklist from '../util/blacklist'

const getHtml = () => {
  let clone = document.documentElement.cloneNode(true) as HTMLElement
  let tagsToRemove = [
    // 'script',
    'style',
    'iframe',
    'link',
    'img',
    'video',
    'audio',
    'source',
    'track',
    'object',
    'embed',
    'picture',
    'frame',
    'frameset',
    'noframes',
    'svg',
  ]

  tagsToRemove.forEach(tag => {
    let elements = Array.from(clone.getElementsByTagName(tag))
    elements.forEach(element => {
      element.parentNode?.removeChild(element)
    })
  })

  let html = clone.outerHTML

  // remove blank lines
  html = html.replace(/^\s*[\r\n]/gm, '')

  return html
}

const isLikelyArticle = (htmlString: string, url: string) => {
  const parser = new DOMParser()
  const html = parser.parseFromString(htmlString, 'text/html')

  if (blacklist.some(pattern => pattern.test(url))) {
    return false
  }

  const hasArticleTags = html.getElementsByTagName('article').length > 0
  const isOgArticle =
    html.querySelector('meta[property="og:type"][content="article"]') !== null

  const schemaScripts = Array.from(
    html.querySelectorAll('script[type="application/ld+json"]')
  )
  const hasNewsSchema = schemaScripts.some(script => {
    let json
    try {
      json = JSON.parse(script.textContent || '')
    } catch (error) {
      return false
    }
    return json['@type'] === 'NewsArticle' || json['@type'] === 'Article'
  })

  return hasArticleTags || isOgArticle || hasNewsSchema
}

const useGetTab = () => {
  const [url, setUrl] = useState<any>(null)
  const [html, setHtml] = useState<any>(null)
  const [isArticle, setIsArticle] = useState<any>(false)
  const [prohibited, setProhibited] = useState<any>(false)

  useEffect(() => {
    const getUrl = async () => {
      console.log('getting url')
      let tabId = null
      let h = null
      let u = ''

      try {
        let [tab] = await chrome.tabs.query({
          active: true,
          lastFocusedWindow: true,
        })

        u = tab?.url || ''
        tabId = tab?.id || null

        if (!u) {
          console.log('URL not found')
          return
        }

        let url_as_url = new URL(u)
        if (url_as_url.pathname === '/') {
          console.log('Prohibited URL')
          return
        }

        const prohibitedUrls = [
          'chrome://',
          'chrome-extension://',
          'chrome-devtools://',
          'chrome-native://',
          'chrome-search://',
          'chrome-untrusted://',
          'file://',
        ]

        const isProhibited = prohibitedUrls.some(prohibitedUrl =>
          u.startsWith(prohibitedUrl)
        )

        if (isProhibited || !u || !tabId) {
          console.log('Prohibited URL')
          setHtml(null)
          setUrl(null)
          setIsArticle(false)
          setProhibited(true)
          return
        }
      } catch (err) {
        console.log(err)
        return
      }

      try {
        if (tabId) {
          const res = await chrome.scripting.executeScript({
            target: { tabId },
            func: getHtml,
          })

          h = res[0]?.result
          setIsArticle(isLikelyArticle(h, u))
          setHtml(h)
          setUrl(u)
        }
      } catch (err) {
        console.log(err)
      }
    }

    if (!url) {
      getUrl()
    }
  }, [url])

  return { html, url, isArticle, prohibited }
}

export default useGetTab
