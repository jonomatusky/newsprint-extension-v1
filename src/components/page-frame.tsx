import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import ViewPage from './view-page'
import useAnalyze from '../hooks/useAnalyze'
import axios from 'axios'
import useGetTab from '../hooks/useGetTab'
import { SessionContext } from '../context/session-context'

const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''
const REACT_APP_API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || ''

function PageFrame() {
  const { analyze } = useAnalyze()
  const session = useContext(SessionContext)
  const { logout, sessionToken } = session || {
    logout: () => {},
    sessionToken: null,
  }
  const { url, isArticle, prohibited } = useGetTab()

  console.log(url)
  console.log(isArticle)
  console.log(prohibited)

  const [page, setPage] = useState<any>(null)
  const [status, setStatus] = useState<any>('idle')
  const [lists, setLists] = useState<any>(null)
  // const [listStatus, setListStatus] = useState<any>('idle')
  // const [pageLists, setPageLists] = useState<any>(null)
  // const [pageListStatus, setPageListStatus] = useState<any>('idle')
  const analysisStatus = page?.analysis_status || null

  let pageLists = page?.lists || []

  useEffect(() => {
    let urlToOpen = REACT_APP_APP_URL + '/pages'

    if (urlToOpen) {
      let rootDomain = new URL(urlToOpen).hostname.split(':')[0] // Get domain without port

      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        var domainExists = tabs.some(tab => {
          if (tab.url) {
            return new URL(tab.url).hostname.split(':')[0] === rootDomain
          }
          return false
        })

        if (!domainExists) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              if (tabs[0] && tabs[0].id !== undefined) {
                let activeTabId = tabs[0].id
                chrome.tabs.create(
                  { url: urlToOpen, index: 0, active: false },
                  function (tab) {
                    chrome.tabs.update(activeTabId, { active: true })
                  }
                )
              }
            }
          )
        }
      })
    }
  }, [])

  const handleUpdateLists = async (listIds: Array<String>) => {
    try {
      await axios.patch(
        `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/me/pages/${page.id}/lists`,
        {
          list_ids: listIds,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )
    } catch (err) {
      console.log(err)
    }
  }

  const fetchDataAndSetPage = useCallback(
    async (analyzeIfNotFound = false) => {
      try {
        const result = await axios.get(
          `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/pages?url=${url}`,
          {
            headers: {
              authorization: `Bearer ${sessionToken}`,
            },
          }
        )

        const fetchedPage = result.data?.data?.[0]

        if (!fetchedPage) {
          throw new Error('Page not found')
        }

        setPage(fetchedPage)
        setStatus('complete')
      } catch (err: any) {
        console.log(err)

        if (err.response && err.response.status === 404 && analyzeIfNotFound) {
          try {
            let analyzedPage = await analyze()
            setPage(analyzedPage)
            setStatus('complete')
          } catch (err: any) {
            console.log(err)
            setStatus('error')
          }
        } else {
          setPage(null)
          setStatus('error')
        }
      }
    },
    [analyze, url, sessionToken]
  )

  const fetchLists = useCallback(async () => {
    // setListStatus('loading')

    try {
      const result = await axios.get(
        `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/me/lists`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )

      const fetchedLists = result.data?.data

      if (!fetchedLists) {
        throw new Error('Lists not found')
      }

      setLists(fetchedLists)
      // setListStatus('complete')
    } catch (err: any) {
      console.log(err)
      // setListStatus('error')
    }
  }, [sessionToken])

  // useEffect(() => {
  //   console.log('fetching lists')
  //   fetchLists()
  // }, [fetchLists])

  // const fetchPageLists = useCallback(async () => {
  //   setPageListStatus('loading')
  //   if (!!sessionToken) {
  //     try {
  //       const result = await axios.get(
  //         `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/me/pages/${page?.id}/lists`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${sessionToken}`,
  //           },
  //         }
  //       )

  //       const fetchedLists = result.data?.data

  //       if (!fetchedLists) {
  //         throw new Error('Lists not found')
  //       }

  //       setPageLists(fetchedLists)
  //       setPageListStatus('complete')
  //     } catch (err: any) {
  //       console.log(err)
  //       setPageListStatus('error')
  //     }
  //   }
  // }, [sessionToken, page?.id])

  // useEffect(() => {
  //   if (status === 'complete' && page?.id) {
  //     console.log('fetching page lists')
  //     fetchPageLists()
  //   }
  // }, [fetchPageLists, page?.id, status])

  // fetch page on load
  useEffect(() => {
    if (status === 'idle' && !page && !!url && !!sessionToken) {
      // console.log('fetching first')
      if (prohibited === false && isArticle === true) {
        fetchDataAndSetPage(true)
        fetchLists()
      }
    }
  }, [
    fetchDataAndSetPage,
    fetchLists,
    page,
    status,
    url,
    prohibited,
    isArticle,
    sessionToken,
  ])

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

  // fetch page every 1 seconds if analysis is pending
  useEffect(() => {
    if (analysisStatus === 'pending' && !!url) {
      intervalIdRef.current = setInterval(fetchDataAndSetPage, 1000)
    }
    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [analysisStatus, fetchDataAndSetPage, url])

  // console.log('status', status)
  // console.log('url', url)

  if (prohibited === true) {
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography>Unable to analyze this page</Typography>
      </Box>
    )
  }

  if (isArticle === false) {
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography>This doesn't look like an article</Typography>
        {/* <Button variant="contained" onClick={analyze}>
          Analyze Anyway
        </Button> */}
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
      >
        <Typography width="100%" textAlign="center">
          Error loading page
        </Typography>
        <Button onClick={logout}>Log Out</Button>
      </Box>
    )
  }

  if (!page) {
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
  }

  return (
    <ViewPage
      page={page}
      lists={lists}
      pageLists={pageLists}
      onUpdateLists={handleUpdateLists}
      analyze={analyze}
    />
  )
}

export default PageFrame
