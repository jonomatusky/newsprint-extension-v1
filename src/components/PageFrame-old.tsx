/* global chrome */

import React, { useEffect, useState } from 'react'
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
  const [page, setPage] = useState<any>(null)
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

  useEffect(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      let url = tabs[0]?.url || ''
      console.log(url)

      setTabId(tabs[0]?.id)
      if (url && url !== tabUrl) {
        setTabUrl(url)
      }
    })
  })

  useEffect(() => {
    const fetchPage = async (url: string) => {
      console.log('getting page')
      setStatus('loading')
      try {
        // send with session token
        const response = await axios.get(
          `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/pages?url=${url}`,
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        )

        const page = response.data?.data?.[0]

        if (!!page) {
          setPage(page)
          setStatus('success')
        }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setStatus('not_found')
        } else {
          setStatus('error')
        }
      }
    }

    if (!!tabUrl && status !== 'loading' && !page && !!sessionToken) {
      console.log('fetching page')
      const encodedUrl = encodeURIComponent(tabUrl)
      fetchPage(encodedUrl)
    }
  })

  useEffect(() => {
    const fetchPage = async (url: string) => {
      console.log('getting page')
      setStatus('loading')
      try {
        // send with session token
        const response = await axios.get(
          `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/pages?url=${url}`,
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        )

        const page = response.data?.data?.[0]

        if (!page) {
          setStatus('not_found')
          return
        } else {
          setPage(page)
          setStatus('success')
          setAnalysisStatus('success')
        }
      } catch (error: any) {
        console.log(error)
        if (error?.response?.status === 404) {
          setStatus('not_found')
        } else {
          setStatus('error')
        }
      }
    }

    const scheduler = setInterval(async () => {
      if (
        isSignedIn &&
        !!sessionToken &&
        !!tabUrl &&
        analysisStatus !== 'success' &&
        status !== 'loading' &&
        !page
      ) {
        console.log('fetching page')
        const encodedUrl = encodeURIComponent(tabUrl)
        fetchPage(encodedUrl)

        // get the current tab url and then fetch the page
        // chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        //   let url = tabs[0]?.url || ''
        //   console.log(url)

        //   setTabId(tabs[0].id)
        //   if (url && url !== tabUrl) {
        //     const encodedUrl = encodeURIComponent(url)
        //     setTabUrl(url)
        //     fetchPage(encodedUrl)
        //   }
        // })
      }
    }, 5000)

    return () => clearInterval(scheduler)
  }, [isSignedIn, tabUrl, sessionToken, analysisStatus, page, status])

  // useEffect(() => {
  //   console.log('getting entities')

  //   const fetchEntities = async (url: string) => {
  //     setStatus('loading')
  //     try {
  //       // send with session token
  //       const response = await axios.get(
  //         `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/pages?url=${url}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${sessionToken}`,
  //           },
  //         }
  //       )
  //       console.log(response.data)
  //       setData(response.data)
  //       setStatus('success')
  //     } catch (error: any) {
  //       console.log(error)
  //       if (error?.response?.status === 404) {
  //         setStatus('not_found')
  //       } else {
  //         setStatus('error')
  //       }
  //     }
  //   }

  //   const scheduler = setInterval(async () => {
  //     if (isSignedIn && !!sessionToken) {
  //       // get the current tab url and then fetch the page
  //       chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
  //         let url = tabs[0]?.url || ''
  //         console.log(url)

  //         setTabId(tabs[0].id)
  //         if (url && url !== tabUrl) {
  //           const encodedUrl = encodeURIComponent(url)
  //           setTabUrl(url)
  //           fetchEntities(encodedUrl)
  //         }
  //       })
  //     }
  //   }, 5000)

  //   return () => clearInterval(scheduler)
  // }, [isSignedIn, tabUrl, sessionToken])

  // const getHtml = () => {
  //   return document.documentElement.outerHTML
  // }

  const getHtml = () => {
    let clone = document.documentElement.cloneNode(true) as HTMLElement
    let tagsToRemove = [
      'script',
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

  const getCurrentPageHtml = async () => {
    const res = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: getHtml,
    })

    const html = res[0]?.result

    return html
  }

  console.log(page)

  const handleAnalyze = async () => {
    setAnalysisStatus('loading')

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
      console.error(err)
      setAnalysisStatus('error')
    }
  }

  console.log(page?.analysis_status)

  if (analysisStatus === 'loading') {
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
          <CircularProgress />
          <Typography textAlign="center">Analyzing...</Typography>
        </Box>
      </Box>
    )
  }

  if (status === 'loading' || status === 'idle')
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
        Error
      </Box>
    )

  if (
    status === 'not_found' ||
    page.analysis_status !== 'complete' ||
    analysisStatus === 'error'
  )
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
