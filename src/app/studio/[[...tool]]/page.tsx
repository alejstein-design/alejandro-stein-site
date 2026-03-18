'use client'

/**
 * Sanity Studio embedded at /studio
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID to be set in .env.local
 */
import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
