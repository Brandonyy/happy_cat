import { _decorator, Component, sys } from 'cc';
const { ccclass } = _decorator;
const shujuid = 'zmm';
type shujuType = number | string | boolean;

@ccclass('bendiUtil')
export class bendiUtil extends Component {
    /** 存档前缀属于已有存档格式，须与旧版本保持一致。 */
    static getKeyName(key: string): string {
        return `${shujuid}_${key}`;
    }

    /** 布尔值仍保存为 0/1，读取时沿用 JSON.parse 的结果。 */
    static setItem(key: string, value: shujuType): void {
        if (typeof value === 'boolean') value = Number(value);
        const keyName = this.getKeyName(key);
        sys.localStorage.setItem(keyName, String(value));
    }

    static getItem(key: string, defaultValue?: shujuType): any {
        const keyName = this.getKeyName(key);
        const value: string = sys.localStorage.getItem(keyName);
        if (value) return JSON.parse(value);
        return defaultValue;
    }

    static getObj(key: string, defaultValue?: Object | any[]): any {
        const keyName = this.getKeyName(key);
        const value: string = sys.localStorage.getItem(keyName);
        if (value) return JSON.parse(value);
        return defaultValue;
    }

    static setObj(key: string, obj: Object | any[], log: boolean = true): void {
        const value = JSON.stringify(obj);
        const keyName = this.getKeyName(key);
        sys.localStorage.setItem(keyName, value);
    }

    /** 沿用原行为：清空整个 localStorage。 */
    static clear(): void {
        sys.localStorage.clear();
    }

    static removeItem(key: string): void {
        const keyName = this.getKeyName(key);
        sys.localStorage.removeItem(keyName);
    }
}
