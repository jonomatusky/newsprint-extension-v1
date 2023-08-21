/* global chrome */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('received request from app to get data')

  if (message.action === 'reactAppFetchDataAndSetPage') {
    const processMessage = async () => {
      const html = getHtml()

      console.log('running on page')
      const result = chrome.runtime.sendMessage({
        action: 'fetchDataAndSetPage',
        html,
      })

      console.log(result)

      return result
    }

    processMessage()
      .then(function (response) {
        console.log(response)
        sendResponse(response)
      })
      .catch(err => {
        console.error(err)
        sendResponse({ status: 'error' }) // Send a default response on error
      })

    return true
  }
})

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

function isNearH1(element) {
  let currentElement = element
  for (let i = 0; i < 4; i++) {
    // Check up to 4 levels up, adjust as necessary
    if (currentElement.parentElement.querySelector('h1')) {
      return true
    }
    currentElement = currentElement.parentElement
  }
  return false
}
function createPanel() {
  // ... (other parts of the function)

  const panelIframe = document.createElement('iframe')
  panelIframe.src = chrome.runtime.getURL(`index.html`) // adjust the path as necessary
  panelIframe.style.border = 'none'
  panelIframe.style.position = 'fixed' // Use 'fixed' instead of 'absolute' to keep it at the top right even when scrolling.
  panelIframe.style.zIndex = '1000'
  panelIframe.style.width = '300px'
  panelIframe.style.height = '500px' // Set height to 600px
  panelIframe.style.borderRadius = '20px'
  panelIframe.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)'
  panelIframe.style.right = '10px' // 10px from the right
  panelIframe.style.top = '10px' // 10px from the top
  // panelIframe.style.display = 'none'

  document.body.appendChild(panelIframe)

  return panelIframe // This is what you'll show/hide on hover
}

function createShadowTooltip() {
  // Create a new div for the shadow root host

  // chrome.storage.local.get(null, function (items) {
  //   console.log(items)
  // })

  const tooltipIframe = document.createElement('iframe')
  tooltipIframe.src = chrome.runtime.getURL(`index.html`) + '?type=authorPopup' // adjust the path as necessary
  tooltipIframe.style.border = 'none'
  tooltipIframe.style.position = 'absolute'
  tooltipIframe.style.zIndex = '1000'
  tooltipIframe.style.width = '400px'
  tooltipIframe.style.height = '400px'
  tooltipIframe.style.borderRadius = '20px'
  tooltipIframe.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)'
  tooltipIframe.style.display = 'none'

  return tooltipIframe // This is what you'll show/hide on hover

  // const host = document.createElement('div')
  // host.className = 'my-shadow-tooltip-host'

  // // Attach a shadow root to the host
  // const shadow = host.attachShadow({ mode: 'closed' })

  // // Add content to the shadow root
  // const tooltipContent = document.createElement('div')
  // tooltipContent.textContent = 'Your tooltip content goes here'
  // tooltipContent.style.background = 'white'
  // tooltipContent.style.border = '1px solid darkgrey'
  // tooltipContent.style.borderRadius = '5px'
  // tooltipContent.style.padding = '5px 10px'
  // tooltipContent.style.position = 'absolute'
  // tooltipContent.style.zIndex = '10000'
  // tooltipContent.style.display = 'none'
  // tooltipContent.style.fontSize = '0.9em'

  // shadow.appendChild(tooltipContent)

  // // Add the host to the body
  // document.body.appendChild(host)

  // return tooltipContent // This is what you'll show/hide on hover
}

const runOnPage = async (url, html) => {
  chrome.runtime.sendMessage({
    action: 'fetchDataAndSetPage',
    url: url,
    html: html,
  })
  let panel = (createPanel().style.display = 'block')
  document.body.appendChild(panel)
}

