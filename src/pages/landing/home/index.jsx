import { useEffect } from 'react'
import { ScrollTrigger } from 'helpers/gsap'
import chapters from 'helpers/chapters'
import useHead from 'hooks/useHead'
import Hero from './hero'
import About from './about'
import Work from './work'
import Stack from './stack'
import Lab from './lab'
import Contact from './contact'

export default function Home() {
  useHead({})

  // children create their pins first (layout effects, top → bottom); then measure everything once
  useEffect(() => {
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
    return () => chapters.reset()
  }, [])

  return (
    <main>
      <Hero />
      <About />
      <Work />
      <Stack />
      <Lab />
      <Contact />
    </main>
  )
}
