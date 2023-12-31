import { useState } from 'react'
import Autocompleter from './autocompleter'

const ListSelector = ({ lists = [], pageLists = [], onUpdate }) => {
  let pageListIds = pageLists.map(list => list.list_id)
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
      disableClearable
      disabled={!lists || lists?.length === 0}
    />
  )
}

export default ListSelector
