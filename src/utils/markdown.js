import { marked } from 'marked'

marked.setOptions({
  breaks: true,       // 换行转 <br>
  gfm: true,          // GitHub Flavored Markdown
})

/**
 * 将 Markdown 文本渲染为安全的 HTML
 * @param {string} text - 原始 Markdown 文本
 * @returns {string} 渲染后的 HTML
 */
export function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}
