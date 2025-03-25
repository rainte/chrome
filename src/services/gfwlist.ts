export type gfwlistToPACProps = {
  url?: string // GFWList 地址.
  data?: string // GFWList 数据.
  proxy: string // 代理, 如 'SOCKS5 127.0.0.1:1080'.
  rules?: {
    rule: string
    proxy: string
  }[] // 自定义规则.
}

export const gfwlistToPAC = async (props: gfwlistToPACProps) => {
  const { url, data, proxy, rules: customRules = [] } = props

  const rules = []
  if (url || data) {
    // 1. 获取规则.
    const gfwlist = data ? data : await fetchAndDecodeGFWList(url!)
    // 2. 解析规则.
    const gfwlistRules = gfwlist
      .split('\n')
      .filter((line) => line && !line.startsWith('!') && !line.startsWith('['))
      .map((line) => textToRule(line, proxy))
    rules.push(...gfwlistRules)
  }

  // 3. 添加自定义规则.
  if (customRules) {
    rules.unshift(...customRules.map((item) => textToRule(item.rule, item.proxy)))
  }
  // 4. 生成 PAC 文件.
  return toPac(rules, proxy)
}

const fetchAndDecodeGFWList = async (url: string) => {
  try {
    return fetch(url)
      .then((res) => res.text())
      .then((res) => atob(res))
  } catch (error) {
    console.error('获取 GFWList 失败.', error)
    throw new Error('获取 GFWList 失败.')
  }
}

const textToRule = (rule: string, proxy: string) => {
  rule.startsWith('@@') && (proxy = 'DIRECT')

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

const toPac = (rules: any[], proxy: string) => {
  // 去重.
  const domains = [...new Set(rules.filter((item) => item.mode == 'domain'))]
  const urls = [...new Set(rules.filter((item) => item.mode == 'url'))]
  const regexs = [...new Set(rules.filter((item) => item.mode == 'regex'))]
  const cidrs = [...new Set(rules.filter((item) => item.mode == 'cidr'))]
  console.log('toPac', domains, urls, regexs, cidrs)

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
      if (item.rule.startsWith('.')) {
        item.rule = '*' + item.rule
      }
      const pattern = item.rule.replace(/\\./g, '\\\.')
                                .replace(/\\*/g, '.*')
                                .replace(/\\?/g, '.')
      const regex = new RegExp(\`^\${pattern}$\`, 'i')
      if (regex.test(host)) {
        return \`"\${item.proxy}"\`;
      }
    }
  `
}

const matchUrls = () => {
  return `
    for (const item of urls) {
      if (url.startsWith(item.rule)) {
        return \`"\${item.proxy}"\`;
      }
    }
  `
}

const matchRegexes = () => {
  return `
    for (const item of regexes) {
      const regex = new RegExp(item.rule);
      if (regex.test(url)) {
        return \`"\${item.proxy}"\`;
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
      if (matchCIDR(item.rule)) {
        return \`"\${item.proxy}"\`;
      }
    }
  `
}
