import React from 'react'
import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import PanelSummary from './panel-summary'
import Entities from './entities'
import CardQuote from './card-quote'
import HighlightCard from './highlight-card'
import ListSelector from './list-selector'

const ViewPage = ({
  page = {},
  lists = null,
  pageLists = null,
  isLoading = false,
  isError = false,
  entities = [],
  onUpdateLists,
}) => {
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

  const pageEntities = page.entities || []

  const organzations =
    pageEntities.filter(
      pageEntity => pageEntity.entity?.type === 'organization'
    ) || []

  const people =
    pageEntities.filter(pageEntity => pageEntity.entity?.type === 'person') ||
    []

  const getPageEntityFromId = id => {
    return pageEntities.find(pageEntity => pageEntity.entity.id === id)
  }

  const quotes = page.quotes?.sort((a, b) => a.index > b.index)

  const orderedEntities = organzations.concat(people)

  const highlightedEntities = orderedEntities.filter(orderedEntity => {
    return entities.find(entity => entity.id === orderedEntity.entity.id)
  })

  return (
    <>
      <Grid container spacing={2}>
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
        {!!page && lists && pageLists && (
          <Grid item xs={12}>
            <ListSelector
              page={page}
              lists={lists}
              pageLists={pageLists}
              onUpdate={onUpdateLists}
            />
          </Grid>
        )}
        {page.summary && (
          <Grid item xs={12}>
            <PanelSummary summary={page.summary} />
          </Grid>
        )}
        {highlightedEntities &&
          highlightedEntities.length > 0 &&
          highlightedEntities.map((entity, index) => (
            <Grid item xs={12} key={'hi-' + entity.id}>
              <HighlightCard
                pageEntity={entity}
                mentions={page.mentions}
                quotes={quotes}
              />
            </Grid>
          ))}

        {quotes && quotes.length > 0 && (
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
        )}
        {organzations && organzations.length > 0 && (
          <Grid item xs={12}>
            <Typography gutterBottom>Companies</Typography>
            <Entities pageEntities={organzations} mentions={page.mentions} />
          </Grid>
        )}
        {people && people.length > 0 && (
          <Grid item xs={12}>
            <Typography gutterBottom>People</Typography>
            <Entities pageEntities={people} mentions={page.mentions} />
          </Grid>
        )}
        <Grid item xs={12}>
          <Box height={32} />
        </Grid>
        {/* <Grid item xs={12}>
            {page.url && (
              <Link target="_blank" href={page.url}>
                <Typography variant="subtitle2">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>{page.url}</span>
                    <OpenInNew fontSize="inherit" sx={{ ml: 0.25 }} />
                  </div>
                </Typography>
              </Link>
            )}
          </Grid> */}
      </Grid>
    </>
  )
}

export default ViewPage
