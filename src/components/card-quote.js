import React from 'react'
import { Box, Card, Typography } from '@mui/material'

const CardQuote = ({ quote, author, org, onShare }) => {
  return (
    <Card elevation={0} sx={{ bgcolor: 'background.paperLight' }}>
      <Card elevation={0}>
        <Box p={3} pb={!!author || !!org ? 2 : 3} pt={3}>
          <Typography
            sx={{ whiteSpace: 'pre-line' }}
            whiteSpace="pre-line"
            variant="body2"
          >
            {`"${quote}"`}
          </Typography>
        </Box>
      </Card>
      {(!!author || !!org) && (
        <Box sx={{ p: 3, pb: 2, pt: 1.5 }}>
          <Typography
            sx={{ whiteSpace: 'pre-line' }}
            whiteSpace="pre-line"
            variant="body2"
            color="text.secondary"
          >
            <b>{author}</b>
            {/* { (!!author && !!org) && (<br /> org) } */}
          </Typography>
        </Box>
      )}
    </Card>
  )
}

export default CardQuote
