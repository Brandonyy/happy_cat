import { _decorator, Component, Node, Sprite } from 'cc';
import { ballDto } from '../../dto/ballDto';
import { resMgr } from '../../managers/resMgr';
const { ccclass, property } = _decorator;

@ccclass('feiBallPreTs')
export class feiBallPreTs extends Component {
    // 球的sprite组件
    @property(Sprite)
    private sprite: Sprite = null
    // 飞行元素球的信息
    itemData: ballDto = null
    // 设置球的属性及设置spriteFrame
    async setFeiBallSpr(val: ballDto) {
        // 将传入的 val 赋值给 itemData
        this.itemData = val
        // 获取球的图片资源
        const img = resMgr.ins.getImg(val.name)
        // 设置球的图片资源
        this.sprite.spriteFrame = img
    }
}


