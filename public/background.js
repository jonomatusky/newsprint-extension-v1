/* global chrome */

console.log('running')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('message received')

  if (message.action === 'checkIsArticle') {
    const processMessage = async () => {
      try {
        const html = message.html
        const url = await getUrl()
        console.log(url)

        if (!url) {
          return { isArticle: false }
        }

        const runOnPage = await checkIsArticle(url, html)

        if (!runOnPage) {
          return { isArticle: false }
        }

        return { isArticle: true }
      } catch (error) {
        console.error('An error occurred:', error)
        return { isArticle: false } // default response in case of error
      }
    }

    processMessage()
      .then(function (response) {
        console.log(response)
        sendResponse(response)
      })
      .catch(err => {
        console.error(err)
        sendResponse({ isArticle: false }) // Send a default response on error
      })

    return true
  }

  if (message.action === 'fetchDataAndSetPage') {
    const processMessage = async () => {
      try {
        const html = message.html
        const url = await getUrl()

        const page = await fetchDataAndSetPage(url, html)

        if (!!page && page.id) {
          chrome.storage.local.set([page.id], page)
          return { status: 200, page }
        } else {
          return { status: 404 }
        }
      } catch (error) {
        console.error('An error occurred:', error)
        return { status: 200 } // default response in case of error
      }
    }

    processMessage()
      .then(function (response) {
        console.log(response)
        sendResponse(response)
      })
      .catch(err => {
        console.error(err)
        sendResponse({ isArticle: false }) // Send a default response on error
      })

    return true
  }

  if (message.action === 'swapExtensionIdForToken') {
    console.log('getting token')

    const { extensionId } = message

    console.log(extensionId)

    const get = async () => {
      try {
        getTokenFromExtensionId(extensionId)
      } catch (error) {
        console.error('An error occurred:', error)
      }
    }

    get()
  }
})

// async function getCurrentTab() {
//   console.log('getting current tab')
//   let queryOptions = { active: true, currentWindow: true }
//   let [tab] = await chrome.tabs.query(queryOptions)
//   console.log(tab)
// }

// chrome.runtime.onInstalled.addListener(async () => {
//   console.log(await getCurrentTab())
// })

const isLikelyArticle = (htmlString, url) => {
  if (blacklist.some(pattern => pattern.test(url))) {
    return false
  }

  const hasArticleTags = /<article[\s\S]*?>[\s\S]*?<\/article>/.test(htmlString)
  const isOgArticle =
    /<meta[^>]*property=["']og:type["'][^>]*content=["']article["'][^>]*>/.test(
      htmlString
    ) ||
    /<meta[^>]*content=["']article["'][^>]*property=["']og:type["'][^>]*>/.test(
      htmlString
    )

  const schemaPattern =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g
  let match
  let hasNewsSchema = false

  while ((match = schemaPattern.exec(htmlString)) !== null) {
    let json
    try {
      json = JSON.parse(match[1])
    } catch (error) {
      continue
    }
    if (json['@type'] === 'NewsArticle' || json['@type'] === 'Article') {
      hasNewsSchema = true
      break
    }
  }

  return hasArticleTags || isOgArticle || hasNewsSchema
}

const blacklist = [
  /stackoverflow\.com/,
  /quora\.com/,
  /reddit\.com/,
  /linkedin\.com/,
  /twitter\.com/,
  /facebook\.com/,
  /instagram\.com/,
  /pinterest\.com/,
  /tiktok\.com/,
  /docs\.google\.com/,
  /drive\.google\.com/,
  /slideshare\.net/,
  /nytimes\.com\/section/,
  /notion\.so/,
  /notion\.site/,
]

const getUrl = async () => {
  let queryOptions = { active: true, currentWindow: true }
  let tabs = (await chrome.tabs.query(queryOptions)) || []
  console.log(tabs)

  const tab = tabs[0] || {}
  const url = tab.url

  if (!url) {
    return
  }

  return url
}

const checkIsArticle = async (url, html) => {
  let url_as_url = new URL(url)

  if (url_as_url.pathname === '/') {
    return
  }

  const prohibitedUrls = [
    'chrome://',
    'chrome-extension://',
    'chrome-devtools://',
    'chrome-native://',
    'chrome-search://',
    'chrome-untrusted://',
    'localhost:',
    'file://',
  ]

  const isProhibited = prohibitedUrls.some(prohibitedUrl =>
    url.startsWith(prohibitedUrl)
  )

  const isArticle = isLikelyArticle(html, url)

  if (isProhibited || !url || !isArticle) {
    return false
  }

  return true
}

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log('tabs updated')
//   if (changeInfo.status === 'complete') {
//     chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//       let currentTab = tabs[0] || {}

//       let url = currentTab.url

//       if (url) {
//         fetcher(`pages?url=${url}`)
//       }
//     })
//   }
// })

const fetcher = async (path, config = {}) => {
  const method = config.method || 'GET'
  const headers = config.headers || {}
  const body = config.body ? JSON.stringify(config.body) : null

  try {
    const configResponse = await fetch('/config.json')
    const config = await configResponse.json()

    console.log(config)
    const { APP_URL, API_PATH } = config

    const BASE_URL = `${APP_URL}${API_PATH}`

    let url = `${BASE_URL}${path}`

    console.log(url)

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    })

    console.log(response)

    // Depending on what you want to return, for instance, if you always want to return JSON:
    const responseData = await response.json()
    return { data: responseData, ok: response.ok, status: response.status }
  } catch (error) {
    throw error
  }
}

const fetcherWithAuth = async (path, config = {}) => {
  return new Promise(async (resolve, reject) => {
    console.log('fetching')

    // Get sessionToken from local storage
    chrome.storage.local.get(['token'], async result => {
      const sessionToken = result.token

      if (!sessionToken) {
        console.log('No sessionToken found in local storage.')
        return
      }

      config.headers = {
        Authorization: `Bearer ${sessionToken}`,
        ...(config.headers || {}),
      }

      try {
        const responseData = await fetcher(path, config)

        resolve(responseData)
      } catch (error) {
        reject(error)
      }
    })
  })
}

async function fetchDataAndSetPage(url, html) {
  console.log('fetching page data')
  console.log(url)

  const encodedUrl = encodeURIComponent(url)

  // Step 1: Try to get the page
  const response = await fetcherWithAuth(`/pages?url=${encodedUrl}`)

  console.log(response)
  console.log(response.status)

  if (!response.ok) {
    if (response.status === 404) {
      // Step 2: Analyze if not found
      const analyzedData = await fetcherWithAuth(`/me/pages`, {
        method: 'POST',
        body: { url, html },
      })

      console.log(analyzedData)
      return analyzedData.data?.[0]
    } else {
      throw new Error('Error fetching data')
    }
  } else {
    const data = await response.json()
    return data.data?.[0]
  }
}

const getTokenFromExtensionId = async extensionId => {
  console.log('getting token data')
  try {
    const response = await fetcher(`/auth/ext/${extensionId}`)
    const data = response.data

    // get token from response
    const token = data.token
    const user = data.user

    // save token to local storage
    if (token) {
      await chrome.storage.local.set({ token })

      if (user) {
        console.log('user', user)
        await chrome.storage.local.set({ user })
      }
    }
  } catch (err) {
    console.log(err)

    if (err && err.status === 400) {
      chrome.storage.local.remove(['extension_id'])
    }
  }
}
