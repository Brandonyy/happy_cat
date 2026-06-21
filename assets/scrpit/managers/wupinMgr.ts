import { _decorator, Component, Node } from 'cc';
import { bendiUtil } from '../utils/bendiUtil';
import { gameData } from '../configs/gameData';
import { wupinType } from '../configs/wupinType';
import { daojuConfig } from '../configs/daojuConfig';
const { ccclass, property } = _decorator;

@ccclass('wupinMgr')
export class wupinMgr extends Component {
    // 奖品奖励数据
    static rewardArr: any[] = []
    static rewardedArr: number[] = []
    /**
     * 一个包含所有物品及其数量的字典。
     * 键是物品的ID，值是物品的数量。
     */
    private static wupinDic: { [key: number]: number } = {}
    public static get WupinDic() {
        return this.wupinDic
    }
    /**
  * 初始化物品管理器。
  * 此方法在游戏启动时调用，用于从本地存储中加载物品数据，
  * 如果本地存储中没有数据，则使用默认物品数据初始化。
  */
    public static init(): void {
        // 从本地存储中加载物品数据，如果没有数据，则使用默认物品数据初始化
        this.wupinDic = gameData.morenWupin
        this.wupinDic = bendiUtil.getObj('wupinDic', gameData.morenWupin)
        // 将物品数据保存回本地存储
        bendiUtil.setObj('wupinDic', this.wupinDic)
    }
    /**
     * 根据ID获取物品的类型。
     */
    static getType(id: number): wupinType {
        // 根据物品ID从配置文件中获取物品数据
        const jpData = daojuConfig[id]
        // 返回物品的类型
        return jpData.type
    }
    /**
      * 设置物品的数量。
      * 此方法用于设置指定物品的数量，并将更新后的物品数据保存到本地存储中。
      * @param id - 物品的ID。
      * @param cnt - 要设置的物品数量。
      * @returns {number} 更新后的物品数量。
      */
    static setWupin(id: number, cnt: number): number {
        // 如果物品ID不存在，则初始化为0
        if (!this.wupinDic[id]) {
            this.wupinDic[id] = 0
        }
        // 设置物品的数量
        this.wupinDic[id] = cnt
        // 将更新后的物品数据保存到本地存储中
        bendiUtil.setObj('wupinDic', this.wupinDic)
        // 返回更新后的物品数量
        return this.wupinDic[id]
    }
    /**
      * 获取物品的数量。
      * 此方法根据物品的ID从物品字典中获取物品的数量。
      * @param id - 物品的ID。
      * @returns {number} 物品的数量。
      */
    static getWupinNum(id: number): number {
        // 返回物品的数量
        return this.wupinDic[id]
    }
    /**
        * 更新物品的数量。
        * 此方法用于更新指定物品的数量，并将更新后的物品数据保存到本地存储中。
        * @param id - 物品的ID。
        * @param cnt - 要更新的物品数量。
        * @returns {number} 更新后的物品数量。
        */
    static updateWupin(id: number, cnt: number): number {
        // 如果物品ID不存在，则初始化为0
        if (!this.wupinDic[id]) {
            this.wupinDic[id] = 0
        }
        // 更新物品的数量
        this.wupinDic[id] += cnt
        // 将更新后的物品数据保存到本地存储中
        bendiUtil.setObj('wupinDic', this.wupinDic)
        // // 返回更新后的物品数量
        return this.wupinDic[id]
    }
}


