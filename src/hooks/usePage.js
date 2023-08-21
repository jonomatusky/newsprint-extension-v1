/* global chrome */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

function getPageFromStorage(id) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([id], result => {
      if (chrome.runtime.lastError) {
        // If there's an error (e.g., permission issues), reject the promise
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        // If the result is found, resolve with the page, otherwise resolve with null
        resolve(result[id] || null)
      }
    })
  })
}

const fetchPage = async () => {
  const response = await chrome.runtime.sendMessage({
    action: 'fetchPage',
  })

  const page = response?.page

  return page
}

const usePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const id = searchParams.get('page_id')

  console.log(id)

  const [page, setPage] = useState()

  console.log(page)

  const checkStatus = async () => {
    const p = fetchPage()

    if (!!p && p.analysis_status !== 'pending') {
      setPage(p)
    }
  }

  useEffect(() => {
    if (page.analysis_status === 'pending') {
      const intervalId = setInterval(() => {
        checkStatus()
      }, 1000)

      return () => clearInterval(intervalId)
    }
  }, [page.analysis_status])

  useEffect(() => {
    const getPage = async () => {
      try {
        let page = await getPageFromStorage(id)

        if (page) {
          console.log(page)
          setPage(page)
        }
      } catch (err) {
        console.log(err)
      }
    }

    if (id) {
      getPage()
    }
  }, [id])

  return { page }
}

export default usePage
