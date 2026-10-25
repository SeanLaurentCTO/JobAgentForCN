export type SubmissionStatus = 'pending' | 'done' | 'failed'

export type Submission = {
  id: number
  url: string
  status: SubmissionStatus
  status_text: string
  created_at: string
}

export type SubmitResponse = {
  id: number
  status: SubmissionStatus
  message: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new Error('无法连接服务器，请确认后端已启动')
  }

  const data: { detail?: string } = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error('服务器暂不可用，请确认后端已启动')
    }
    throw new Error(data.detail || '请求失败，请稍后重试')
  }
  return data as T
}

export function submitUrl(url: string) {
  return request<SubmitResponse>('/api/submit', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

export function fetchSubmissions(limit = 20) {
  return request<{ items: Submission[] }>(`/api/submissions?limit=${limit}`)
}
