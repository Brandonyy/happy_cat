import { _decorator, Component, Node, Sprite } from 'cc';
import { ballDto } from '../../dto/ballDto';
import { resMgr } from '../../managers/resMgr';
const { ccclass, property } = _decorator;

@ccclass('feiBallPreTs')
export class feiBallPreTs extends Component {
    // 球的sprite组件
    @property(Sprite)
    private sprite: Sprite = null;
    // 飞行元素球的信息
    itemData: ballDto = null;

    async setFeiBallSpr(val: ballDto) {
        this.itemData = val;
        const img = resMgr.ins.getImg(val.name);
        this.sprite.spriteFrame = img;
    }
}
