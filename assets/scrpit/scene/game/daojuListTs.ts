import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { eventType } from '../../configs/pathName';
import { daojuType } from '../../configs/daojuType';
import { daojuMgr } from '../../managers/daojuMgr';
import { gameData } from '../../configs/gameData';
import { poolMgr } from '../../managers/poolMgr';
import { tishiMgr } from '../../managers/tishiMgr';
const { ccclass, property } = _decorator;

@ccclass('daojuListTs')
export class daojuListTs extends Component {
    // 技能图标数组
    @property([SpriteFrame])
    daojuImg: SpriteFrame[] = []
    // 技能数量提示数组
    @property([Label])
    daojuTipNum: Label[] = []
    start() {
        // 初始化技能数量提示
        this.initDaojuNum()
        // 监听技能数量更新事件
        director.on(eventType.updateDaojuNum, this.updateDaojuNum, this)
        // 监听技能添加事件
        director.on(eventType.addDaoju, this.addDaoju, this)
    }
    onDestroy(): void {
        director.off(eventType.updateDaojuNum, this.updateDaojuNum, this)
        director.off(eventType.addDaoju, this.addDaoju, this)
    }
    /**
      * 初始化技能数量提示
      * 在游戏开始时调用，设置每个技能的初始数量
      */
    initDaojuNum() {
        // 遍历技能数量提示数组
        for (let i = 0; i < this.daojuTipNum.length; i++) {
            // 获取当前技能的数量提示标签
            const daojuTipNum: Label = this.daojuTipNum[i]
            // 从技能管理器中获取当前技能的数量
            const num: number = daojuMgr.daojuNum(i)
            // 设置技能数量提示标签的文本为当前技能的数量
            daojuTipNum.string = `${num}`
            // 根据技能数量决定是否显示技能数量提示的父节点
            daojuTipNum.node.parent.active = num > 0
        }
    }
    /**
     * 更新技能数量提示
     */
    updateDaojuNum() {
        this.initDaojuNum()
    }
    /**
     * 获取技能增加技能数量
     */
    addDaoju(skill: daojuType) {
        // 创建一个新的节点用于显示飞行的技能图标
        const node: Node = new Node()
        // 为飞行技能节点添加 Sprite 组件
        const sp: Sprite = node.addComponent(Sprite)
        // 设置 Sprite 组件的精灵帧为对应技能的图标
        sp.spriteFrame = this.daojuImg[skill]
        // 将飞行技能节点添加到当前节点的父节点下
        node.parent = this.node.parent
        // 获取当前节点下对应技能的按钮节点
        const skillBtnNode: Node = this.node.children[skill]
        // 创建一个动画序列对象，用于控制飞行技能节点的动画
        const tw = tween(node)
        // 设置飞行技能节点的初始缩放为 0
        tw.set({ scale: v3(0, 0, 0) })
        // 在 0.2 秒内将飞行技能节点的缩放从 0 变为 1，使用 'backOut' 缓动函数
        tw.to(0.2, { scale: v3(1, 1, 1) }, { easing: 'backOut' })
        // 延迟 0.1 秒
        tw.delay(0.1)
        // 并行执行两个动画
        tw.parallel(
            // 在 0.5 秒内将飞行技能节点移动到对应技能按钮节点的世界位置
            tween(node).to(0.5, { worldPosition: skillBtnNode.worldPosition }),
            // 在 0.5 秒内将飞行技能节点的缩放从 1 变为 0.5
            tween(node).to(0.5, { scale: v3(0.5, 0.5, 0.5) }),
        )
        // 动画执行完成后回调函数
        tw.call(() => {
            // 销毁飞行技能节点
            node.destroy()
            // 对对应技能按钮节点进行缩放动画，先放大到 1.2 倍，再缩小回 1 倍
            tween(skillBtnNode).to(0.2, { scale: v3(1.2, 1.2, 1) }).to(0.2, { scale: v3(1, 1, 1) }).start()
        })
        // 启动动画序列
        tw.start()
    }
    /**
     * 冰冻技能
     */
    onDongjie() {
        if (daojuMgr.isYongyouDaoju(daojuType.dongjie)) {
            daojuMgr.useDaoju(daojuType.dongjie)
        } else {
            gameData.addDaojuType = daojuType.dongjie
            poolMgr.ins.getPoolNode('addDaojuPop', gameData.game)
            console.log('没有冰冻技能');
        }
    }
    /**
     * 移出技能
     */
    onYiChu() {
        if (daojuMgr.isYongyouDaoju(daojuType.yichu)) {
            if (gameData.selectBallIdArr.length <= 0) {
                tishiMgr.titleTips(gameData.game, '暂时不用使用道具~')
                return
            }
            daojuMgr.useDaoju(daojuType.yichu)
        } else {
            gameData.addDaojuType = daojuType.yichu
            poolMgr.ins.getPoolNode('addDaojuPop', gameData.game)
            console.log('没有移出技能');
        }
    }
    /**
     * 消除技能
     */
    onCouqi() {
        if (daojuMgr.isYongyouDaoju(daojuType.couqi)) {
            if (gameData.selectBallIdArr.length <= 0) {
                tishiMgr.titleTips(gameData.game, '暂时不用使用道具~')
                return
            }
            daojuMgr.useDaoju(daojuType.couqi)
        } else {
            gameData.addDaojuType = daojuType.couqi
            poolMgr.ins.getPoolNode('addDaojuPop', gameData.game)
            console.log('没有消除技能');
        }
    }
}


