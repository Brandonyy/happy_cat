import { _decorator, Component, Node } from 'cc';
import { wupinMgr } from './wupinMgr';
import { bendiUtil } from '../utils/bendiUtil';
import { wupinType } from '../configs/wupinType';
const { ccclass, property } = _decorator;
const log = 'tujiMgr'
@ccclass('tujiMgr')
export class tujiMgr extends Component {
    // 已解锁图鉴的ID数组。
    private static yijingJiesuoArr: number[] = []
    /**
    * 初始化图鉴管理器。
    */
    static init(): void {
        this.yijingJiesuoArr = bendiUtil.getObj('yijingJiesuoArr', [])
    }
    /**
      * 获取已获取图鉴的数量。
      * 该方法会遍历所有物品的字典，统计其中图鉴类型的物品数量。
      * @returns 一个数字，表示已获取图鉴的数量。
      */
    static getNum(): number {
        // 初始化计数器
        let cnt: number = 0
        // 获取物品字典
        const WupinDic = wupinMgr.WupinDic
        // 遍历物品字典
        for (const key in wupinMgr.WupinDic) {
            // 检查属性是否为对象自身的属性
            if (Object.prototype.hasOwnProperty.call(WupinDic, key)) {
                // 将键转换为数字
                const itemId: number = Number(key)
                // 获取物品类型
                const type = wupinMgr.getType(itemId)
                // 如果物品类型为图鉴，则计数器加一
                if (type === wupinType.cangpin) cnt++
            }
        }
        // 返回计数器的值
        return cnt
    }
    /**
     * 检查是否有可解锁的图鉴。
     * 该方法会比较已解锁图鉴的数量和所有图鉴的数量，
     * 如果已解锁图鉴的数量小于所有图鉴的数量，则返回true，否则返回false。
     * @returns 一个布尔值，表示是否有可解锁的图鉴。
     */
    public static hasCanjiesuo(): boolean {
        // 比较已解锁图鉴的数量和所有图鉴的数量
        return this.getNum() > this.yijingJiesuoArr.length
    }
    /**
   * 添加一个图鉴到物品管理器中。
   * 该方法会检查指定的图鉴ID是否已经存在于物品管理器中，
   * 如果不存在，则将该图鉴添加到物品管理器中，并将其数量设置为1。
   * @param id - 要添加的图鉴的ID。
   */
    static addTuji(id: number): void {
        // 检查指定的图鉴ID是否已经存在于物品管理器中
        if (this.jianchaTuji(id)) {
            // 如果已经存在，则输出警告信息并返回
            console.log(log, `已有id为${id}的图鉴`);
            return
        }
        // 如果不存在，则将该图鉴添加到物品管理器中，并将其数量设置为1
        wupinMgr.setWupin(id, 1)
    }
    /**
     * 解锁指定ID的图鉴。
     */
    public static jiesuoTuji(id: number): void {
        // 检查指定的图鉴ID是否已经解锁
        if (this.shifouJiesuo(id)) {
            // 如果已经解锁，则输出警告信息并返回
            console.log(log, `已解锁id为${id}的图鉴`);
            return
        }
        // 如果尚未解锁，则将该图鉴ID添加到已解锁图鉴的ID数组中
        this.yijingJiesuoArr.push(id)
        // 对已解锁图鉴的ID数组进行排序
        this.yijingJiesuoArr.sort()
        // 将更新后的已解锁图鉴的ID数组存储到本地存储中
        bendiUtil.setObj('yijingJiesuoArr', this.yijingJiesuoArr)
    }
    /**
      * 检查指定ID的图鉴是否已解锁。
      * 该方法会检查指定的图鉴ID是否存在于已解锁图鉴的ID数组中。
      * @param id - 要检查的图鉴的ID。
      * @returns 一个布尔值，表示指定的图鉴是否已解锁。
      */
    static shifouJiesuo(id: number): boolean {
        // 检查指定的图鉴ID是否存在于已解锁图鉴的ID数组中
        return this.yijingJiesuoArr.includes(id)
    }
    /**
      * 检查指定ID的图鉴是否可以解锁。
      */
    static nengJiesuo(id: number): boolean {
        // 检查指定的图鉴ID是否存在于物品字典中，并且该图鉴ID尚未解锁
        return this.jianchaTuji(id) && !this.yijingJiesuoArr.includes(id)
    }
    /**
      * 检查指定ID的图鉴是否存在。
      */
    static jianchaTuji(id: number): boolean {
        // 检查指定的图鉴ID是否存在于物品字典中
        return !!wupinMgr.WupinDic[id]
    }
}


