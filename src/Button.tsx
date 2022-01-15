import React from 'react'

type Props = {
  onClick(): void
  label: string
}

function Button(props: Props): JSX.Element {
  return (
    <button onClick={props.onClick}>
      { props.label }
    </button>
  )
}

export default Button
