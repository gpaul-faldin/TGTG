import '@/styles/globals.css'
import NavBar from '../components/navbar'
import type { AppProps } from 'next/app'
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
       {/* Ajoutez la barre de navigation en haut de chaque page */}
      <Component {...pageProps} />
    </div>
  );
}
