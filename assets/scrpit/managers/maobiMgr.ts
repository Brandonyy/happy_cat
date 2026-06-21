import { _decorator, Component, Node } from 'cc';
import { wupinMgr } from './wupinMgr';
const { ccclass, property } = _decorator;

@ccclass('maobiMgr')
export class maobiMgr extends Component {
    /**
     * 获取金币数量
     */
    static get getMaobi() {
        return wupinMgr.getWupinNum(0) ?? 0
    }
    /**
     * 更新金币数量
     */
    static updateMaobi(num: number) {
        wupinMgr.updateWupin(0, num)
    }
}


