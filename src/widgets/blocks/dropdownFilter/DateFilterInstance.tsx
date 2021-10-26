import React, { CSSProperties } from "react"
import ReactSelect from "react-select"

/** Simple date filter that is year, month or year-month */
export const DateFilterInstance = (props: {
  mode: "year" | "yearmonth" | "month"
  value: any
  onChange: (value: any) => void
  placeholder: string
  locale: string
}) => {
  let options: { value: string; label: string }[] = []

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ]

  if (props.mode == "month") {
    options = months
  } else if (props.mode == "year") {
    const year = new Date().getFullYear()
    for (let y = year; y >= year - 10; y--) {
      options.push({ value: `${y}-01-01`, label: `${y}` })
    }
  } else if (props.mode == "yearmonth") {
    const year = new Date().getFullYear()
    for (let y = year; y >= year - 10; y--) {
      for (let m = y == year ? new Date().getMonth() : 11; m >= 0; m--) {
        options.push({ value: `${y}-${months[m].value}-01`, label: `${months[m].label} ${y}` })
      }
    }
  }

  const styles = {
    // control: (style: CSSProperties) => ({ ...style, minWidth: minWidth }),
    menuPortal: (style: CSSProperties) => ({ ...style, zIndex: 2000 })
  }

  const handleChange = (ev: { value: string; label: string } | null) => props.onChange(ev ? ev.value : null)

  // Find option
  const option = options.find((opt) => opt.value == props.value)

  return (
    <ReactSelect
      value={option}
      onChange={handleChange}
      options={options}
      placeholder={props.placeholder}
      isClearable={true}
      styles={styles}
      closeMenuOnScroll={true}
      menuPortalTarget={document.body}
      classNamePrefix="react-select-short"
    />
  )
}
