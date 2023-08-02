import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Fab,
  IconButton,
  TextField,
  Collapse,
  Grid,
  Paper,
  Typography,
  Skeleton,
  Tooltip,
} from '@mui/material'
import {
  Close,
  DeleteSweepOutlined,
  KeyboardArrowDown,
  Message,
  Send,
  Speed,
} from '@mui/icons-material'
import axios from 'axios'
import { SessionContext } from '../context/session-context'

const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''

const Chat = ({ pageId, open, setOpen }) => {
  const [chat, setChat] = useState({})
  const [message, setMessage] = useState('')

  const { sessionToken } = useContext(SessionContext)

  let messages = chat.messages || []
  let messagesLength = messages.length || 0
  let status = chat.status || 'idle'

  const bottomRef = useRef()

  useEffect(() => {
    setOpen(false)
  }, [pageId, setOpen])

  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_APP_URL}/api/pages/${pageId}/chats`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )

      let c = response.data?.chat || []

      setChat(c)
    } catch (err) {
      console.log(err)
    }
  }, [pageId, sessionToken])

  useEffect(() => {
    if (open && pageId) {
      fetchChatHistory()
    }
  }, [open, pageId, fetchChatHistory]) // Fetch chat history when the chat window is opened.

  useEffect(() => {
    let intervalId = null

    if (status === 'pending') {
      intervalId = setInterval(fetchChatHistory, 2000) // Then fetch every 1000ms
    }

    return () => {
      // Cleanup on unmount or status change.
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [status, fetchChatHistory])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const sendMessage = async () => {
    let m = message
    let c = chat

    setMessage('')
    setChat({
      ...chat,
      status: 'pending',
      messages: [...messages, { content: message, role: 'user' }],
    })

    try {
      if (message.trim() === '') return // Don't send empty messages

      await axios.post(
        `${REACT_APP_APP_URL}/api/pages/${pageId}/chats/messages`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )
    } catch (err) {
      setMessage(m)
      setChat(c)
      console.log(err)
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()

    try {
      sendMessage()
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messagesLength, open])

  const handleCancel = async () => {
    try {
      setChat({
        ...chat,
        status: 'active',
      })
      await axios.patch(
        `${REACT_APP_APP_URL}/api/pages/${pageId}/chats`,
        {
          status: 'active',
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

  let speedValue = chat.speed || 'fast'

  const handleChangeSpeed = async speed => {
    setChat({
      ...chat,
      speed,
    })

    try {
      await axios.patch(
        `${REACT_APP_APP_URL}/api/pages/${pageId}/chats`,
        {
          speed,
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

  const clearChatHistory = async () => {
    try {
      setChat({})

      await axios.patch(
        `${REACT_APP_APP_URL}/api/pages/${pageId}/chats`,
        {
          status: 'closed',
        },
        {
          Authorization: `Bearer ${sessionToken}`,
        }
      )
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      <Box
        maxHeight="600px"
        display="flex"
        flexDirection="column"
        bgcolor="background.default"
        width="100%"
        p="16px"
        pt="0px"
      >
        <Collapse in={open} sx={{ width: '100%' }}>
          <Box
            display="flex"
            justifyContent="flex-end"
            overflow={'auto'}
            width="100%"
            height="50px"
            pt="8px"
          >
            <Box flexGrow={1} display="flex" alignItems="center">
              <Typography>Chat about this page</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Paper sx={{ borderRadius: 6 }}>
                <Box display="flex" justifyContent="center" mr={0.25}>
                  <Box flexGrow={1}>
                    <Tooltip title="Slow and thoughtful">
                      <Button
                        sx={{
                          borderRadius: 6,
                          pl: '6pt',
                          pr: '6pt',
                          minWidth: 0,
                        }}
                        size="small"
                        fullWidth
                        variant={speedValue === 'slow' ? 'contained' : 'text'}
                        onClick={() => handleChangeSpeed('slow')}
                      >
                        <Speed sx={{ transform: 'scaleX(-1)' }} />
                      </Button>
                    </Tooltip>
                  </Box>
                  <Box flexGrow={1}>
                    <Tooltip title="Fast and capable">
                      <Button
                        sx={{
                          borderRadius: 6,
                          pl: '6pt',
                          pr: '6pt',
                          minWidth: 0,
                        }}
                        size="small"
                        fullWidth
                        variant={speedValue === 'fast' ? 'contained' : 'text'}
                        onClick={() => handleChangeSpeed('fast')}
                      >
                        <Speed />
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Box>
            {/* <ToggleButtonGroup
              value={speedValue}
              exclusive
              aria-label="text alignment"
              size="small"
            >
              <ToggleButton value="slow" aria-label="centered">
              
                <Speed sx={{ transform: 'scaleX(-1)' }} />
              </ToggleButton>
              <ToggleButton value="fast" aria-label="left aligned">
                <Speed />
              </ToggleButton>
            </ToggleButtonGroup> */}

            <Tooltip title="Clear chat history">
              <IconButton onClick={clearChatHistory}>
                <DeleteSweepOutlined />
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => setOpen(false)}>
              <KeyboardArrowDown />
            </IconButton>
          </Box>
          <Box
            flexGrow={1}
            overflow="scroll"
            style={{
              height: 'calc(600px - 50px - 56px - 16px - 16px)',
            }}
            backgroundColor="card.default"
          >
            {' '}
            {/* THIS ONE */}
            <Grid
              container
              spacing={1.5}
              // sx={{ maxHeight: 'calc(600px-72px-50px)' }}
            >
              {messages.map(({ id, content, role, status }) => (
                <Grid item xs={12} key={id}>
                  <Box
                    display="flex"
                    justifyContent={role === 'user' ? 'flex-end' : 'flex-start'}
                    pl={role === 'user' ? 4 : 1}
                    pr={role === 'user' ? 2 : 4}
                  >
                    <Paper
                      // elevation={2}
                      // variant="outlined"
                      sx={{
                        backgroundColor:
                          role === 'user'
                            ? 'card.background'
                            : 'background.paperLight',
                      }}
                    >
                      <Box p={1.5}>
                        <Typography variant="body2">{content}</Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Grid>
              ))}
              {status === 'pending' && (
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    justifyContent={'flex-start'}
                    pl={1}
                    pr={4}
                  >
                    <Paper
                      // elevation={2}
                      // variant="outlined"
                      sx={{
                        backgroundColor: 'background.paperLight',
                      }}
                    >
                      <Box p={1.5}>
                        <Skeleton
                          variant="text"
                          width="200px"
                          sx={{ pb: 0.5 }}
                        />
                        <Skeleton
                          variant="text"
                          width="200px"
                          sx={{ pb: 0.5 }}
                        />
                        <Skeleton variant="text" width="60px" />
                      </Box>
                    </Paper>
                    <Box display="flex" alignItems="center">
                      <IconButton onClick={handleCancel}>
                        <Close />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              )}
              <Box ref={bottomRef} />
            </Grid>
          </Box>
        </Collapse>
        <Box width="100%" pt="16px">
          <form onSubmit={handleSubmit}>
            <Box width="100%" display="flex">
              {/* <Box mr={0.5} display="flex" alignItems="center">
                  <IconButton>
                    <RestartAlt />
                  </IconButton>
                </Box> */}
              <Box flexGrow="1" mr={1}>
                <TextField
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  fullWidth
                  onFocus={handleClickOpen}
                />
              </Box>
              <Fab
                color="primary"
                aria-label="chat"
                onClick={handleSubmit}
                disabled={
                  !open ||
                  message.trim() === '' ||
                  !pageId ||
                  status === 'pending'
                }
              >
                {open ? <Send /> : <Message />}
              </Fab>
            </Box>
          </form>
        </Box>
      </Box>
    </>
  )
}

export default Chat
