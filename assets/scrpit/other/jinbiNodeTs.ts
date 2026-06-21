import { _decorator, Component, director, math, Node, Sprite, tween, v3 } from 'cc';
import { numAnimaTs } from './numAnimaTs';
import { eventType } from '../configs/pathName';
import { maobiMgr } from '../managers/maobiMgr';
import { resMgr } from '../managers/resMgr';
import { musicMgr } from '../managers/musicMgr';
const { ccclass, property } = _decorator;

@ccclass('jinbiNodeTs')
export class jinbiNodeTs extends Component {
    // lable文字显示脚本
    @property(numAnimaTs)
    numAnimaTs: numAnimaTs = null;
    protected start(): void {
        // 初始化金币数量
        this.numAnimaTs.init(maobiMgr.getMaobi)
        // 监听金币数量变化事件
        director.on(eventType.jinBiNum, this.updateMaobi, this);
    }
    protected onDestroy(): void {
        director.off(eventType.jinBiNum, this.updateMaobi, this);
    }
    /**
    * 创建飞行金币节点
    */
    chaungjianMaobi() {
        // 创建节点
        const feiMaobi: Node = new Node()
        // 为节点添加SPirte组件
        const spr: Sprite = feiMaobi.addComponent(Sprite)
        // 获取球的图片资源 
        const img = resMgr.ins.getImg('金币@2x')
        // 设置spriteFrame图片
        spr.spriteFrame = img
        // 将飞行金币节点添加到当前节点的父节点中
        feiMaobi.parent = this.node.parent
        // 返回创建的飞行金币节点
        return feiMaobi
    }
    /**
     * 更新金币数量
     * @param num 数量
     */
    updateMaobi(isFei: boolean = true) {
        // 定义金币飞行动画的x轴范围
        const flyX: number = 50
        // 定义金币飞行动画的y轴范围
        const flyY: number = 100
        // 如果需要播放动画
        if (isFei) {
            // 播放获得金币的音效
            musicMgr.ins.playSound('a获得金币')
            // 每隔0.1秒执行一次函数，共5次
            this.schedule(() => {
                // 创建一个飞行金币节点
                const feiMaobi: Node = this.chaungjianMaobi()
                // 在X轴范围内随机生成一个位置
                const x: number = math.randomRangeInt(-flyX, flyX)
                // 在Y轴范围内随机生成一个位置
                const y: number = math.randomRangeInt(-flyY, -50)
                // 创建一个补间动画对象
                const tw = tween(feiMaobi)
                // 在0.5秒内将飞行金币移动到指定位置，使用cubicOut缓动函数
                tw.to(0.5, { position: v3(x, y) }, { easing: 'cubicOut' })
                // 在1秒内将飞行金币移动到当前金币项的位置，使用backIn缓动函数
                tw.to(1, { position: this.node.position }, { easing: 'backIn' })
                // 动画完成后调用回调函数
                tw.call(() => {
                    musicMgr.ins.playSound('a获得金币1')
                    feiMaobi.destroy()
                })
                tw.start()
            }, 0.1, 5)
        }
        // 播放金币数量变化的动画
        this.numAnimaTs.numAnima(maobiMgr.getMaobi)
    }

}


