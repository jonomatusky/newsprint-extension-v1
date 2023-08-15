import React from 'react'
import { Box, Card, Typography } from '@mui/material'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const renderer = new marked.Renderer()

// Override the default link renderer to open links in a new tab
renderer.link = function (href, title, text) {
  return `<a target="_blank" rel="noopener noreferrer" href="${href}">${text}</a>`
}

const CardBrief = ({ analysis }) => {
  marked.setOptions({
    renderer: renderer,
    // Add other options if necessary
  })

  const MarkdownRenderer = ({ markdown, ...props }) => {
    const createMarkup = rawMarkdown => {
      const rawHtml = marked(rawMarkdown)
      const sanitizedHtml = DOMPurify.sanitize(rawHtml)
      return { __html: sanitizedHtml }
    }

    return (
      <Typography
        component="div"
        variant="body2"
        dangerouslySetInnerHTML={createMarkup(markdown)}
        {...props}
      />
    )
  }

  return (
    <Card key={analysis.id} sx={{ marginBottom: 1 }}>
      <Box p={2} pt={0} pb={0}>
        <MarkdownRenderer markdown={analysis.text.trim()} />
      </Box>
    </Card>
  )
}

export default CardBrief
