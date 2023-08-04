import { useState } from 'react'
import {
  Box,
  Chip,
  Grid,
  Typography,
  // Divider,
  // Button,
  Card,
  // CardActionArea,
} from '@mui/material'
import {
  Business,
  // KeyboardArrowDown,
  // KeyboardArrowUp,
  Person,
} from '@mui/icons-material'

const MentionCard = ({ pageEntity: entity }) => {
  // const [expandedId, setExpandedId] = useState(null)
  const [showMore, setShowMore] = useState(false)

  // const handleExpandEntity = id => {
  //   setExpandedId(expandedId === id ? null : id)
  // }

  let mentions = entity?.mentions || []

  // const headline = mentions[0]?.excerpt_begin_offset === 0

  const getProminence = pageEntity => {
    const salience = pageEntity?.salience
    // filter into high medium and low
    if (salience > 0.75 || mentions.length > 8) {
      return 'Subject'
    } else if (salience > 0.35 || mentions.length > 4) {
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

  const quotes = entity?.quotes || []

  return (
    <Card elevation={0} onClick={() => setShowMore(!showMore)}>
      {/* <CardActionArea onClick={() => setShowMore(!showMore)} disableRipple> */}
      <Box pl={2} pr={1} pb={2} pt={1.5}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box display="flex">
              <Box flexGrow={1}>
                <Box display="flex" flexWrap="wrap">
                  {entity?.entity?.type === 'organization' ? (
                    <Business
                      color="primary"
                      sx={{ pr: 1 }}
                      fontSize="medium"
                    />
                  ) : (
                    <Person color="primary" sx={{ pr: 1 }} fontSize="medium" />
                  )}
                  <Typography color="primary" flexGrow={1} gutterBottom>
                    <b>{entity?.entity.name}</b>
                  </Typography>
                </Box>
                <Box display="flex" flexWrap="wrap">
                  <Chip
                    label={placement}
                    color={placement === 'Headline' ? 'primary' : 'default'}
                    size="small"
                    // sx={{ ml: 0.5 }}
                  />
                  <Chip
                    label={prominence}
                    color={prominence === 'Subject' ? 'primary' : 'default'}
                    size="small"
                    sx={{ ml: 0.5 }}
                  />
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
                    sx={{ ml: 0.5 }}
                  />
                  {quotes && quotes.length > 0 && (
                    <Chip
                      label="Quoted"
                      color="primary"
                      size="small"
                      sx={{ ml: 0.5 }}
                    />
                  )}
                  {/* <Chip
                    label={
                      mentions.length +
                      ' mention' +
                      (mentions.length > 1 ? 's' : '')
                    }
                    color={mentions.length >= 4 ? 'primary' : 'default'}
                    size="small"
                    sx={{ ml: 0.5 }}
                  /> */}
                  {/* <Box mt={0.5} flexGrow={1}>
                    <Typography variant="body2" textAlign="right">
                      <b>{mentions.length}</b> mention
                      {mentions.length > 1 && 's'}
                    </Typography>
                  </Box> */}
                </Box>
              </Box>
              <Box flexGrow={0}>
                {/* <Box mt={0.5}>
                  <Typography variant="body2" textAlign="center">
                    <b>{mentions.length}</b> time{mentions.length > 1 && 's'}
                  </Typography>
                </Box> */}
                {/* <Box>
                  <Button
                    label={mentions.length}
                    endIcon={
                      showMore ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                    }
                    // onDelete={() => setShowMore(!showMore)}
                    onClick={() => setShowMore(!showMore)}
                    size="small"
                  >
                    {showMore ? 'Hide' : 'Show'}
                  </Button>
                </Box> */}
              </Box>
            </Box>
          </Grid>
          {quotes &&
            quotes.length > 0 &&
            quotes.map(quote => (
              <Grid item xs={12} key={quote.id}>
                <Card elevation={0} sx={{ bgcolor: 'background.paperLight' }}>
                  <Box p={2}>
                    <Typography variant="body2">
                      <i>{`"${quote.quote}"`}</i>
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          {/* {showMore &&
            mentions.map(mention => (
              <Grid item xs={12} key={mention.id}>
                <Card elevation={0} sx={{ bgcolor: 'background.paperLight' }}>
                  <Box p={2}>
                    <Typography variant="body2">
                      <i>{mention.excerpt}</i>
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))} */}
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
      {/* </CardActionArea> */}
    </Card>
  )
}

export default MentionCard
