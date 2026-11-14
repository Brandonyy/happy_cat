import { _decorator, Component, director, Node } from 'cc';
import { daojuType } from '../configs/daojuType';
import { daojuConfig } from '../configs/daojuConfig';
import { wupinMgr } from './wupinMgr';
import { daojuListTs } from '../scene/game/daojuListTs';
import { eventType } from '../configs/pathName';
const { ccclass, property } = _decorator;
@ccclass('daojuMgr')
export class daojuMgr extends Component {
    /** 获取指定技能的数量。 */
    static daojuNum(type: daojuType): number {
        const daojuId: number = this.getDaojuId(type);
        const num: number = wupinMgr.getWupinNum(daojuId);
        return num;
    }

    /** 增加技能 */
    static addDaoju(daoju: daojuType, num: number = 1): void {
        const daojuId: number = this.getDaojuId(daoju);
        wupinMgr.updateWupin(daojuId, num);
        director.emit(eventType.updateDaojuNum);
        director.emit(eventType.addDaoju, daoju);
    }

    /** 根据技能类型获取技能的ID。 */
    static getDaojuId(type: daojuType): number {
        for (let i = 0; i < daojuConfig.length; i++) {
            const daojuData = daojuConfig[i];
            if (daojuData?.daojuType === type) return daojuData.id;
        }
        return -1;
    }

    /** 检查是否拥有指定技能。 */
    static isYongyouDaoju(type: daojuType): boolean {
        const daojuId: number = this.getDaojuId(type);
        const num: number = wupinMgr.getWupinNum(daojuId);
        return num > 0;
    }

    /** 使用技能 */
    static useDaoju(type: daojuType): void {
        const daojuId: number = this.getDaojuId(type);
        wupinMgr.updateWupin(daojuId, -1);
        director.emit(eventType.updateDaojuNum);
        switch (type) {
            case daojuType.dongjie:
                director.emit(eventType.useDongjie);
                break;
            case daojuType.couqi:
                director.emit(eventType.useCouqi);
                break;
            case daojuType.yichu:
                director.emit(eventType.useYichu);
                break;
        }
    }
}
