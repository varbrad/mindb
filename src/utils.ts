import { Document } from './document'

import { SortData } from './types/sortdata'

function nestedProperty(doc:Document, key:string):any {
  key = key.replace(/\[(\w+)\]/g, '.$1')
  key = key.replace(/^\./, '')
  let parts:string[] = key.split('.')
  let val:any = doc
  parts.forEach(k => {
    // Is k within val?
    if (!val.hasOwnProperty(k)) throw new Error(`Nested property '${key}' could not be resolved at '${k}' property.`)
    val = val[k]
  })
  return val
}

function sort (documents:Document[], sortData:SortData[]):void {
  documents.sort((a:Document, b:Document):number => {
    return comparisonFn(sortData, a, b)
  })
}

// This function is quite slow!
function comparisonFn (sortData:SortData[], a:Document, b:Document):number {
  const l = sortData.length
  for (let i = 0; i < l; ++i) {
    const sort = sortData[i]
    let _a
    let _b
    if (sort.nested) {
      _a = nestedProperty(a, sort.key)
      _b = nestedProperty(b, sort.key)
    } else {
      _a = a[sort.key]
      _b = b[sort.key]
    }
    if (_a !== _b) {
      return (_a > _b ? 1 : -1) * sort.order
    }
  }
  return 0
}

function quickSort (documents:Document[], sortData:SortData[]):void {
  quickSortFn(documents, 0, documents.length - 1, sortData)
}

function quickSortFn (docs:Document[], left:number, right:number, sortData:SortData[]):void {
  const iLeft = left
  const iRight = right
  let dir = true
  let pivot = right
  while ((left - right) < 0) {
    if (dir) {
      if (comparisonFn(sortData, docs[pivot], docs[left]) < 0) {
        arraySwap(docs, pivot, left)
        pivot = left
        right--
        dir = !dir
      } else {
        left++
      }
    } else {
      if (comparisonFn(sortData, docs[pivot], docs[right]) <= 0) {
        right--
      } else {
        arraySwap(docs, pivot, right)
        pivot = right
        left++
        dir = !dir
      }
    }
  }
  if (pivot - 1 > iLeft) quickSortFn(docs, iLeft, pivot - 1, sortData)
  if (pivot + 1 < iRight) quickSortFn(docs, pivot + 1, iRight, sortData)
}

function arraySwap (a:any[], i:number, j:number) {
  const t:any = a[i]
  a[i] = a[j]
  a[j] = t
}

export { nestedProperty, sort, quickSort }
