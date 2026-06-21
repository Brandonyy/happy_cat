import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { gameData } from '../../configs/gameData';
import { resMgr } from '../../managers/resMgr';
const { ccclass, property } = _decorator;

@ccclass('tujianXiangqingPopTs')
export class tujianXiangqingPopTs extends Component {
    // 图鉴图片
    @property(Sprite)
    catImg: Sprite = null
    // 图鉴名称
    @property(Label)
    catName: Label = null
    protected onEnable(): void {
        this.catImg.spriteFrame = resMgr.ins.getImg(gameData.tujiXiangqing.icon)
        this.catName.string = gameData.tujiXiangqing.name
    }
    // 关闭弹窗
    onGuanbi() {
        this.node.destroy()
    }
}


