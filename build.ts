import fs from 'fs'
import path from 'path'

const copy = (from, to) => {
  fs.existsSync(to) || fs.mkdirSync(to)

  fs.readdirSync(from).forEach((file) => {
    const src = path.join(from, file)
    const dest = path.join(to, file)

    if (fs.lstatSync(src).isDirectory()) {
      copy(src, dest)
    } else {
      fs.copyFileSync(src, dest)
    }
  })
}

const del = (dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const cwd = path.join(dir, file)
      if (fs.lstatSync(cwd).isDirectory()) {
        del(cwd)
      } else {
        fs.unlinkSync(cwd)
      }
    })
    fs.rmdirSync(dir)
  }
}

fs.readdirSync('./crx').forEach((dir) => {
  const cwd = path.join('./crx', dir)
  if (fs.lstatSync(cwd).isDirectory()) {
    const from = path.resolve(process.cwd(), `.${dir}`)
    const to = path.resolve(process.cwd(), 'rainte')

    copy(from, to)
    del(from)
  }
})
