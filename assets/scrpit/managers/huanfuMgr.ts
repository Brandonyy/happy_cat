import { _decorator, Component, Node } from 'cc';
import { bendiUtil } from '../utils/bendiUtil';
const { ccclass, property } = _decorator;
const log = 'huanfuMgr'
@ccclass('huanfuMgr')
export class huanfuMgr extends Component {
    // 已解锁的装饰物品ID列表
    private static yiJiesuoArr: number[] = [0]
    // 获取当前正在使用的装饰物品ID。
    static shiyongIng: number = 0
    /**
     * 初始化管理器
     */
    static init() {
        // 从本地存储中获取已解锁的装饰物品ID列表，如果没有则使用默认的装饰物品ID列表
        this.yiJiesuoArr = bendiUtil.getObj('yiJiesuoArr', [0])
        // 从本地存储中获取当前正在使用的装饰物品ID，如果没有则使用默认的当前正在使用的装饰物品ID
        this.shiyongIng = bendiUtil.getItem('shiyongIng', 0)
    }
    /**
     * 使用指定ID的装饰物品。
     * @param id 
     * @returns 
     */
    static usePifu(id: number) {
        // 检查指定的装饰物品是否已经在使用中
        if (this.shiyongIng === id) {
            // 如果已经在使用中，则输出警告信息并返回
            console.log(log, `id为${id}的装饰已被使用，无需重复使用`);
            return
        }
        this.shiyongIng = id
        bendiUtil.setItem('shiyongIng', id)
    }
    /**
   * 解锁指定ID的装修物品。
   */
    static jiesuoHf(id: number) {
        // 检查指定的装饰物品是否已经解锁
        if (this.shifouJiesuo(id)) {
            // 如果已经解锁，则输出警告信息并返回
            console.log(log, `id为${id}的装饰已被解锁，无需重复解锁`);
            return
        }
        // 将指定的装饰物品的ID添加到已解锁的装饰物品ID列表中
        this.yiJiesuoArr.push(id)
        // 将更新后的已解锁的装饰物品ID列表存储到本地存储中
        bendiUtil.setObj('yiJiesuoArr', this.yiJiesuoArr)
        console.log(log, `解锁id为${id}的装饰`);

    }
    /**
      * 检查指定ID的装饰物品是否正在使用中。
      * 该方法会检查指定的装饰物品ID是否与当前正在使用的装饰物品ID相同。
      * @param id - 要检查的装饰物品的ID。
      * @returns 一个布尔值，表示指定的装饰物品是否正在使用中。
      */
    public static isShiyong(id: number): boolean {
        // 检查指定的装饰物品ID是否与当前正在使用的装饰物品ID相同
        return this.shiyongIng === id
    }
    /**
         * 检查指定ID的装饰物品是否已解锁。
         */
    public static shifouJiesuo(id: number): boolean {
        // 检查指定的装饰物品ID是否存在于已解锁的装饰物品ID列表中
        return this.yiJiesuoArr.includes(id)
    }
}


