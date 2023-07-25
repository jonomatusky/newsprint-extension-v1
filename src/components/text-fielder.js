import React from 'react'
import { TextField, Typography } from '@mui/material'

const TextFielder = ({ label, helpText, error, ...props }) => {
  return (
    <label>
      {!!label && (
        <Typography pb={1} variant="body2">
          {label}
        </Typography>
      )}
      {!!helpText && (
        <Typography variant="body2" fontSize="14px" mt={-0.5} pb={1}>
          <i>{helpText}</i>
        </Typography>
      )}
      <TextField
        fullWidth
        variant="outlined"
        autoComplete="off"
        // InputLabelProps={{
        //   shrink: true,
        // }}
        error={Boolean(error)}
        helperText={error ? error.message : null}
        {...props}
      />
    </label>
  )
}

export default TextFielder
