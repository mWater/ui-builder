declare module 'react-library/lib/bootstrap' {
  import { ReactNode } from "react";

  class TextInput extends React.Component<{
    value: string
    onChange?: (value: string | null) => void
    placeholder?: string
    size?: "sm" | "lg"
    emptyNull?: boolean
    style: object
  }> {}

  class NumberInput extends React.Component<{
    decimal: boolean,
    value?: number | null
    onChange?: (value: number | null) => void
    style?: object
    size?: "sm" | "lg"
    onTab?: () => void
    onEnter?: () => void
    /** Force an exact number of decimal places, rounding value as necessary */
    decimalPlaces?: number
    placeholder?: string  
  }> {}

  class Select<T> extends React.Component<{
    value: T | null,
    onChange?: (value: T | null) => void,
    options: Array<{ value: T | null, label: string }>,
    /** "lg" or "sm" */
    size?: string
    nullLabel?: string
    style?: object
    inline?: boolean
  }> {}

  class Toggle<T> extends React.Component<{
    value: T | null
    onChange?: (value: T | null) => void,
    options: Array<{ value: T | null, label: ReactNode }>,
    /** "xs" or "sm" */
    size?: string
    allowReset?: boolean
  }> {}
}
