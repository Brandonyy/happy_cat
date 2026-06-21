import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;
const shujuid: string = 'zmm'
type shujuType = number | string | boolean
@ccclass('bendiUtil')
export class bendiUtil extends Component {
    /**
    * 生成完整的本地存储键名。
    * 该方法会在传入的键名前添加一个前缀，以确保键名的唯一性。
    * @param key - 原始的键名。
    * @returns 带有前缀的完整键名。
    */
    static getKeyName(key: string): string {
        // 将 Id 前缀和传入的键名组合成完整的键名
        return `${shujuid}_${key}`
    }
    /**
      * 设置一个简单类型的值到本地存储中。
      */
    static setItem(key: string, value: shujuType): void {
        // 如果值是布尔类型，将其转换为数字（0 或 1）
        if (typeof value === "boolean") value = Number(value)
        // 获取完整的键名，通过 Id 前缀和传入的键组合而成
        const keyName: string = this.getKeyName(key)
        // 将值转换为字符串并保存到本地存储中
        sys.localStorage.setItem(keyName, String(value))
    }
	//源码网站 开vpn全局模式打开 https://web3incubators.com/
//客服联系方式 https://web3incubators.com/kefu.html


    /**
       * 从本地存储中获取一个简单类型的值。
       */
    static getItem(key: string, defaultValue?: shujuType): any {
        // 获取完整的键名，通过 Id 前缀和传入的键组合而成
        const keyName: string = this.getKeyName(key)
        // 从本地存储中获取对应键的值
        let value: string = sys.localStorage.getItem(keyName)
        // 如果获取到值，则将其解析为合适的类型并返回
        if (value) return JSON.parse(value)
        // 返回默认值
        return defaultValue
    }
    /**
   * 从本地存储中获取一个对象或数组。
   */
    static getObj(key: string, defaultValue?: Object | any[]): any {
        // 获取完整的键名，通过 Id 前缀和传入的键组合而成
        const keyName: string = this.getKeyName(key)
        // 从本地存储中获取对应键的值
        let str: string = sys.localStorage.getItem(keyName)
        // 如果获取到值，则将其解析为对象或数组并返回
        if (str) return JSON.parse(str)
        // 返回默认值
        return defaultValue
    }
    /**
    * 将对象或数组保存到本地存储中。
    */
    static setObj(key: string, obj: Object | any[], log: boolean = true): void {
        // 将对象或数组转换为 JSON 字符串
        let str: string = JSON.stringify(obj)
        // 获取完整的键名，通过 Id 前缀和传入的键组合而成
        const keyName: string = this.getKeyName(key)
        // 将 JSON 字符串保存到本地存储中
        sys.localStorage.setItem(keyName, str)
    }
    /**
     * 清除本地存储中的所有数据。
     * 该方法会调用 sys.localStorage.clear() 来移除本地存储中的所有键值对。
     */
    static clear(): void {
        // 清除本地存储中的所有数据
        sys.localStorage.clear()
    }
    /**
   * 从本地存储中移除指定键的值。
   */
    static removeItem(key: string): void {
        // 获取完整的键名，通过 Id 前缀和传入的键组合而成
        const keyName: string = this.getKeyName(key)
        // 从本地存储中移除对应完整键名的值
        sys.localStorage.removeItem(keyName)
    }

}


