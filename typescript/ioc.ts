interface IContainer {
    callback: () => {};
    singleton: boolean;
    instance?: {}
}

interface Newable<T> {
    new (...args: any[]) : T;
}

class CreateIoc {
    private container: Map<Symbol, IContainer>;

    constructor() {
        this.container = new Map<Symbol, IContainer>();
    }
    bind<T>(key:Symbol, Fn: Newable<T>) {
        const callback = () => new Fn();
        this.container.set(key, {callback, singleton: false});
    }

    singleton<T>(key:Symbol, Fn: Newable<T>) {
        const callback = () => new Fn();
        this.container.set(key, {callback, singleton: true})
    }

    use<T>(namespace: Symbol) {
        let item = this.container.get(namespace);
        if(item != undefined) {
            if(item.singleton && !item.instance) {
                item.instance = item.callback();  
            }
            return item.singleton ? (item.instance as T): (item?.callback() as T);
        } else {
            throw new Error("并不存在的item")
        }
    }
}

export default CreateIoc;