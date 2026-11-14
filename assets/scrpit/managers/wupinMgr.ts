import { _decorator, Component, Node } from 'cc';
import { bendiUtil } from '../utils/bendiUtil';
import { gameData } from '../configs/gameData';
import { wupinType } from '../configs/wupinType';
import { daojuConfig } from '../configs/daojuConfig';
const { ccclass, property } = _decorator;
@ccclass('wupinMgr')
export class wupinMgr extends Component {
    static rewardArr: any[] = [];
    static rewardedArr: number[] = [];
    /** 一个包含所有物品及其数量的字典。 */
    private static wupinDic: { [key: number]: number } = {};

    public static get WupinDic() {
        return this.wupinDic;
    }

    /** 初始化物品管理器。 */
    public static init(): void {
        this.wupinDic = gameData.morenWupin;
        this.wupinDic = bendiUtil.getObj('wupinDic', gameData.morenWupin);
        bendiUtil.setObj('wupinDic', this.wupinDic);
    }

    /** 根据ID获取物品的类型。 */
    static getType(id: number): wupinType {
        const itemConfig = daojuConfig[id];
        return itemConfig.type;
    }

    /** 设置物品的数量。 */
    static setWupin(id: number, cnt: number): number {
        if (!this.wupinDic[id]) {
            this.wupinDic[id] = 0;
        }
        this.wupinDic[id] = cnt;
        bendiUtil.setObj('wupinDic', this.wupinDic);
        return this.wupinDic[id];
    }

    /** 获取物品的数量。 */
    static getWupinNum(id: number): number {
        return this.wupinDic[id];
    }

    /** 更新物品的数量。 */
    static updateWupin(id: number, cnt: number): number {
        if (!this.wupinDic[id]) {
            this.wupinDic[id] = 0;
        }
        this.wupinDic[id] += cnt;
        bendiUtil.setObj('wupinDic', this.wupinDic);
        return this.wupinDic[id];
    }
}
