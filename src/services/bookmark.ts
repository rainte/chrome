import request from '@/utils/request'

export default {
  getGistBookmark: (gistId: string) => {
    return request.get(`/gists/${gistId}`).then((res) => {
      console.log('res', res)
    })
    // let resp = await axios.get(`/gists/${setting.gistID}`)
    // if (resp && resp.data) {
    //     let filenames = Object.keys(resp.data.files);
    //     if (filenames.indexOf(setting.gistFileName) !== -1) {
    //         let gistFile = resp.data.files[setting.gistFileName]
    //         if (gistFile.truncated) {
    //             return axios.get(gistFile.raw_url, { responseType: 'blob' }).then(resp => resp.data.text())
    //         } else {
    //             return gistFile.content
    //         }
    //     }
    // }
  }
}
