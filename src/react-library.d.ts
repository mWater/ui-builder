
declare module 'react-library/lib/ModalPopupComponent' {
  class ModalPopupComponent extends React.Component<{
    header?: React.ReactNode
    footer?: React.ReactNode
    size?: "large" | "full"
    showCloseX?: boolean
    onClose: () => void
  }> {}

  export default ModalPopupComponent
}

declare module 'react-library/lib/bootstrap' {
  import { ReactNode } from "react";

  class TextInput extends React.Component<{
    value: string | null
    onChange?: (value: string | null) => void
    placeholder?: string
    size?: "sm" | "lg"
    emptyNull?: boolean
    style?: object
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

  class Checkbox extends React.Component<{
    value: boolean
    onChange?: (value: boolean) => void
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
