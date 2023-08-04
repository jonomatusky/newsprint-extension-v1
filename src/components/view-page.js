/* global chrome */

import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListItem,
  Skeleton,
  Typography,
} from '@mui/material'
import PanelSummary from './panel-summary'
import CardQuote from './card-quote'
import ListSelector from './list-selector'
import Chat from './chat'
import MentionCard from './mention-card'
import { Check, OpenInNew } from '@mui/icons-material'

const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''

const ViewPage = ({
  page = {},
  lists = null,
  pageLists = null,
  isLoading = false,
  isError = false,
  entities = [],
  onUpdateLists,
  analyze,
  logout = null,
}) => {
  const [open, setOpen] = useState(false)

  // show 10 entities, util user clicks show more
  const showMore = 10

  const [showMoreEntities, setShowMoreEntities] = useState(showMore)

  if (isError) return <div>failed to load</div>

  let pageEntities = []

  if (page.entities) {
    pageEntities = page.entities.filter(
      pageEntity =>
        pageEntity?.entity?.name !== page.author_name &&
        pageEntity?.entity?.name !== page.publisher_name
    )
  }

  const getPageEntityFromId = id => {
    return pageEntities.find(pageEntity => pageEntity.entity.id === id)
  }

  const quotes = page.quotes?.sort((a, b) => a.index > b.index)

  // const orderedEntities = organzations.concat(people)

  const mentions = page?.mentions || []

  const getMentionsForPageEntity = pageEntity => {
    if (!pageEntity) return []

    const filteredMentions =
      mentions.filter(m => m.entity_id === pageEntity?.entity.id) || []

    return filteredMentions

    // let seen = new Set()

    // return filteredMentions.filter(m => {
    //   const key = `${m.excerpt_begin_offset}-${m.excerpt_end_offset}`

    //   if (seen.has(key)) {
    //     return false
    //   } else {
    //     seen.add(key)
    //     return true
    //   }
    // })
  }

  for (const pageEntity of pageEntities) {
    const mentions = getMentionsForPageEntity(pageEntity)
    const quotes = page.quotes?.filter(
      quote => quote.entity_id === pageEntity.entity.id
    )
    pageEntity.mentions = mentions
    pageEntity.quotes = quotes
  }

  const orderedEntities = pageEntities
    .filter(
      pageEntity =>
        pageEntity.entity.type === 'person' ||
        pageEntity.entity.type === 'organization'
    )
    .sort((a, b) => {
      const aConfidence = a.confidence || 0
      const bConfidence = b.confidence || 0
      const aMentions = a.mentions?.length || 0
      const bMentions = b.mentions?.length || 0

      const aHighConfidence = aConfidence >= 0.6
      const bHighConfidence = bConfidence >= 0.6

      // Compare whether one is above or below 0.60
      if (aHighConfidence !== bHighConfidence) {
        return aConfidence >= 0.6 ? -1 : 1
      }

      // If the confidence levels are on the same side of 0.60, then sort by mentions
      if (aMentions !== bMentions) {
        return bMentions - aMentions
      }

      // If mentions are equal, sort by confidence
      return bConfidence - aConfidence
    })

  const handleShowMore = () => {
    setShowMoreEntities(!!showMoreEntities ? null : showMore)
  }

  if (isLoading || !page)
    return (
      <Box
        textAlign="center"
        justifyContent="center"
        display="flex"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
      </Box>
    )

  const backendUrl = REACT_APP_APP_URL + '?a=' + encodeURIComponent(page.url)

  const handleOpenInNew = () => {
    chrome.tabs.create({ url: backendUrl })
  }

  return (
    <Box p={2.5} height="600px" overflow={open ? 'hidden' : 'scroll'}>
      <Grid container spacing={1.5}>
        <Grid item xs={12}>
          <Card>
            <Box p={2.5} pt={1} pb={2}>
              <Box display="flex">
                <Box flexGrow={1} display="flex" alignItems="center">
                  <Check color="primary" sx={{ mr: 0.5 }} />
                  <Typography>
                    <b>Saved to Newsprint</b>
                  </Typography>
                </Box>
                {page.url && (
                  <Box alignItems="center" mr={-1}>
                    <IconButton onClick={handleOpenInNew}>
                      <OpenInNew />
                    </IconButton>
                  </Box>
                )}
                {/* {logout && (
                  <Box alignItems="center" mr={-1}>
                    <IconButton onClick={logout}>
                      <Logout />
                    </IconButton>
                  </Box>
                )} */}
              </Box>
              <ListSelector
                page={page}
                lists={lists}
                pageLists={pageLists}
                onUpdate={onUpdateLists}
              />
            </Box>
          </Card>
        </Grid>
        {/* {!!page.title && (
          <Grid item xs={12}>
            <Card>
              <Box p={2.5} pt={2} pb={2}>
                <Typography gutterBottom>
                  <b>{page.title}</b>
                </Typography>
                {(!!page.publisher_name || !!page.author_name) && (
                  <Typography variant="body2">
                    <i>
                      {[page.publisher_name, page.author_name]
                        .filter(Boolean)
                        .join(' | ')}
                    </i>
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        )} */}
        {page.summary ? (
          <Grid item xs={12}>
            <PanelSummary summary={page.summary} />
          </Grid>
        ) : page.analysis_status === 'pending' ? (
          <Grid item xs={12}>
            <Card>
              <Box p={3.5} pl={4} pt={3} pb={2.5}>
                <List sx={{ listStyleType: 'disc', pl: 1, pt: 0, pb: 0 }}>
                  <ListItem
                    sx={{
                      display: 'list-item',
                      pt: 0,
                      pb: 1,
                      pl: 0,
                      pr: 0,
                    }}
                  >
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </ListItem>
                  <ListItem
                    sx={{
                      display: 'list-item',
                      pt: 0,
                      pb: 1,
                      pl: 0,
                      pr: 0,
                    }}
                  >
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </ListItem>
                  <ListItem
                    sx={{
                      display: 'list-item',
                      pt: 0,
                      pb: 1,
                      pl: 0,
                      pr: 0,
                    }}
                  >
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </ListItem>
                </List>
              </Box>
            </Card>
          </Grid>
        ) : (
          <></>
        )}
        {/* {quotes && quotes.length > 0 ? (
          <>
            <Grid item xs={12} container spacing={1}>
              <Grid item xs={12}>
                <Typography>Quotes</Typography>
              </Grid>
              {quotes.map((quote, index) => (
                <Grid item xs={12} key={quote.id}>
                  <CardQuote
                    quote={quote.quote}
                    author={getPageEntityFromId(quote.entity_id)?.entity?.name}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        ) : page.analysis_status === 'pending' ? (
          <Grid item xs={12}>
            <Card>
              <Box p={3.5} pl={4} pt={3} pb={2.5}>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </Box>
            </Card>
          </Grid>
        ) : (
          <></>
        )} */}
        {orderedEntities && orderedEntities.length > 0 ? (
          <Grid item xs={12} container spacing={1}>
            <Grid item xs={12}>
              <Typography>Mentions</Typography>
            </Grid>
            {orderedEntities
              .slice(0, showMoreEntities || orderedEntities.length)
              .map(entity => (
                <Grid item xs={12}>
                  <MentionCard pageEntity={entity} />
                </Grid>
              ))}
            {!!showMoreEntities && orderedEntities.length > showMore && (
              <Grid item xs={12}>
                <Button onClick={handleShowMore}>Show More</Button>
              </Grid>
            )}
          </Grid>
        ) : page.analysis_status === 'pending' ? (
          <Grid item xs={12}>
            <Card>
              <Box p={3.5} pl={4} pt={3} pb={2.5}>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </Box>
            </Card>
          </Grid>
        ) : (
          <></>
        )}
        {page.analysis_status.startsWith('failed') && (
          <Grid item xs={12}>
            <Card>
              <Box
                p={3.5}
                pl={4}
                pt={3}
                pb={2.5}
                display="flex"
                flexWrap="wrap"
                justifyContent="center"
              >
                <Box width="100%">
                  <Typography gutterBottom textAlign="center">
                    <b>Analysis Failed</b>
                  </Typography>
                </Box>
                <Button variant="contained" onClick={analyze}>
                  Try Again
                </Button>
              </Box>
            </Card>
          </Grid>
        )}
        <Grid item xs={12}>
          <Box height={open ? 640 : 100} />
        </Grid>
      </Grid>
      <Box
        sx={{
          width: { xs: '400px', lg: '600px' },
        }}
        position="fixed"
        bottom={0}
        right={0}
        display="flex"
        width="100%"
        zIndex="100"
        borderLeft={1}
        borderTop={1}
        borderColor="divider"
        bgcolor="background.default"
      >
        <Chat pageId={page.id} open={open} setOpen={setOpen} />
      </Box>
    </Box>
  )
}

export default ViewPage
