import React, { useState } from 'react'
import { Box, Button, Card, Chip, Grid, Typography } from '@mui/material'
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material'

const entitiesBeforeMore = 10

export default function Entities({ pageEntities: entities, mentions }) {
  const [expandedId, setExpandedId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const handleExpandEntity = id => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getMentionsForPageEntity = pageEntity => {
    const filteredMentions =
      mentions.filter(m => m.entity_id === pageEntity.entity.id) || []

    let seen = new Set()

    return filteredMentions.filter(m => {
      const key = `${m.excerpt_begin_offset}-${m.excerpt_end_offset}`

      if (seen.has(key)) {
        return false
      } else {
        seen.add(key)
        return true
      }
    })
  }

  const getProminence = pageEntity => {
    const salience = pageEntity.salience
    // filter into high medium and low
    if (salience > 0.65) {
      return 'High'
    } else if (salience > 0.35) {
      return 'Medium'
    } else {
      return 'Low'
    }
  }

  const pageEntities = showAll
    ? entities
    : entities.slice(0, entitiesBeforeMore)

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Box display="flex" flexWrap="wrap">
          {pageEntities.map((pageEntity, index) => (
            <Box key={pageEntity.id}>
              <Chip
                // size="small"
                label={pageEntity.entity.name}
                color={pageEntity.id === expandedId ? 'primary' : 'default'}
                // icon={pageEntity/entity.summary ? <Star fontSize="small" /> : null}
                onClick={() => handleExpandEntity(pageEntity.id)}
                key={'chip-' + pageEntity.id}
                sx={{
                  mr: 0.5,
                  mb: 0.5,
                }}
              />
              {pageEntity.id === expandedId && (
                // box with full width and card witnin it
                <Box
                  display="flex"
                  flexDirection="column"
                  flexGrow={1}
                  width="100%"
                  pb={0.5}
                  key={'box-' + pageEntity.id}
                >
                  <Card>
                    <Box pr={2} pl={2} pt={2} pb={2.5}>
                      <Grid container spacing={1}>
                        {pageEntity.summary && (
                          <Grid item xs={12}>
                            <Typography variant="body2" gutterBottom>
                              {pageEntity.summary}
                            </Typography>
                          </Grid>
                        )}
                        {getMentionsForPageEntity(pageEntity).map(
                          (mention, index) => (
                            <Grid item xs={12} key={index}>
                              <Typography variant="body2">
                                <i>{mention.excerpt}</i>
                              </Typography>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>
                  </Card>
                </Box>
              )}
            </Box>
          ))}
          {entities?.length > entitiesBeforeMore && (
            <Button
              endIcon={showAll ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              onClick={() => setShowAll(!showAll)}
              size="small"
            >
              {showAll ? 'Less' : 'More'}
            </Button>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}
