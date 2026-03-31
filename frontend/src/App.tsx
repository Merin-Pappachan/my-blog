import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import medusaImg from './assets/medusa.jfif'

type Post = {
  title: string
  slug: string
  content: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

function MedusaHero() {
  return (
    <div className="medusa-hero" aria-hidden="true">
      <img className="medusa-img" src={medusaImg} alt="" />
    </div>
  )
}

async function fetchPosts() {
  const response = await fetch(`${API_BASE_URL}/posts`)
  if (!response.ok) {
    throw new Error('Failed to load posts')
  }
  return (await response.json()) as Post[]
}

async function fetchPostBySlug(slug: string) {
  const response = await fetch(`${API_BASE_URL}/posts/${slug}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error('Failed to load this post')
  }
  return (await response.json()) as Post
}

function PostListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchPosts()
      .then((items) => {
        if (!cancelled) {
          setPosts(items)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="page">
      <MedusaHero />
      <header className="page-header">
        <h1>Blogs</h1>
        <p>Pick a post.</p>
      </header>

      {loading && <p>Loading posts...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && posts.length === 0 && <p>No posts available yet.</p>}

      <section className="posts">
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.slug} className="post-list-item">
              <Link to={`/posts/${post.slug}`} className="post-link">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

function PostDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('Invalid blog link')
      setLoading(false)
      return
    }

    let cancelled = false

    fetchPostBySlug(slug)
      .then((item) => {
        if (!cancelled) {
          setPost(item)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <main className="page">
      <Link to="/" className="back-link">
        Back to blogs
      </Link>

      {loading && <p>Loading blog...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && !post && <p>Blog not found.</p>}

      {post && (
        <article className="post-detail">
          <h1>{post.title}</h1>
          <div className="post-content">{post.content}</div>
        </article>
      )}
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PostListPage />} />
        <Route path="/posts/:slug" element={<PostDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
