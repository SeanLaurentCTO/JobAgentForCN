import { FormEvent, ReactNode, useEffect, useState } from 'react'
import { fetchSubmissions, submitUrl, Submission } from './api'

type IconName =
  | 'briefcase'
  | 'link'
  | 'paste'
  | 'sparkles'
  | 'arrow'
  | 'check'
  | 'clock'
  | 'external'
  | 'building'

const icons: Record<IconName, ReactNode> = {
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
      <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
    </>
  ),
  paste: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M9 9h6M9 13h6" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.15 3.1L16 7.5l-2.85 1.4L12 12l-1.15-3.1L8 7.5l2.85-1.4L12 3Z" />
      <path d="m5 13 .8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13ZM19 12l.6 1.4L21 14l-1.4.6L19 16l-.6-1.4L17 14l1.4-.6L19 12Z" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5l8-3 8 3v16M8 8h2m4 0h2M8 12h2m4 0h2M8 16h2m4 0h2M2 21h20" />
    </>
  ),
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {icons[name]}
    </svg>
  )
}

const tones = ['blue', 'violet', 'red']

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function getHost(value: string) {
  try {
    return new URL(value).hostname
  } catch {
    return value
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function App() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [items, setItems] = useState<Submission[]>([])
  const [listError, setListError] = useState('')

  const loadSubmissions = async () => {
    try {
      const data = await fetchSubmissions()
      setItems(data.items)
      setListError('')
    } catch (err) {
      setListError(err instanceof Error ? err.message : '加载失败')
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const pasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text.trim())
      setError('')
    } catch {
      setError('无法读取剪贴板，请手动粘贴链接')
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const value = url.trim()
    if (!isHttpUrl(value)) {
      setError('请输入完整有效的岗位链接')
      return
    }

    setError('')
    setSubmitted(false)
    setIsLoading(true)
    try {
      await submitUrl(value)
      setUrl('')
      setSubmitted(true)
      await loadSubmissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="briefcase" size={18} />
          </span>
          <span className="brand-name">JobFlow</span>
          <span className="brand-divider" />
          <span className="brand-product">岗位收藏助手</span>
        </div>
        <div className="topbar-actions">
          <span className="sync-status">
            <span className="status-dot" />
            已同步
          </span>
          <button className="avatar" aria-label="打开个人菜单" type="button">
            L
          </button>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <span className="eyebrow">
            <Icon name="sparkles" size={15} />
            智能岗位整理
          </span>
          <h1>收集心仪岗位，<em>让机会井然有序</em></h1>
          <p className="hero-copy">
            粘贴任意招聘网站的岗位链接，我们会自动提取职位、公司、薪资等关键信息。
          </p>
        </section>

        <section className="collector-card" aria-labelledby="collector-title">
          <div className="card-heading">
            <span className="heading-icon">
              <Icon name="link" size={22} />
            </span>
            <div>
              <h2 id="collector-title">添加岗位链接</h2>
              <p>支持主流招聘网站与企业招聘官网</p>
            </div>
          </div>

          <form onSubmit={submit}>
            <label htmlFor="job-url">岗位链接</label>
            <div className={`url-input ${error ? 'has-error' : ''}`}>
              <Icon name="link" size={19} />
              <input
                id="job-url"
                onChange={(event) => {
                  setUrl(event.target.value)
                  setError('')
                  setSubmitted(false)
                }}
                placeholder="粘贴岗位链接，例如 https://www.example.com/jobs/..."
                type="url"
                value={url}
              />
              <button className="paste-button" onClick={pasteLink} type="button">
                <Icon name="paste" size={16} />
                粘贴
              </button>
            </div>
            <div className="form-foot">
              <span className={`helper ${error ? 'error-text' : ''}`}>
                {error || '链接仅用于提取岗位信息，我们不会公开分享'}
              </span>
              <button className="submit-button" disabled={isLoading} type="submit">
                {isLoading ? '正在提交…' : '解析并收藏'}
                {!isLoading && <Icon name="arrow" size={17} />}
              </button>
            </div>
          </form>

          {submitted && (
            <div className="success-panel" role="status">
              <span className="success-icon">
                <Icon name="check" size={18} />
              </span>
              <div>
                <strong>链接已收到</strong>
                <p>已添加到最近提交，等待解析。</p>
              </div>
            </div>
          )}
        </section>

        <section className="recent-section">
          <div className="section-heading">
            <div>
              <h2>最近提交</h2>
              <p>你最近收集的岗位，共 {items.length} 条</p>
            </div>
          </div>

          {listError && <p className="list-error">{listError}</p>}

          {items.length === 0 && !listError ? (
            <div className="empty-state">还没有提交过链接，粘贴第一个试试吧</div>
          ) : (
            <div className="job-list">
              {items.map((item, index) => {
                const host = getHost(item.url)
                return (
                  <article className="job-row" key={item.id}>
                    <span className={`company-logo ${tones[index % tones.length]}`}>
                      {host.charAt(0).toUpperCase()}
                    </span>
                    <div className="job-main">
                      <div className="job-title-row">
                        <h3 title={item.url}>{item.url}</h3>
                      </div>
                      <div className="job-meta">
                        <span>
                          <Icon name="building" size={14} />
                          {host}
                        </span>
                      </div>
                    </div>
                    <div className="job-side">
                      <span className={`status-badge ${item.status}`}>{item.status_text}</span>
                      <span className="time">
                        <Icon name="clock" size={13} />
                        {formatTime(item.created_at)}
                      </span>
                    </div>
                    <button
                      className="open-button"
                      aria-label="打开岗位链接"
                      onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                      type="button"
                    >
                      <Icon name="external" size={17} />
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <footer>
        <span>JobFlow · 让每个机会都被认真对待</span>
        <span>数据仅保存在你的账户中</span>
      </footer>
    </div>
  )
}
