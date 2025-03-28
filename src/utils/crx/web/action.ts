class Action {
  send(_: string = '!', __: string | chrome.action.ColorArray = 'red') {
    return () => () => {}
  }
  async clear() {}
}

export default new Action()
