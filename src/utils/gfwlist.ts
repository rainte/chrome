export type GfwlistToPACProps = {
  data?: string // GFWList 数据.
  proxy?: string // 代理, 如 'PROXY 127.0.0.1:1080'.
  defaultProxy?: string // 默认代理, 如 'DIRECT'.
  rules?: {
    rule: string
    proxy: string
  }[] // 自定义规则.
}

const toPacFile = (input: string) => {
  let cleaned = input
    .replace(/^"|"$/g, '')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')

  const blob = new Blob([cleaned], { type: 'application/x-ns-proxy-autoconfig' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'proxy.pac'
  link.click()
  URL.revokeObjectURL(link.href)
}

export const toPacRule = async (props: GfwlistToPACProps) => {
  const {
    data,
    proxy = 'PROXY 127.0.0.1:1080',
    defaultProxy = 'DIRECT',
    rules: customRules = []
  } = props

  const rules = []
  if (data) {
    const gfwlistRules = data
      .split('\n')
      .filter((line) => line && !line.startsWith('!') && !line.startsWith('['))
      .map((line) => textToRule(line, proxy))
    rules.push(...gfwlistRules)
  }

  if (customRules) {
    rules.unshift(...customRules.map((item) => textToRule(item.rule, item.proxy)))
  }

  return toPacText(rules, defaultProxy)
}

const textToRule = (rule: string, proxy: string) => {
  if (rule.startsWith('@@')) {
    proxy = 'DIRECT'
    rule = rule.substring(2)
  }

  if (rule.startsWith('||')) {
    return { mode: 'domain', rule: rule.substring(2), proxy }
  } else if (rule.startsWith('|')) {
    return { mode: 'url', rule: rule.substring(1), proxy }
  } else if (rule.startsWith('/')) {
    return { mode: 'regex', rule: rule.slice(1, -1), proxy }
  } else if (isCIDR(rule)) {
    return { mode: 'cidr', rule: rule, proxy }
  } else {
    return { mode: 'domain', rule, proxy }
  }
}

const isCIDR = (rule: string) => {
  return (
    /^[\d*]{1,3}(\.[\d*]{1,3}){0,3}(\/\d{1,2})?$/.test(rule) ||
    /^\[?[0-9a-f:*]+\]?(\/\d{1,3})?$/i.test(rule)
  )
}

const toPacText = (rules: any[], proxy: string) => {
  // 去重.
  const domains = [...new Set(rules.filter((item) => item.mode == 'domain'))]
  const urls = [...new Set(rules.filter((item) => item.mode == 'url'))]
  const regexs = [...new Set(rules.filter((item) => item.mode == 'regex'))]
  const cidrs = [...new Set(rules.filter((item) => item.mode == 'cidr'))]

  // 生成 PAC 模板.
  return `
    function FindProxyForURL(url, host) {
      console.log('FindProxyForURL', url, host)

      const domains = ${JSON.stringify(domains)};
      ${matchDomain()}

      const urls = ${JSON.stringify(urls)};
      ${matchUrls()}

      const regexes = ${JSON.stringify(regexs)};
      ${matchRegexes()}

      const cidrs = ${JSON.stringify(cidrs)};
      ${matchCIDR()}

      return "${proxy}";
    }
  `
}

const matchDomain = () => {
  return `
    for (const item of domains) {
      if (item.rule.includes(host)) {
        console.log('domain', item)
      }

      if (item.rule.startsWith('.')) {
        item.rule = '*' + item.rule
      }

      const pattern = item.rule.replace(/\\./g, '\\\.')
                                .replace(/\\*/g, '.*')
                                .replace(/\\?/g, '.')
      const regex = new RegExp(\`^\${pattern}$\`, 'i')
      if (regex.test(host)) {
        return \`\${item.proxy}\`;
      }
    }
  `
}

const matchUrls = () => {
  return `
    for (const item of urls) {
      if (item.rule.includes(host)) {
        console.log('url', item)
      }

      if (url.startsWith(item.rule)) {
        return \`\${item.proxy}\`;
      }
    }
  `
}

const matchRegexes = () => {
  return `
    for (const item of regexes) {
      if (item.rule.includes(host)) {
        console.log('regexe', item)
      }

      const regex = new RegExp(item.rule);
      if (regex.test(url)) {
        return \`\${item.proxy}\`;
      }
    }
  `
}

const matchCIDR = () => {
  return `
    function matchCIDR(cidr) {
      const ip = dnsResolve(host)
      if (!ip) return false

      if (cidr.includes('/')) {
        return isIPInRange(ip, cidr)
      }

      const cidrParts = cidr.split('.')
      const ipParts = ip.split('.')

      if (cidrParts.length !== 4 || ipParts.length !== 4) {
        return false
      }

      for (let i = 0; i < 4; i++) {
        if (cidrParts[i] !== '*' && cidrParts[i] !== ipParts[i]) {
          return false
        }
      }

      return true
    }

    function isIPInRange(ip, cidr) {
      const [range, bits] = cidr.split('/')
      const mask = ~(0xffffffff >>> parseInt(bits, 10))

      const ipLong = ipToLong(ip)
      const rangeLong = ipToLong(range)

      return (ipLong & mask) === (rangeLong & mask)
    }

    function ipToLong(ip) {
      return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0)
    }

    for (const item of cidrs) {
      if (item.rule.includes(host)) {
        console.log('cidr', item)
      }

      if (matchCIDR(item.rule)) {
        return \`\${item.proxy}\`;
      }
    }
  `
}

export default {
  toPacFile,
  toPacRule
}
