import { _decorator, Component, director, Node } from 'cc';
import { daojuType } from '../configs/daojuType';
import { daojuConfig } from '../configs/daojuConfig';
import { wupinMgr } from './wupinMgr';
import { daojuListTs } from '../scene/game/daojuListTs';
import { eventType } from '../configs/pathName';
const { ccclass, property } = _decorator;

@ccclass('daojuMgr')
export class daojuMgr extends Component {
    /**
    * 获取指定技能的数量。
    */
    static daojuNum(type: daojuType): number {
        // 获取技能的ID
        const daojuId: number = this.getDaojuId(type)
        // 获取技能的数量
        const num: number = wupinMgr.getWupinNum(daojuId)
        // 返回技能的数量
        return num
    }
    /**
   * 增加技能
   */
    static addDaoju(daoju: daojuType, num: number = 1): void {
        // 获取技能的ID
        const daojuId: number = this.getDaojuId(daoju)
        // 更新技能的数量
        wupinMgr.updateWupin(daojuId, num)
        // 触发更新技能数量显示的事件
        director.emit(eventType.updateDaojuNum)
        // 触发添加技能的事件
        director.emit(eventType.addDaoju, daoju)
    }
    /**
   * 根据技能类型获取技能的ID。
   * 此方法遍历配置文件中的所有物品数据，找到与指定技能类型匹配的物品，并返回其ID。
   * @param skill - 要查找的技能类型。
   * @returns {number} 技能的ID，如果未找到则返回-1。
   */
    static getDaojuId(type: daojuType): number {
        // 遍历配置文件中的所有物品数据
        for (let i = 0; i < daojuConfig.length; i++) {
            // 获取当前物品的数据
            const daojuData = daojuConfig[i];
            // 如果当前物品的技能类型与指定的技能类型匹配，则返回其ID
            if (daojuData?.daojuType === type) return daojuData.id
        }
        // 如果未找到匹配的技能类型，则返回-1
        return -1
    }
    /**
    * 检查是否拥有指定技能。
    */
    static isYongyouDaoju(type: daojuType): boolean {
        // 获取技能的ID
        const daojuId: number = this.getDaojuId(type)
        // 获取技能的数量
        const num: number = wupinMgr.getWupinNum(daojuId)
        // 判断技能数量是否大于0，如果大于0则返回true，表示拥有该技能，否则返回false
        return num > 0
    }
    /**
    * 使用技能
    */
    static useDaoju(type: daojuType): void {
        // 获取技能的ID
        const daojuId: number = this.getDaojuId(type)
        // 更新技能的数量，并获取当前的数量
        wupinMgr.updateWupin(daojuId, -1)
        director.emit(eventType.updateDaojuNum)
        switch (type) {
            case daojuType.dongjie:
                // 触发使用冻结技能的事件
                director.emit(eventType.useDongjie)
                break;
            case daojuType.couqi:
                // 触发使用擦除技能的事件
                director.emit(eventType.useCouqi)
                break
            case daojuType.yichu:
                // 触发使用移动技能的事件
                director.emit(eventType.useYichu)
                break
        }
    }

}


