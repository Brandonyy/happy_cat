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
    private sprite: Sprite = null;
    // 飞行元素球的信息
    itemData: ballDto = null;
    // 检查是否有缓动动画在进行中
    private tw: Tween<any> = null;
    // 球的索引
    private curIdx: number = 0;

    protected start(): void {
        this.curIdx = this.node.getSiblingIndex();
    }

    /**
     * 每帧更新时调用
     * 用于处理球在插槽中球的位置更新
     * @param dt - 自上一帧以来的时间，以秒为单位
     */
    update(dt: number) {
        const nowIdx: number = this.node.getSiblingIndex();
        if (nowIdx === this.curIdx) return;
        // 计算索引的偏移量
        const indexDistance: number = Math.abs(nowIdx - this.curIdx);
        this.curIdx = nowIdx;
        const targetWorldPosition: Vec3 = this.getChacaoBallWorldPos(nowIdx);
        if (!targetWorldPosition) return;
        if (this.tw) this.tw.stop();
        this.tw = tween(this.node);
        this.tw.to(0.15 * indexDistance, { worldPosition: targetWorldPosition }).start();
    }

    async setChacaoBall(val: ballDto) {
        this.itemData = val;
        const img = resMgr.ins.getImg(val.name);
        this.sprite.spriteFrame = img;
    }

    /**
     * 获取指定索引的插槽在世界坐标系中的位置
     * @param idx - 插槽的索引
     * @returns 如果找到对应索引的插槽，则返回其世界位置，否则返回 null
     */
    getChacaoBallWorldPos(idx: number): Vec3 {
        // 检查游戏管理器的插槽盒子是否存在
        if (!gameData.chacaoBox) return null;
        return gameData.chacaoBox.children[idx].worldPosition;
    }
}
