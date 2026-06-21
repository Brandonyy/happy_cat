import { _decorator, Component, isValid, Node } from 'cc';
import { musicMgr } from '../../managers/musicMgr';
import { gameConfig } from '../../configs/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('dongjieBgTs')
export class dongjieBgTs extends Component {
    onEnable() {
        musicMgr.ins.playSound('a冰冻道具')
        this.scheduleOnce(this.deleteDongjieNode, gameConfig.dongjieTime)
    }

    deleteDongjieNode() {
        // 检查节点是否仍然有效，如果有效则销毁节点
        if (isValid(this.node)) this.node.destroy()
    }
}


