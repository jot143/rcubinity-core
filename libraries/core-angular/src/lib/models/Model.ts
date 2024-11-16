export class Model<T extends Model<T>> {
  className = "Model";

  async set(data: any, saveLocal = false): Promise<T> {

    for (const d in data) {

      const e: any = this;
      const prototype = Object.getPrototypeOf(e);

      if (Array.isArray(e[d])) {


        if (prototype && prototype._array_variable_class && prototype._array_variable_class[d]) {

          const createObj = prototype._array_variable_class[d];

          const childObjs = [];
          for (const _data of data[d]) {
            const obj = createObj();
            await obj.set(_data);
            await childObjs.push(obj);
          }

          e[d] = childObjs;
        }
        else {
          console.warn(`Class "${e.className}" parameter "${d}" is array, but its decorated is not define`);
          e[d] = data[d];
        }

      }
      else {

        if (prototype && prototype._variable_class && prototype._variable_class[d] && data[d]) {
          const createObj = prototype._variable_class[d];
          const obj = createObj();
          e[d] = await obj.set(data[d]);
        }
        else {
          e[d] = data[d];
        }

      }
    }

    if (saveLocal) {
      this.saveLocal();
    }

    return this as unknown as T;
  }

  get(key: string) {
    try {
      const e: any = this;
      return e[key];
    } catch {
      return null;
    }
  }

  stringify() {
    const replacerFunc = () => {
      const visited = new WeakSet();
      return (key: any, value: any) => {
        if (typeof value === "object" && value !== null) {
          if (visited.has(value)) {
            return;
          }
          visited.add(value);
        }
        return value;
      };
    };

    return JSON.stringify(this, replacerFunc());
  }

  saveLocal() {
    const data = this.stringify();
    localStorage.setItem(this.className, data);
  }

  loadFromLocal() {
    const data: any = localStorage.getItem(this.className);
    try {
      this.set(JSON.parse(data));
    } catch {
      //
    }
  }

  static getClassName() {
    const className = this.toString()
      .split("(" || /s+/)[0]
      .split(" " || /s+/)[1];
    return className;
  }

  static async createFromArray<U extends Model<U>>(DATAs: Array<any> = []): Promise<U[]> {
    const objs = [];
    for (const data of DATAs) {
      const obj = new this();
      await obj.set(data);
      await objs.push(obj);
    }
    return objs as U[];
  }

  static async create<U extends Model<U>>(data: any): Promise<U> {
    const obj = new this();
    await obj.set(data);
    return obj as U;
  }
}
