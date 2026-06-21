import { _decorator, Component, Node, Sprite, tween, Tween, Vec3 } from 'cc';
import { ballDto } from '../../dto/ballDto';
import { resMgr } from '../../managers/resMgr';
import { gameScene } from './gameScene';
import { ballTs } from './ballTs';
import { gameData } from '../../configs/gameData';
const { ccclass, property } = _decorator;

@ccclass('chacaoBallPreTs')
export class chacaoBallPreTs extends Component {
    // 球的sprite组件
    @property(Sprite)
    private sprite: Sprite = null
    // 飞行元素球的信息
    itemData: ballDto = null
    // 检查是否有缓动动画在进行中
    private tw: Tween<any> = null
    // 球的索引
    private curIdx: number = 0
    protected start(): void {
        // 获取当前节点在父节点中的索引，并赋值给 curIdx
        this.curIdx = this.node.getSiblingIndex()

    }
    /**
       * 每帧更新时调用
       * 用于处理球在插槽中球的位置更新
       * @param dt - 自上一帧以来的时间，以秒为单位
       */
    update(dt: number) {
        // 获取当前节点在父节点中的索引
        const nowIdx: number = this.node.getSiblingIndex()
        // 如果索引没有变化，则直接返回
        if (nowIdx === this.curIdx) return
        // 计算索引的偏移量
        const pianyi: number = Math.abs(nowIdx - this.curIdx)
        // 更新当前索引
        this.curIdx = nowIdx
        // 获取新索引对应的世界位置
        const newBallWorldPos: Vec3 = this.getChacaoBallWorldPos(nowIdx)
        if (!newBallWorldPos) return
        // 如果之前有缓动动画，则停止它
        if (this.tw) this.tw.stop()
        // 创建一个新的缓动动画
        this.tw = tween(this.node)
        // 设置动画的目标位置和时间
        this.tw.to(0.15 * pianyi, { worldPosition: newBallWorldPos }).start()
    }
    // 设置插槽球的属性及设置spriteFrame
    async setChacaoBall(val: ballDto) {
        // 将传入的 val 赋值给 itemData
        this.itemData = val
        // 获取球的图片资源
        const img = resMgr.ins.getImg(val.name)
        // 设置球的图片资源
        this.sprite.spriteFrame = img
    }
    /**
      * 获取指定索引的插槽在世界坐标系中的位置
      * @param idx - 插槽的索引
      * @returns 如果找到对应索引的插槽，则返回其世界位置，否则返回 null
      */
    getChacaoBallWorldPos(idx: number): Vec3 {
        // 检查游戏管理器的插槽盒子是否存在
        if (!gameData.chacaoBox) return null
        // 返回指定索引的插槽在世界坐标系中的位置
        return gameData.chacaoBox.children[idx].worldPosition
    }
}


