import { storage } from '@/utils/browser'

export const DOMAIN = 'rainte'

export type RainteProps = {
  githubToken?: string
}

export default {
  get: () => storage.cloud.get(DOMAIN),
  set: (data: RainteProps) => storage.cloud.set(DOMAIN, data)
}