async function inject() {
  const baseUrl = window.location.protocol + '//' + window.location.host
  const aTags = document.querySelectorAll('a[href]')
  const seenUrls = new Set()
  const seenNames = new Set()

  console.log('RUNNING')

  // Create a single tooltip for efficiency
  // const tooltip = createShadowTooltip()
  // document.body.appendChild(tooltip)

  const html = getHtml()

  chrome.runtime.sendMessage(
    {
      action: 'checkIsArticle',
      html,
    },
    function (response) {
      console.log(response)

      if (response.isArticle) {
        runOnPage()
      }
    }
  )

  // chrome.runtime.sendMessage(
  //   {
  //     action: 'checkIsArticle',
  //     html,
  //   },
  //   function (response) {
  //     console.log(response)

  //     if (response.isArticle) {
  //       let panel = (createPanel().style.display = 'block')
  //       document.body.appendChild(panel)
  //     }
  //   }
  // )

  // let hideTimeout = null // This will store the reference to the timeout

  // const delay = 1000 // 1 second delay

  // const showTooltip = (event, tooltip, triggerElement) => {
  //   console.log('showTooltip')

  //   const rect = triggerElement.getBoundingClientRect()

  //   tooltip.style.top = `${
  //     (rect.bottom + rect.top) / 2 + window.scrollY - 200
  //   }px`
  //   tooltip.style.left = `${rect.right + window.scrollX + 10}px`
  //   tooltip.src = chrome.runtime.getURL(`index.html`) + '?type=authorPopup'

  //   if (hideTimeout) {
  //     clearTimeout(hideTimeout) // Clear the timeout if the mouse enters the tooltip
  //   }

  //   tooltip.style.display = 'block'
  // }

  // const initiateHideTooltip = tooltip => {
  //   hideTimeout = setTimeout(() => {
  //     console.log('hideTooltip')
  //     tooltip.src = null
  //     tooltip.style.display = 'none'
  //   }, delay)
  // }

  // const cancelHideTooltip = () => {
  //   if (hideTimeout) {
  //     clearTimeout(hideTimeout) // Clear the timeout if the mouse enters the tooltip
  //   }
  // }

  for (const anchor of aTags) {
    // Check for proximity to an h1 tag (you can keep or remove this based on your needs)
    // const h1Nearby =
    //   anchor.parentElement.querySelector('h1') ||
    //   anchor.parentElement.previousElementSibling?.tagName === 'H1' ||
    //   anchor.parentElement.nextElementSibling?.tagName === 'H1'

    // if (!h1Nearby) continue

    // if (!isNearH1(anchor)) continue

    if (
      anchor.href.includes('/author/') ||
      anchor.href.includes('/by/') ||
      anchor.href.includes('/authors/')
    ) {
      const name = anchor.textContent.trim()
      const url = new URL(anchor.getAttribute('href'), baseUrl).href

      if (!seenUrls.has(url)) {
        seenUrls.add(url)

        anchor.style.textDecoration = 'underline dashed lightblue'
        anchor.style.textUnderlineOffset = '0.2em'

        // Create the icon (non-clickable now)
        const icon = document.createElement('img')
        icon.src = chrome.runtime.getURL('icon.png')
        icon.style.cursor = 'pointer'
        icon.style.display = 'inline-block'
        icon.style.marginLeft = '5px'
        icon.style.verticalAlign = 'middle'

        // Insert the icon after the anchor tag
        anchor.parentNode.insertBefore(icon, anchor.nextSibling)

        //   anchor.addEventListener('mouseenter', event =>
        //     showTooltip(event, tooltip, icon)
        //   )
        //   anchor.addEventListener('mouseleave', () =>
        //     initiateHideTooltip(tooltip)
        //   )
        //   icon.addEventListener('mouseenter', event =>
        //     showTooltip(event, tooltip, icon)
        //   )
        //   icon.addEventListener('mouseleave', () => initiateHideTooltip(tooltip))

        //   tooltip.addEventListener('mouseenter', cancelHideTooltip)
        //   tooltip.addEventListener('mouseleave', () =>
        //     initiateHideTooltip(tooltip)
        //   )
      }

      if (name && !seenNames.has(name)) {
        seenNames.add(name)
      }
    }
  }
}

// Run the injectIcon function on page load
window.onload = function () {
  // The page is fully loaded

  inject()
}
