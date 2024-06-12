import { gist, HubEnum } from '@/services/octokit'
import storage, { StoreEnum } from '@/utils/storage'
import notice from './notice'
import hash from '@/utils/hash'

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode
export type BookmarkProps = {
  tree: BookmarkTreeNode[]
}

export const sum = (nodes: BookmarkTreeNode[]) => {
  let count = 0
  nodes = nodes || []
  nodes.map((node) => (count += node.url ? 1 : sum(node.children || [])))
  return count
}

function compareJSONObjects(obj1:any, obj2:any, path = "root") {
  if (typeof obj1 !== typeof obj2) {
    console.log(
      `Different types at ${path}: ${typeof obj1} vs ${typeof obj2}`
    );
    return;
  }

  if (typeof obj1 === "object" && obj1 !== null && obj2 !== null) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      console.log(
        `Different number of keys at ${path}: ${keys1.length} vs ${keys2.length}`
      );
      return;
    }

    for (const key of keys1) {
      if (Array.isArray(obj1[key])) {
        compareJSONArrays(obj1[key], obj2[key], `${path}.${key}`);
      } else {
        compareJSONObjects(obj1[key], obj2[key], `${path}.${key}`);
      }
    }
  } else {
    if (obj1 !== obj2) {
      console.log(`Values differ at ${path}: ${obj1} vs ${obj2}`);
    }
  }
}

function compareJSONArrays(arr1:any, arr2:any, path = "root") {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    console.log(`Non-array input at ${path}`);
    return;
  }

  if (arr1.length !== arr2.length) {
    console.log(
      `Different lengths at ${path}: ${arr1.length} vs ${arr2.length}`
    );
    return;
  }

  for (let i = 0; i < arr1.length; i++) {
    const newPath = `${path}[${i}]`;
    if (typeof arr1[i] !== typeof arr2[i]) {
      console.log(
        `Different types at ${newPath}: ${typeof arr1[
          i
        ]} vs ${typeof arr2[i]}`
      );
    } else if (
      typeof arr1[i] === "object" &&
      arr1[i] !== null &&
      arr2[i] !== null
    ) {
      if (Array.isArray(arr1[i])) {
        compareJSONArrays(arr1[i], arr2[i], newPath);
      } else {
        compareJSONObjects(arr1[i], arr2[i], newPath);
      }
    } else {
      if (arr1[i] !== arr2[i]) {
        console.log(
          `Values differ at ${newPath}: ${arr1[i]} vs ${arr2[i]}`
        );
      }
    }
  }
}

const bookmark = {
  addLocalBookmark: async function (node: BookmarkTreeNode) {
    for (const item of node.children || []) {
      const res = await chrome.bookmarks.create({
        title: item.title,
        url: item.url,
        parentId: node.id
      })
      item.children && (await this.addLocalBookmark({ ...item, id: res.id }))
    }
  },
  getLocalBookmark: async () => {
    if (import.meta.env.DEV) return []

    return chrome.bookmarks
      .getTree()
      .then((nodes) => nodes[0].children)
      .then((nodes) => nodes || [])
  },
  clearLocalBookmark: async function () {
    const nodes = await this.getLocalBookmark()
    for (const node of nodes) {
      for (const item of node?.children || []) {
        await chrome.bookmarks.removeTree(item.id)
      }
    }
  },
  getCloudBookmark: () => gist.getJson<BookmarkProps>(HubEnum.Bookmark),
  setCloudBookmark: (data: BookmarkProps) => gist.setJson(HubEnum.Bookmark, data),
  total: function () {
    const res1 = this.getLocalBookmark().then(sum)
    const res2 = this.getCloudBookmark()
      .then((res) => res.tree)
      .then(sum)
    return Promise.all([res1, res2])
  },
  isChange: function () {
    const local = this.getLocalBookmark()
    const cloud = this.getCloudBookmark().then((res) => res.tree)
    return Promise.all([local, cloud]).then(([res1, res2]) => {
      compareJSONArrays(res1, res2);
      console.log('isChange', hash.SHA256(res1) !== hash.SHA256(res2), res1, res2)
      return hash.SHA256(res1) !== hash.SHA256(res2)
    })
  },
  warnNotice: function (...args: any[]) {
    bookmark.isChange().then((ok) => {
      if (ok) {
        storage.set(StoreEnum.Bookmark, args)
        chrome.action.setBadgeText({ text: '!' })
        chrome.action.setBadgeBackgroundColor({ color: 'red' })
      }
    })
  },
  clearNotice: () => notice.clear(),
  listener: function () {
    chrome.bookmarks.onCreated.addListener(this.warnNotice)
    chrome.bookmarks.onChanged.addListener(this.warnNotice)
    chrome.bookmarks.onRemoved.addListener(this.warnNotice)
    chrome.bookmarks.onMoved.addListener(this.warnNotice)
  }
}

export default bookmark
