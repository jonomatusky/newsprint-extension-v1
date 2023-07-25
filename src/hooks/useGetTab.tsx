/* global chrome */

import { useEffect, useState } from 'react'

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

const useGetTab = () => {
  const [url, setUrl] = useState<any>(null)
  const [html, setHtml] = useState<any>(null)

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
        ]

        const isProhibited = prohibitedUrls.some(prohibitedUrl =>
          u.startsWith(prohibitedUrl)
        )

        if (isProhibited || !u || !tabId) {
          console.log('Prohibited URL')
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
        }
      } catch (err) {
        console.log(err)
      }

      setHtml(h)
      setUrl(u)
    }

    if (!url) {
      getUrl()
    }
  }, [url])

  return { html, url }
}

export default useGetTab
