import { _decorator, Component, Node } from 'cc';
import { poolMgr } from './poolMgr';
import { tishiTs } from '../other/tishiTs';
import { nanduTipTs } from '../other/nanduTipTs';
import { huoquJiangliPopTs } from '../scene/main/huoquJiangliPopTs';
const { ccclass, property } = _decorator;

@ccclass('tishiMgr')
export class tishiMgr extends Component {
    /**
    * 打开获取奖励弹窗
    */
    static huoquJiangliPop(node: Node, callback: Function, isMaobiDh: boolean,) {
        const pop = poolMgr.ins.getPoolNode('huoquJiangliPop', node)
        const popTs = pop.getComponent(huoquJiangliPopTs)
        popTs.open(callback, isMaobiDh)
    }
    /**
    * 打开难度提示
    */
    static nanduTips(node: Node, title: string) {
        const tip = poolMgr.ins.getPoolNode('nanduTip', node)
        const tipTs = tip.getComponent(nanduTipTs)
        tipTs.setTips(title)
    }
    /**
     * 打开文字消息提示
     */
    static titleTips(node: Node, title: string) {
        const tips = poolMgr.ins.getPoolNode('tishi', node)
        const tipsTs = tips.getComponent(tishiTs)
        tipsTs.setTitle(title)
    }
}


