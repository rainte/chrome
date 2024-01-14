export default {
  open: (url?: string | URL, target?: string, features?: string) => {
    target = target || '_blank'
    window.open(url, target, features)
  }
}
