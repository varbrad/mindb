import { MinDB } from './mindb';
// Export the proxied class
export default new Proxy(new MinDB(), {
    get(target, name) {
        if (name in target)
            return target[name];
        // Return database if name is a string and found within the database list
        if (typeof name === 'string' && target.list().indexOf(name) !== -1)
            return target.get(name);
    },
    set(obj, prop, val) {
        if (prop in obj) {
            obj[prop] = val;
            return true;
        }
        throw new Error(`Do not dynamically set values on MinDB.`);
    }
});
