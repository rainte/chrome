import githubMarkdownCss from 'github-markdown-css/github-markdown.css?raw'

export const DEFAULT_MARKDOWN = `# 欢迎使用 Markdown 转 HTML

- 支持 **粗体**、*斜体*
- 行内代码 \`const a = 1\`

\`\`\`ts
console.log(\`Hello\`);
\`\`\`

> 这是一段引用

| 功能 | 状态 |
|------|------|
| 实时预览 | ✅ |
| 下载 HTML | ✅ |
`

export const toHtml = (html: string) => `<!doctype html>
<html lang="zh-CN">
<head><meta charset="UTF-8" />
<title>Markdown 导出</title>
<style>
${githubMarkdownCss}
body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
}
@media (max-width: 767px) {
  body { padding: 15px; }
}
</style>
</head>
<body>
<article class="markdown-body">
${html}
</article>
</body>
</html>`
