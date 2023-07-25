import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Autocompleter from './autocompleter'

const ListSelector = ({ lists = [], pageLists = [], onUpdate }) => {
  let pageListIds = pageLists.map(list => list.id)
  const [value, setValue] = useState(pageListIds)

  const handleChange = async newValue => {
    setValue(newValue)
    !!onUpdate && onUpdate(newValue)
  }

  // useEffect(() => {
  //   if (pageListIds !== value) {
  //     setValue(pageListIds)
  //   }
  // }, [pageListIds])

  return (
    <Autocompleter
      placeholder="Add to list"
      multi
      value={value}
      options={lists}
      getOptionLabel={option => option.name}
      onChange={handleChange}
      // loading={loading}
      size="small"
      disablePortal
    />
  )
}

export default ListSelector
