function FindProxyForURL(url, host) {
    // 通过域名判断
    if (dnsDomainIs(host, "example.com")) {
        return "PROXY proxy.example.com:8080";
    }

    // 通过正则表达式判断
    if (/.*\.google\.com$/.test(host)) {
        return "PROXY proxy.google.com:8080";
    }

    // 通过IP CIDR判断
    if (isInNet(host, "192.168.1.0", "255.255.255.0")) {
        return "PROXY proxy.local:8080";
    }

    // 默认直连
    return "DIRECT";
}