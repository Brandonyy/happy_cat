import { _decorator, Component, Node } from 'cc';
import { daojuType } from '../../configs/daojuType';
import { gameData } from '../../configs/gameData';
import { adMgr } from '../../adWxDy/adMgr';
import { daojuMgr } from '../../managers/daojuMgr';
const { ccclass, property } = _decorator;

@ccclass('addDaojuPopTs')
export class addDaojuPopTs extends Component {
    // 三种技能显示的节点
    @property(Node)
    daojus: Node[] = []
    // 技能类型
    private daoju: daojuType = null
    onEnable() {
        // 暂停游戏
        gameData.zanting = true
        // 获取游戏数据中的添加技能类型
        this.daoju = gameData.addDaojuType as daojuType
        // 遍历技能节点数组
        for (let i = 0; i < this.daojus.length; i++) {
            // 获取当前技能节点
            const skill: Node = this.daojus[i];
            // 根据当前技能类型是否等于当前索引，设置节点的激活状态
            skill.active = this.daoju === i
        }
    }
    /**
     * 获取技能
     */
    getDaoju() {
        // 观看广告
        adMgr.showVideo(() => {
            // 恢复游戏
            gameData.zanting = false
            // 调用技能管理器添加当前技能
            daojuMgr.addDaoju(this.daoju)
            // 隐藏节点
            this.node.destroy()
        })
    }
    onGuanbi() {
        // 恢复游戏
        gameData.zanting = false
        // 隐藏节点
        this.node.destroy()
    }
}


