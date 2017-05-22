function nestedProperty(doc, key) {
    key = key.replace(/\[(\w+)\]/g, '.$1');
    key = key.replace(/^\./, '');
    let parts = key.split('.');
    let val = doc;
    parts.forEach(k => {
        // Is k within val?
        if (!val.hasOwnProperty(k))
            throw new Error(`Nested property '${key}' could not be resolved at '${k}' property.`);
        val = val[k];
    });
    return val;
}
function sort(documents, sortData) {
    documents.sort((a, b) => {
        return comparisonFn(sortData, a, b);
    });
}
// This function is quite slow!
function comparisonFn(sortData, a, b) {
    const l = sortData.length;
    for (let i = 0; i < l; ++i) {
        const sort = sortData[i];
        let _a;
        let _b;
        if (sort.nested) {
            _a = nestedProperty(a, sort.key);
            _b = nestedProperty(b, sort.key);
        }
        else {
            _a = a[sort.key];
            _b = b[sort.key];
        }
        if (_a !== _b) {
            return (_a > _b ? 1 : -1) * sort.order;
        }
    }
    return 0;
}
function quickSort(documents, sortData) {
    quickSortFn(documents, 0, documents.length - 1, sortData);
}
function quickSortFn(docs, left, right, sortData) {
    const iLeft = left;
    const iRight = right;
    let dir = true;
    let pivot = right;
    while ((left - right) < 0) {
        if (dir) {
            if (comparisonFn(sortData, docs[pivot], docs[left]) < 0) {
                arraySwap(docs, pivot, left);
                pivot = left;
                right--;
                dir = !dir;
            }
            else {
                left++;
            }
        }
        else {
            if (comparisonFn(sortData, docs[pivot], docs[right]) <= 0) {
                right--;
            }
            else {
                arraySwap(docs, pivot, right);
                pivot = right;
                left++;
                dir = !dir;
            }
        }
    }
    if (pivot - 1 > iLeft)
        quickSortFn(docs, iLeft, pivot - 1, sortData);
    if (pivot + 1 < iRight)
        quickSortFn(docs, pivot + 1, iRight, sortData);
}
function arraySwap(a, i, j) {
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
}
function createSortData(keys) {
    const sd = [];
    keys.forEach(key => {
        const order = key[0] === '-' ? -1 : 1;
        const nested = key.match(/(\[|\]|\.)/g) ? true : false;
        sd.push({ key: key.replace(/(\-|\+)/g, ''), order: order, nested: nested });
    });
    return sd;
}
/**
 * @param index The index to traverse
 * @param document The document to find
 *
 * @return The index of the item
 */
function binarySearch(index, document, sortData, lastIndex) {
    let min = 0;
    let max = index.length - 1;
    let i;
    let d;
    let comp;
    while (true) {
        i = min + Math.floor((max - min) / 2);
        comp = comparisonFn(sortData, document, index[i]);
        if (comp === 0)
            return i;
        if (comp > 0) {
            // Move to the right if we can
            if (i === max)
                return lastIndex ? i + 1 : -1;
            min += Math.ceil((max - min + 1) / 2);
        }
        else {
            // Move to the left if we can
            if (i === min)
                return lastIndex ? i : -1;
            max -= Math.ceil((max - min + 1) / 2);
        }
    }
}
function binaryInsert(index, document, sortData) {
    const i = binarySearch(index, document, sortData, true);
    index.splice(i, 0, document);
}
export { binaryInsert, binarySearch, createSortData, nestedProperty, sort, quickSort };
