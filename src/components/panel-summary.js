import React from 'react'
import { Card, Typography, List, ListItem, Box } from '@mui/material'

const PanelSummary = ({ title, description, summary, url, onShare }) => {
  const summaryForBullets = '\n' + summary

  const summaryPoints = summaryForBullets.split('\n- ').filter(Boolean)

  // const summaryHtmlString = `<div><p><b>${title}</b></p>
  // ${!!description && `<p><i>${description}</i></p>`}
  // ${
  //   summaryPoints &&
  //   summaryPoints.length > 0 &&
  //   `<ul>
  // ${(summaryPoints || []).map(point => `<li>${point}</li>`).join('')}
  // </ul>`
  // }
  // ${!!url && `<p><a href="${url}">Link</a></p>`}
  // </div>`

  // const summaryText = `${title}
  // ${!!description && description}

  // ${(summaryPoints || []).map(point => point + '\n').join('')}
  // ${url}`

  return (
    // <ShareWrapper
    //   text={summaryText}
    //   html={summaryHtmlString}
    //   onShare={() => onShare({ text: summaryPoints, textType: 'summary' })}
    // >
    <Card>
      <Box p={3.5} pl={4} pt={3} pb={2.5}>
        {!!summaryPoints && (
          <List sx={{ listStyleType: 'disc', pl: 1, pt: 0, pb: 0 }}>
            {(summaryPoints || []).map((point, index) => (
              <ListItem
                key={'org-sum-' + index}
                sx={{
                  display: 'list-item',
                  pt: 0,
                  pb: 1,
                  pl: 0,
                  pr: 0,
                }}
              >
                <Typography variant="body2">{point}</Typography>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Card>
    // </ShareWrapper>
  )
}

export default PanelSummary
