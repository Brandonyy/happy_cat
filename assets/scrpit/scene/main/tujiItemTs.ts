import { _decorator, Button, Component, Material, Node, Sprite } from 'cc';
import { tujiMgr } from '../../managers/tujiMgr';
import { resMgr } from '../../managers/resMgr';
import { musicMgr } from '../../managers/musicMgr';
import { gameData } from '../../configs/gameData';
import { poolMgr } from '../../managers/poolMgr';
const { ccclass, property } = _decorator;

@ccclass('tujiItemTs')
export class tujiItemTs extends Component {
    // 背景
    @property(Sprite)
    itemBg: Sprite = null
    // 收集的图标
    @property(Sprite)
    catImg: Sprite = null
    // 是否可以解锁的提示
    @property(Node)
    tishi: Node = null
    // 普通材质和黑色材质
    @property(Material)
    putongCaizhi: Material = null
    @property(Material)
    heiseCaizhi: Material = null
    // 收集项的数据
    tujiData = null
    // 当前节点的Button组件
    private btn: Button = null
    protected onLoad(): void {
        // 获取当前节点的Button组件
        this.btn = this.getComponent(Button)
    }
    /**
   * 当收集项被点击时调用。
   * 该方法会打开收集信息UI，并解锁当前收集项。
   * 然后，它会更新收集项的状态。
   */
    onDianji(): void {
        gameData.tujiXiangqing = this.tujiData
        poolMgr.ins.getPoolNode('tujianXiangqingPop', gameData.main)
        // 解锁当前收集项
        tujiMgr.jiesuoTuji(this.tujiData.id)
        // 更新收集项的状态
        this.updateTuji()
        // 收集音效
        musicMgr.ins.playSound('小号胜利')
    }
    /**
        * 更新收集项的状态。
        */
    updateTuji(): void {
        // 解构赋值，获取收集项的数据
        const { id, icon, type } = this.tujiData
        // 检查收集项是否已收集
        const jiancha: boolean = tujiMgr.jianchaTuji(id)
        // 检查收集项是否可解锁
        const nengJiesuo: boolean = tujiMgr.nengJiesuo(id)
        // 检查收集项是否已解锁
        const shifouJiesuo: boolean = tujiMgr.shifouJiesuo(id)
        // 根据收集项是否已解锁，设置背景名称
        const tujiName: string = shifouJiesuo ? 'tjdk1' : 'tjdk2'

        // 如果收集项已收集且可解锁但未解锁，则显示红点
        this.tishi.active = jiancha && nengJiesuo && !shifouJiesuo
        //如果收集项已收集且可解锁或已解锁，则按钮可交互
        this.btn.interactable = jiancha && (nengJiesuo || shifouJiesuo)
        // 设置图标精灵帧
        this.catImg.spriteFrame = resMgr.ins.getImg(icon)
        // 设置背景精灵帧
        this.itemBg.spriteFrame = resMgr.ins.getImg(tujiName)
        // 如果收集项未收集或可解锁但未解锁，则图标使用黑色材质，否则使用正常材质
        if (!jiancha || (nengJiesuo && !shifouJiesuo)) {
            this.catImg.material = this.heiseCaizhi
        } else {
            this.catImg.material = this.putongCaizhi
        }
    }

}


