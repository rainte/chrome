import { tabState } from '@/utils/storage'

export interface TabSettings {
  cover: string
}

export const loadTabSettings = () => tabState.getValue()

export const saveTabSettings = (state: TabSettings) => tabState.setValue(state)
