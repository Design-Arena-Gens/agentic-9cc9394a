'use client'

import dynamic from 'next/dynamic'

const EarthScene = dynamic(() => import('./EarthScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff',
      fontSize: '24px'
    }}>
      Loading Earth...
    </div>
  )
})

export default function Home() {
  return <EarthScene />
}
