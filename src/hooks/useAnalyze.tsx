import { useCallback, useContext } from 'react'
import axios from 'axios'
// import useSession from './useSession'
import useGetTab from './useGetTab'
import { SessionContext } from '../context/session-context'

const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''
const REACT_APP_API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || ''

const useAnalyze = () => {
  const { url, html } = useGetTab()
  const session = useContext(SessionContext)
  const { sessionToken } = session || { sessionToken: null }
  // const { sessionToken } = useSession()

  const analyze = useCallback(async () => {
    const result = await axios.post(
      `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/me/pages`,
      [{ url: url, html: html }],
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    )

    const analyzedPages = result.data?.data
    const analyzedPage = analyzedPages?.[0]

    if (!analyzedPage) {
      throw new Error('Page not found')
    }

    return analyzedPage
  }, [html, url, sessionToken])

  return { analyze }
}

export default useAnalyze
