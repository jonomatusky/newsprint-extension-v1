import React, { useState } from 'react'
import { Box, Chip, CircularProgress, Grid, Typography } from '@mui/material'
import ListSelector from './list-selector'
import Chat from './chat'
import CardBrief from './card-brief'
import { OpenInNew } from '@mui/icons-material'

const ViewPage = ({
  page = {},
  lists = null,
  pageListPages = null,
  isLoading = false,
  isError = false,
  onUpdateLists,
}) => {
  const [open, setOpen] = useState(false)

  const pageLists = pageListPages?.map(listPage => listPage.list)

  console.log(pageLists)

  // show 10 entities, util user clicks show more
  const showMore = 10

  const [showMoreEntities, setShowMoreEntities] = useState(showMore)

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
      const aQuotes = a.quotes?.length || 0
      const bQuotes = b.quotes?.length || 0

      // Compare by number of quotes first
      if (aQuotes !== bQuotes) {
        return bQuotes - aQuotes
      }

      // Compare whether one is above or below 0.60
      if (aConfidence >= 0.6 !== bConfidence >= 0.6) {
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

  const page_authors = page.authors || []

  return (
    <>
      {/* <Chat /> */}
      <Grid container spacing={2}>
        {!!page && lists && pageLists && (
          <Grid item xs={12}>
            <ListSelector
              page={page}
              lists={lists}
              pageLists={pageLists.filter(pageList => !!pageList.name)}
              onUpdate={onUpdateLists}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          {/* <Box
          overflow="scroll"
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        > */}
          {!!page.title && (
            <Typography gutterBottom>
              <b>{page.title}</b>
            </Typography>
          )}
          {(!!page.publisher_name || !!page.author_name) && (
            <Typography variant="body2">
              <i>
                {[page.publisher_name, page.author_name]
                  .filter(Boolean)
                  .join(' | ')}
              </i>
            </Typography>
          )}
        </Grid>
        {page_authors && page_authors.length > 0 && (
          <Grid item xs={12}>
            <Box display="flex" flexWrap="wrap">
              <Chip
                color="primary"
                to={`/outlets/${page.channel?.id}`}
                key={page.channel?.id}
                label={page.channel?.name || 'Test'}
                sx={{ mr: 0.5, mb: 0.5 }}
                onDelete={() => {}}
                deleteIcon={<OpenInNew fontSize="small" />}
              />
              {page_authors.map((page_author, index) => (
                <Chip
                  to={`/authors/${page_author.entity.id}`}
                  key={page_author.id}
                  label={page_author?.entity.name}
                  sx={{ mr: 0.5, mb: 0.5 }}
                  onDelete={() => {}}
                  deleteIcon={<OpenInNew fontSize="small" />}
                />
              ))}
            </Box>
          </Grid>
        )}
        {pageListPages &&
          pageListPages.map(
            pageList =>
              pageList.analyses &&
              pageList.analyses.map(analysis => (
                <Grid item xs={12} key={analysis.id}>
                  <Typography variant="body2" ml={1} gutterBottom>
                    <b>{pageList.list.name}</b>
                  </Typography>
                  <CardBrief analysis={analysis} />
                </Grid>
              ))
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
    </>
  )
}

export default ViewPage
