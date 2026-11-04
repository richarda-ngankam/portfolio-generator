import { useParams } from 'react-router-dom'

export default function PublicPage() {
  const { slug } = useParams()
  return <main style={{ padding: 40 }}><h1>Page publique</h1><p className="muted">{slug}</p></main>
}