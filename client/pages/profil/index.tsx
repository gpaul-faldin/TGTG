import React from 'react'
import { decodeJwt } from '@/components/utils/token'
import Router from 'next/router'
import { useEffect } from 'react'

export default function profil() {

  useEffect(() => {
    if (!decodeJwt()) {
      Router.push('/login')
    }
  }
  , []);

  return (
    <div>profil</div>
  )
}
