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

  const mentions = page?.mentions || []

  const getMentionsForPageEntity = pageEntity => {
    if (!pageEntity) return []

    const filteredMentions =
      mentions.filter(m => m.entity_id === pageEntity?.entity.id) || []

    return filteredMentions
  }

  for (const pageEntity of pageEntities) {
    const mentions = getMentionsForPageEntity(pageEntity)
    const quotes = page.quotes?.filter(
      quote => quote.entity_id === pageEntity.entity.id
    )
    pageEntity.mentions = mentions
    pageEntity.quotes = quotes
  }

  const page_authors = page.authors || []

  return (
    <>
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
