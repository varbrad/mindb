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

function sortDocuments (documents:Document[], sortData:SortData[], algorithm?:'native'|'quick'|'insertion'|'heap'):void {
  switch(algorithm) {
    case 'insertion': insertionSort(documents, sortData); return
    case 'heap': heapSort(documents, sortData); return
    case 'native': sort(documents, sortData); return
    case 'quick': quickSort(documents, sortData); return
    default: sort(documents, sortData); return
  }
}

function sort (documents:Document[], sortData:SortData[]):void {
  documents.sort(evalCompare(sortData))
}

// This function is quite slow!
function comparisonFn (sortData:SortData[]):((a:Document, b:Document) => number) {
  return function (a:Document, b:Document):number {
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
}

function evalCompare (sortData:SortData[]):((a:Document, b:Document) => number) {
  let str = ''
  sortData.forEach(sort => {
    str += `if(a.${sort.key}!==undefined&&b.${sort.key}===undefined)return ${sort.order === 1 ? '1' : '-1'};`
    str += `if(a.${sort.key}===undefined&&b.${sort.key}!==undefined)return ${sort.order === 1 ? '-1' : '1'};`
    str += `if(a.${sort.key}${sort.order === 1 ? '>' : '<'}b.${sort.key})return 1;`
    str += `if(a.${sort.key}${sort.order === 1 ? '<' : '>'}b.${sort.key})return -1;`
  })
  str += `return 0;`
  return <((a:Document, b:Document) => number)>Function('a', 'b', str)
}

function insertionSort (documents:Document[], sortData:SortData[]):void {
  const compare = evalCompare(sortData)
  for (let i = 1; i < documents.length; ++i) {
    let j = i
    while (j > 0 && compare(documents[j-1], documents[j]) > 0) {
      arraySwap(documents, j, j - 1)
      j--
    }
  }
}

function heapSort (documents:Document[], sortData:SortData[]):void {
  const compare = evalCompare(sortData)
  let len = documents.length
  for (let i = Math.floor(len * .5); i > -1; --i) heapify(documents, i, len, compare)
  for (let i = documents.length - 1; i > 0; --i) {
    arraySwap(documents, 0, i)
    len--
    heapify(documents, 0, len, compare)
  }
}

function heapify (documents:Document[], i:number, len:number, compare:((a:Document, b:Document) => number)):void {
  const l = 2 * i + 1
  const r = 2 * i + 2
  let largest = i

  if (l < len && compare(documents[l], documents[largest]) > 0) largest = l
  if (r < len && compare(documents[r], documents[largest]) > 0) largest = r
  if (largest !== i) {
    arraySwap(documents, i, largest)
    heapify(documents, largest, len, compare)
  }
}

function quickSort (documents:Document[], sortData:SortData[]):void {
  quickSortFn(documents, 0, documents.length - 1, evalCompare(sortData))
}

function quickSortFn (docs:Document[], left:number, right:number, compare:((a:Document, b:Document) => number)):void {
  const iLeft = left
  const iRight = right
  let dir = true
  let pivot = right
  while ((left - right) < 0) {
    if (dir) {
      if (compare(docs[pivot], docs[left]) < 0) {
        arraySwap(docs, pivot, left)
        pivot = left
        right--
        dir = !dir
      } else {
        left++
      }
    } else {
      if (compare(docs[pivot], docs[right]) <= 0) {
        right--
      } else {
        arraySwap(docs, pivot, right)
        pivot = right
        left++
        dir = !dir
      }
    }
  }
  if (pivot - 1 > iLeft) quickSortFn(docs, iLeft, pivot - 1, compare)
  if (pivot + 1 < iRight) quickSortFn(docs, pivot + 1, iRight, compare)
}

function arraySwap (a:any[], i:number, j:number) {
  const t:any = a[i]
  a[i] = a[j]
  a[j] = t
}

function createSortData (keys:string[]):SortData[] {
  const sd:SortData[] = []
  keys.forEach(key => {
    const order:1|-1 = key[0] === '-' ? -1 : 1
    const nested = key.match(/(\[|\]|\.)/g) ? true : false
    sd.push({ key: key.replace(/(\-|\+)/g, ''), order: order, nested: nested })
  })
  return sd
}

/**
 * @param index The index to traverse
 * @param document The document to find
 * @param sortData The sorting data for the index
 * @param lastIndex Whether to return the insertion index (false for search, true for insert)
 *
 * @return The index of the item
 */
function binarySearch (index:Document[], document:Document, sortData:SortData[], lastIndex?:boolean):number {
  const compare = comparisonFn(sortData)
  let min:number = 0
  let max:number = index.length - 1
  let i:number
  let d:Document
  let comp:number
  while (true) {
    i = min + Math.floor((max - min) / 2)
    comp = compare(document, index[i])
    if (comp === 0) return i
    if (comp > 0) {
      // Move to the right if we can
      if (i === max) return lastIndex ? i + 1 : -1
      min += Math.ceil((max - min + 1) / 2)
    } else {
      // Move to the left if we can
      if (i === min) return lastIndex ? i : -1
      max -= Math.ceil((max - min + 1) / 2)
    }
  }
}

export { binarySearch, createSortData, nestedProperty, sortDocuments }
