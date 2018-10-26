declare module 'react-library/lib/AutoSizeComponent' {
  class AutoSizeComponent extends React.Component<{
    /** True to inject width */
    injectWidth?: boolean
    /** True to inject height */
    injectHeight?: boolean
    children: (size: { width?: number, height?: number }) => React.ReactElement<any>
  }> {}

  export default AutoSizeComponent
}

declare module 'react-library/lib/FillDownwardComponent' {
  class FillDownwardComponent extends React.Component<{}> {}

  export default FillDownwardComponent
}

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

declare module 'react-library/lib/ActionCancelModalComponent' {
  class ActionCancelModalComponent extends React.Component<{
    /** Title of modal */
    title?: React.ReactNode
    /** Action button. Defaults to "Save" */
    actionLabel?: React.ReactNode
    deleteLabel?: React.ReactNode
    onAction?: () => void
    onCancel?: () => void
    onDelete?: () => void
    size?: "large" | "full"
  }> {}

  export default ActionCancelModalComponent
}

declare module 'react-library/lib/bootstrap' {
  import { ReactNode, Children } from "react";

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
