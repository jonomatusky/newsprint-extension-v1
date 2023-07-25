/* global chrome */

import React, { useCallback, useEffect, useState } from 'react'
import { useUser, useAuth } from '@clerk/chrome-extension'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material'
import axios from 'axios'
import ViewPage from './view-page'

const REACT_APP_SIGNIN_PAGE = process.env.REACT_APP_SIGNIN_PAGE || ''
const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''
const REACT_APP_API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || ''

function PageFrame() {
  console.log('rendering')

  const [page, setPage] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const [entities, setEntities] = useState<any>(null)
  const [status, setStatus] = useState('idle')
  const [analysisStatus, setAnalysisStatus] = useState('idle')
  const [tabUrl, setTabUrl] = useState('')
  const [tabId, setTabId] = useState<any>('')

  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth()

  const [sessionToken, setSessionToken] = React.useState('')

  useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken()
      setSessionToken(token as string)
    }, 1000)

    return () => clearInterval(scheduler)
  }, [getToken])

  // set the tabUrl and tabId when the extension is opened
  useEffect(() => {
    console.log('setting tab url')
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      let url = tabs[0]?.url || ''
      console.log(url)

      setTabId(tabs[0]?.id)
      if (url && url !== tabUrl) {
        setTabUrl(url)
      }
    })
  })

  const fetchData = useCallback(async () => {
    console.log('fetching')

    if (!page && status !== 'loading') {
      try {
        setStatus('loading')
        const result = await axios.get(
          `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/pages?url=${tabUrl}`,
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        )

        const fetchedPage = result.data?.data?.[0]

        if (!fetchedPage) {
          throw new Error('Page not found')
        }

        setPage(fetchedPage)
        setAnalysisStatus(fetchedPage.analysis_status)
        setStatus('success')
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          // Page not found
          setPage(null)
          setStatus('idle')
        } else {
          // Other errors
          setStatus('error')
          setError('Error fetching page')
        }
      }
    }
  }, [sessionToken, tabUrl, page, status])

  // fetch page every 5 seconds
  useEffect(() => {
    console.log('useEffect')
    if (isSignedIn && sessionToken && tabUrl) {
      fetchData() // fetch immediately
      const intervalId = setInterval(fetchData, 5000) // then every 5 seconds
      return () => clearInterval(intervalId)
    }
  }, [isSignedIn, sessionToken, tabUrl, fetchData])

  const getHtml = () => {
    let clone = document.documentElement.cloneNode(true) as HTMLElement
    let tagsToRemove = [
      // 'script',
      // 'style',
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

  const getCurrentPageHtml = async () => {
    const res = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: getHtml,
    })

    const html = res[0]?.result

    return html
  }

  const handleAnalyze = async () => {
    setAnalysisStatus('pending')

    try {
      const html = await getCurrentPageHtml()

      await axios.post(
        `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/me/pages`,
        [{ url: tabUrl, html: html }],
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )
    } catch (err) {
      setStatus('error')
      setError('Error analyzing page')
    }
  }

  if (status === 'loading' || !page)
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    )

  if (status === 'error')
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {error || 'Error'}
      </Box>
    )

  // if (analysisStatus === 'pending') {
  //   return (
  //     <Box
  //       height="100vh"
  //       width="100vw"
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //       flexWrap="wrap"
  //     >
  //       <Box width="100%" textAlign="center">
  //         <CircularProgress />
  //         <Typography textAlign="center">Analyzing...</Typography>
  //       </Box>
  //     </Box>
  //   )
  // }

  if (analysisStatus !== 'complete')
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
      >
        <Box width="100%" textAlign="center">
          <Typography>Save & Summarize?</Typography>
          <Button variant="contained" onClick={handleAnalyze}>
            Analyze
          </Button>
        </Box>
      </Box>
    )

  return (
    <Box p={2.5}>
      <ViewPage page={page} />
    </Box>
  )
}

export default PageFrame
