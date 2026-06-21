import { _decorator, Component, director, instantiate, Node, ParticleSystem2D, Prefab, v2 } from 'cc';
import { eventType } from '../../configs/pathName';
import { homeMgr } from '../../managers/homeMgr';
import { maobiMgr } from '../../managers/maobiMgr';
import { gameConfig } from '../../configs/gameConfig';
import { tishiMgr } from '../../managers/tishiMgr';
import { musicMgr } from '../../managers/musicMgr';
import { poolMgr } from '../../managers/poolMgr';
import { homeItemKuaiTs } from './homeItemKuaiTs';
const { ccclass, property } = _decorator;
//源码网站 开vpn全局模式打开 https://web3incubators.com/
//客服联系方式 https://web3incubators.com/kefu.html


@ccclass('homeItemTs')
export class homeItemTs extends Component {
    // 页面视图选项下的块状图片预制体
    @property(Prefab)
    jiayuanItemKuaiPre: Prefab = null
    //  解锁按钮
    @property(Node)
    jiesuoBtn: Node = null
    // 待解锁提示
    @property(Node)
    djsIcon: Node = null
    // 块状图片的父节点
    @property(Node)
    body: Node = null
    // 当前节点的索引作为ID
    private id: number = 0
    onLoad() {
        // 并在事件触发时调用onUnlockHomePeice方法
        director.on(eventType.jiesuoHome, this.updateState, this)
    }
    start() {
        // 获取节点在其父节点的子节点列表中的 层级索引（显示顺序） 的方法
        this.id = this.node.getSiblingIndex()
        // 循环9次，创建9个HomePieceItem节点并添加到content节点下
        for (let i = 0; i < 9; i++) {
            // 实例化HomePieceItem预制体
            const homePieceItemNode: Node = instantiate(this.jiayuanItemKuaiPre)
            // 将实例化的节点添加到content节点下
            this.body.addChild(homePieceItemNode)
            // 获取HomePieceItem组件
            const jiayuanItemKuai: homeItemKuaiTs = homePieceItemNode.getComponent(homeItemKuaiTs)
            // 设置jiayuanItemKuai的ID
            jiayuanItemKuai.id = this.id

        }
        // 更新组件状态
        this.updateState()
    }
    protected onDestroy(): void {
        // 取消事件监听
        director.off(eventType.jiesuoHome, this.updateState, this)
    }
    /**
     * 更新组件状态
     */
    updateState() {
        // 检查当前家园部件是否可解锁
        const canJiesuo: boolean = homeMgr.canJiesuo(this.id)
        // 检查当前家园部件是否已全部解锁
        const isAllJiesuo: boolean = homeMgr.isAllJiesuo(this.id)
        // 根据检查结果更新解锁按钮的可见性
        this.jiesuoBtn.active = canJiesuo && !isAllJiesuo
        // 根据检查结果更新锁的可见性
        this.djsIcon.active = !canJiesuo

    }
    /**
     * 解锁按钮点击事件
     */
    onJiesuoBtn(): void {
        // 检查当前金币是否足够解锁当前家园部件
        if (maobiMgr.getMaobi < gameConfig.homeJiesuoJinbi) {
            // 如果金币不足，则显示提示信息并返回
            tishiMgr.titleTips(this.node, '金币不足')
            return
        }
        // 播放解锁音效
        musicMgr.ins.playSound('a家园解锁')
        // 扣除解锁所需的金币
        maobiMgr.updateMaobi(-gameConfig.homeJiesuoJinbi)
        director.emit(eventType.jinBiNum, false)
        // 解锁当前家园部件
        homeMgr.jiesuo(this.id)
        // 触发解锁家园部件事件
        director.emit(eventType.jiesuoHome)
        // 检查当前家园部件是否已全部解锁
        if (homeMgr.isAllJiesuo(this.id)) {
            const shanxing = poolMgr.ins.getPoolNode('shanxing', this.node)
            // 获取闪烁特效组件
            const particle: ParticleSystem2D = shanxing.getComponent(ParticleSystem2D)
            // 设置闪烁特效的位置变化范围
            particle.posVar = v2(360, 800)
            // 设置闪烁特效的总粒子数
            particle.totalParticles = 30
            // 设置闪烁特效的发射速率
            particle.emissionRate = 15
            // 播放通关成功音效
            musicMgr.ins.playSound('a通关成功')
        }
    }
}


