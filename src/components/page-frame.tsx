import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import ViewPage from './view-page'
import useAnalyze from '../hooks/useAnalyze'
import useSession from '../hooks/useSession'
import axios from 'axios'
import useGetTab from '../hooks/useGetTab'

const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''
const REACT_APP_API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || ''

function PageFrame() {
  const { analyze } = useAnalyze()
  const { url } = useGetTab()

  const [page, setPage] = useState<any>(null)
  const [status, setStatus] = useState<any>('idle')
  const [lists, setLists] = useState<any>(null)
  const [listStatus, setListStatus] = useState<any>('idle')
  const [pageLists, setPageLists] = useState<any>(null)
  const [pageListStatus, setPageListStatus] = useState<any>('idle')
  const analysisStatus = page?.analysis_status || null

  const { sessionToken } = useSession()

  const handleUpdateLists = async (listIds: Array<String>) => {
    console.log(listIds)

    try {
      await axios.patch(
        `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/me/pages/${page.id}/lists`,
        {
          list_ids: listIds,
        }
      )
    } catch (err) {
      console.log(err)
    }
  }

  const fetchDataAndSetPage = useCallback(
    async (analyzeIfNotFound = false) => {
      if (!!sessionToken) {
        console.log('fetching')
        try {
          const result = await axios.get(
            `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/pages?url=${url}`,
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
          setStatus('complete')
        } catch (err: any) {
          if (
            err.response &&
            err.response.status === 404 &&
            analyzeIfNotFound
          ) {
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
      }
    },
    [analyze, sessionToken, url]
  )

  const fetchLists = useCallback(async () => {
    setListStatus('loading')
    if (!!sessionToken) {
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
        setListStatus('complete')
      } catch (err: any) {
        console.log(err)
        setListStatus('error')
      }
    }
  }, [sessionToken])

  useEffect(() => {
    if (status === 'complete' && !!page) {
      console.log('fetching lists')
      fetchLists()
    }
  }, [fetchLists, status, page])

  const fetchPageLists = useCallback(async () => {
    setPageListStatus('loading')
    if (!!sessionToken) {
      try {
        const result = await axios.get(
          `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/me/pages/${page?.id}/lists`,
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

        setPageLists(fetchedLists)
        setPageListStatus('complete')
      } catch (err: any) {
        console.log(err)
        setPageListStatus('error')
      }
    }
  }, [sessionToken, page?.id])

  useEffect(() => {
    if (status === 'complete' && page?.id) {
      console.log('fetching page lists')
      fetchPageLists()
    }
  }, [fetchPageLists, page?.id, status])

  // fetch page on load
  useEffect(() => {
    if (status !== 'loading' && !page && !!url) {
      console.log('fetching first')
      fetchDataAndSetPage(true)
    }
  }, [fetchDataAndSetPage, fetchLists, page, status, url])

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

  console.log('status', status)
  console.log('url', url)

  if (status === 'error') {
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography>Error loading page</Typography>
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
    <Box p={2.5}>
      <ViewPage
        page={page}
        lists={lists}
        pageLists={pageLists}
        onUpdateLists={handleUpdateLists}
      />
      {analysisStatus === 'pending' ? (
        <>
          <CircularProgress />
          <Typography textAlign="center">Analyzing...</Typography>
        </>
      ) : (
        <>
          <Button variant="contained" onClick={analyze}>
            Try Again
          </Button>
        </>
      )}
    </Box>
  )
}

export default PageFrame
