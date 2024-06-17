/// <reference types="vite/client" />

import { ReactJsonViewProps as IReactJsonViewProps } from 'react-json-view'

declare module 'react-json-view' {
  export interface ReactJsonViewProps extends IReactJsonViewProps {
    displayArrayKey: boolean
  }
}
