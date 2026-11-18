import { useEffect } from 'react'
import head from 'helpers/head'

/** Sets title/description for a page while it is mounted. */
export default function useHead({ title, description } = {}) {
  useEffect(() => {
    head({ title, description })
  }, [title, description])
}
