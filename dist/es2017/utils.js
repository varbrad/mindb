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
export { nestedProperty };
