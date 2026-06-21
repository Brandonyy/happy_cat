import { _decorator, Component, director, math, Node, RigidBody2D, Sprite, v2, Vec2, Vec3 } from 'cc';
import { suijiYuansu } from '../../utils/arrUtil';
import { resMgr } from '../../managers/resMgr';
import { eventType } from '../../configs/pathName';
const { ccclass, property } = _decorator;

@ccclass('danItemTs')
export class danItemTs extends Component {
    rigidBody: RigidBody2D = null
    sp: Sprite = null
    private danPos: Vec3 = null
    /**
     * 当组件加载时调用。
     * 该方法会获取刚体组件和精灵组件，
     * 设置刚体的重力缩放为0，
     * 随机选择一个蛋的精灵帧并设置给精灵组件，
     * 记录节点的初始位置，
     * 并注册开始扭蛋和结束扭蛋的事件监听器。
     */
    protected async onLoad(): Promise<void> {
        // 获取刚体组件
        this.rigidBody = this.getComponent(RigidBody2D)
        // 获取精灵组件
        this.sp = this.getComponent(Sprite)
        // 设置刚体的重力缩放为0
        this.rigidBody.gravityScale = 0
        // 随机选择一个蛋的ID
        const id: number = suijiYuansu([1, 2, 3])
        // 设置精灵组件的精灵帧
        this.sp.spriteFrame = await resMgr.ins.getImg(`扭蛋${id}@2x`)
        // 记录节点的初始位置
        this.danPos = this.node.getPosition()
        // 注册开始扭蛋的事件监听器
        director.on(eventType.kaishiChoujiang, this.onKaishiChoujiang, this)
        // 注册结束扭蛋的事件监听器
        director.on(eventType.jieshuChoujiang, this.onJieshuChoujiang, this)
    }
    protected onDestroy(): void {
        director.off(eventType.kaishiChoujiang, this.onKaishiChoujiang, this)
        director.off(eventType.jieshuChoujiang, this.onJieshuChoujiang, this)
    }
    /**
    * 结束扭蛋
    */
    onJieshuChoujiang() {
        // 将蛋的位置重置为初始位置
        this.node.setPosition(this.danPos)
        // 将刚体的线性速度设置为零
        this.rigidBody.linearVelocity = v2()
    }
    /**
     * 开始扭蛋
     */
    onKaishiChoujiang() {
        // 定义一个常量power，表示力的大小
        const li: number = 50
        // 创建一个空的Vec2向量
        const xiangliang: Vec2 = v2()
        // 在x轴上生成一个随机的力，范围在-power到power之间
        xiangliang.x = math.randomRange(-li, li)
        // 在y轴上设置力的大小为power
        xiangliang.y = li
        // 归一化力向量，使其长度为1  // 将归一化后的力向量乘以power，得到最终的力向量
        xiangliang.normalize().multiplyScalar(li)
        // 将力向量应用到刚体的线性速度上
        this.rigidBody.linearVelocity = xiangliang
    }

}


