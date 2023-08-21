/* global chrome */

import { useEffect, useState, useContext } from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import ViewPage from './view-page'
import axios from 'axios'
// import useGetTab from '../hooks/useGetTab'
import { SessionContext } from '../context/session-context'
import usePage from '../hooks/usePage'

const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''
const REACT_APP_API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || ''

function PageFrame() {
  const { page } = usePage()

  const session = useContext(SessionContext)
  const { logout, sessionToken } = session || {
    logout: () => {},
    sessionToken: null,
  }
  // const { url, isArticle, prohibited } = useGetTab()

  // console.log(url)
  // console.log(isArticle)
  // console.log(prohibited)

  // const [status, setStatus] = useState('idle')
  // const [lists, setLists] = useState(null)
  // const [listStatus, setListStatus] = useState<any>('idle')
  // const [pageLists, setPageLists] = useState<any>(null)
  // const [pageListStatus, setPageListStatus] = useState<any>('idle')
  // const analysisStatus = page?.analysis_status || null

  let pageListPages = page?.lists || []

  console.log(pageListPages)

  let pageLists = pageListPages.map(pageListPage => {
    return pageListPage.list
  })

  useEffect(() => {
    let urlToOpen = REACT_APP_APP_URL

    if (urlToOpen) {
      let rootDomain = new URL(urlToOpen).hostname.split(':')[0] // Get domain without port

      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        var domainExists = tabs.some(tab => {
          if (tab.url) {
            return (
              new URL(tab.url).hostname.split(':')[0] === rootDomain &&
              tab.url !== REACT_APP_APP_URL + '/ext-auth/success'
            )
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

  const handleUpdateLists = async listIds => {
    const listIdsToRemove = pageLists
      .filter(list => !listIds.includes(list.id))
      .map(list => list.id)
    const listIdsToAdd = listIds.filter(
      listId => !pageLists.map(list => list.id).includes(listId)
    )

    try {
      for (const listId of listIdsToRemove) {
        console.log('removing')
        console.log(listId)
        await axios.delete(
          `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/api/lists/${listId}/pages/${page.id}`,
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        )
      }

      for (const listId of listIdsToAdd) {
        console.log('adding')
        console.log(listId)
        await axios.post(
          `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/api/lists/${listId}/pages`,
          [page.id],
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        )
      }
    } catch (err) {
      console.log(err)
    }
  }

  // const fetchLists = useCallback(async () => {
  //   // setListStatus('loading')

  //   try {
  //     const result = await axios.get(
  //       `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/me/lists`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${sessionToken}`,
  //         },
  //       }
  //     )

  //     const fetchedLists = result.data?.data

  //     if (!fetchedLists) {
  //       throw new Error('Lists not found')
  //     }

  //     setLists(fetchedLists)
  //     // setListStatus('complete')
  //   } catch (err) {
  //     console.log(err)
  //     // setListStatus('error')
  //   }
  // }, [sessionToken])

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
  // useEffect(() => {
  //   if (status === 'idle' && !page && !!url && !!sessionToken) {
  //     // console.log('fetching first')
  //     if (prohibited === false && isArticle === true) {
  //       fetchDataAndSetPage(true)
  //       fetchLists()
  //     }
  //   }
  // }, [
  //   fetchDataAndSetPage,
  //   fetchLists,
  //   page,
  //   status,
  //   sessionToken,
  // ])

  // console.log('status', status)
  // console.log('url', url)

  // if (prohibited === true) {
  //   return (
  //     <Box
  //       height="100vh"
  //       width="100vw"
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //     >
  //       <Typography>Unable to analyze this page</Typography>
  //     </Box>
  //   )
  // }

  // if (isArticle === false) {
  //   return (
  //     <Box
  //       height="100vh"
  //       width="100vw"
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //     >
  //       <Typography>This doesn't look like an article</Typography>
  //       {/* <Button variant="contained" onClick={analyze}>
  //         Analyze Anyway
  //       </Button> */}
  //     </Box>
  //   )
  // }

  // if (status === 'error') {
  //   return (
  //     <Box
  //       height="100vh"
  //       width="100vw"
  //       display="flex"
  //       flexWrap="wrap"
  //       justifyContent="center"
  //       alignItems="center"
  //     >
  //       <Box textAlign="center">
  //         <Typography width="100%" textAlign="center">
  //           Error loading page
  //         </Typography>
  //         <Button onClick={logout}>Log Out</Button>
  //       </Box>
  //     </Box>
  //   )
  // }

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
    <Box p={2}>
      <ViewPage
        page={page}
        // lists={lists}
        // pageListPages={pageListPages}
        onUpdateLists={handleUpdateLists}
      />
    </Box>
  )
}

export default PageFrame
