import { useState } from 'react'
import {
  Box,
  Chip,
  Grid,
  Typography,
  Divider,
  Button,
  Card,
} from '@mui/material'
import {
  Business,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Person,
} from '@mui/icons-material'

const HighlightCard = ({
  pageEntity: entity,
  mentions: allMentions,
  quotes: allQuotes,
}) => {
  // const [expandedId, setExpandedId] = useState(null)
  const [showMore, setShowMore] = useState(false)

  // const handleExpandEntity = id => {
  //   setExpandedId(expandedId === id ? null : id)
  // }

  const getMentionsForPageEntity = pageEntity => {
    const filteredMentions =
      allMentions.filter(m => m.entity_id === pageEntity?.entity.id) || []

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

  const getQuotesForPageEntity = pageEntity => {
    return allQuotes.filter(quote => quote.entity_id === entity?.entity_id)
  }

  const quotes = getQuotesForPageEntity(entity)

  const mentions = getMentionsForPageEntity(entity)

  // const headline = mentions[0]?.excerpt_begin_offset === 0

  const getProminence = pageEntity => {
    const salience = pageEntity?.salience
    // filter into high medium and low
    if (salience > 0.65 || mentions.length > 10) {
      return 'Subject'
    } else if (salience > 0.35 || mentions.length > 5) {
      return 'Key Mention'
    } else {
      return 'Minor Mention'
    }
  }

  const prominence = getProminence(entity)

  const getPlacement = pageEntity => {
    if (mentions[0]?.begin_offset === 0) {
      return 'Headline'
    } else if (mentions[0]?.begin_offset < 300) {
      return 'Lead'
    } else {
      return 'Body'
    }
  }
  const placement = getPlacement(entity)

  const getSentiment = pageEntity => {
    if (entity?.sentiment >= 0.5) {
      return 'Positive'
    } else if (entity?.sentiment <= -0.5) {
      return 'Negative'
    } else {
      return 'Neutral'
    }
  }

  const sentiment = getSentiment(entity)

  console.log(quotes)

  return (
    <Card elevation={0}>
      <Box pl={3} pr={3} pb={3} pt={3}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              {entity?.entity?.type === 'organization' ? (
                <Business color="primary" sx={{ pr: 1 }} fontSize="medium" />
              ) : (
                <Person color="primary" sx={{ pr: 1 }} fontSize="medium" />
              )}

              <Typography color="primary">
                <b>{entity?.entity.name}</b>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box
                pr={1}
                display="flex"
                justifyContent="center"
                textAlign="center"
              >
                <Typography variant="body2">
                  Placement:
                  <span>
                    <Chip
                      label={placement}
                      color={placement === 'Headline' ? 'primary' : 'default'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </span>
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box
                pr={1}
                pl={1}
                display="flex"
                justifyContent="center"
                textAlign="center"
              >
                <Typography variant="body2">
                  Prominence:
                  <span>
                    <Chip
                      label={prominence}
                      color={prominence === 'Subject' ? 'primary' : 'default'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </span>
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box
                pr={1}
                pl={1}
                display="flex"
                justifyContent="center"
                textAlign="center"
              >
                <Typography variant="body2">
                  Sentiment:
                  <span>
                    <Chip
                      label={sentiment}
                      color={
                        sentiment === 'Positive'
                          ? 'primary'
                          : sentiment === 'Negative'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </span>
                </Typography>
              </Box>
              {/* <Divider orientation="vertical" flexItem />
            <Box
              pl={1}
              display="flex"
              justifyContent="center"
              textAlign="center"
            >
              <Typography variant="body2">
                Mentions:
                <span>
                  <Chip
                    label={mentions.length}
                    deleteIcon={
                      showMore ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                    }
                    onDelete={() => setShowMore(!showMore)}
                    onClick={() => setShowMore(!showMore)}
                    size="small"
                  >
                    {showMore ? 'Hide' : 'View'}
                  </Chip>
                </span>
              </Typography>
            </Box> */}
            </Box>
          </Grid>
          {quotes.length > 0 &&
            quotes.map(quote => (
              <Grid item xs={12}>
                <Card elevation={0} sx={{ bgcolor: 'background.paperLight' }}>
                  <Box p={2}>
                    <Typography variant="body2">
                      <i>"{quote.quote}"</i>
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          <Grid item xs={12}>
            <Typography variant="body2">
              Mentioned <b>{mentions.length}</b> times
              <span>
                <Button
                  label={mentions.length}
                  endIcon={
                    showMore ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                  }
                  onDelete={() => setShowMore(!showMore)}
                  onClick={() => setShowMore(!showMore)}
                  size="small"
                >
                  {showMore ? 'Hide' : 'View All'}
                </Button>
              </span>
            </Typography>
          </Grid>
          {showMore &&
            mentions.map((mention, index) => (
              <Grid item xs={12} key={index}>
                <Typography variant="body2">
                  <i>{mention.excerpt}</i>
                </Typography>
              </Grid>
            ))}
          {/* <Grid item xs={12}>
          <Button
            endIcon={showMore ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            onClick={() => setShowMore(!showMore)}
            size="small"
          >
            {showMore ? 'Hide Mention' : 'View Mentions'}
          </Button>
        </Grid> */}
        </Grid>
      </Box>
    </Card>
  )
}

export default HighlightCard
