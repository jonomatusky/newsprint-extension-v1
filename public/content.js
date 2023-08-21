/* global chrome */

const getHtml = () => {
  let clone = document.documentElement.cloneNode(true)
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

function createPanel(id) {
  // ... (other parts of the function)

  const panelIframe = document.createElement('iframe')
  if (id) {
    panelIframe.src = chrome.runtime.getURL(`index.html`) + `?page_id=` + id // adjust the path as necessary
  } else {
    panelIframe.src = chrome.runtime.getURL(`index.html`) // adjust the path as necessary
  }

  panelIframe.style.border = 'none'
  panelIframe.style.position = 'fixed' // Use 'fixed' instead of 'absolute' to keep it at the top right even when scrolling.
  panelIframe.style.zIndex = '1000'
  panelIframe.style.width = '300px'
  panelIframe.style.height = '500px' // Set height to 600px
  panelIframe.style.borderRadius = '20px'
  panelIframe.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)'
  panelIframe.style.right = '10px' // 10px from the right
  panelIframe.style.top = '10px' // 10px from the top
  panelIframe.style.display = 'block'

  document.body.appendChild(panelIframe)

  return panelIframe // This is what you'll show/hide on hover
}

async function inject() {
  try {
    console.log('RUNNING')

    // Create a single tooltip for efficiency
    // const tooltip = createShadowTooltip()
    // document.body.appendChild(tooltip)

    const html = getHtml()

    const response = await chrome.runtime.sendMessage({
      action: 'checkIsArticle',
      html,
    })

    if (!response.isArticle) {
      return
    }

    const result = await chrome.storage.local.get(['token'])

    const token = result.token

    if (token) {
      const pageResponse = await chrome.runtime.sendMessage({
        action: 'fetchDataAndSetPage',
        html: html,
      })

      console.log(pageResponse)

      const page = pageResponse.page || {}

      const id = page?.id

      if (id) {
        createPanel(id)
      }
    } else {
      createPanel()
    }
  } catch (err) {
    console.log(err)
  }
}

// Run the injectIcon function on page load
window.onload = function () {
  // The page is fully loaded

  inject()
}
