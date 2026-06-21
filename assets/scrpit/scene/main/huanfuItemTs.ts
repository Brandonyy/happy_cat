import { _decorator, Component, Node, Sprite } from 'cc';
import { resMgr } from '../../managers/resMgr';
import { huanfuMgr } from '../../managers/huanfuMgr';
import { tishiMgr } from '../../managers/tishiMgr';
import { gameData } from '../../configs/gameData';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;
//源码网站 开vpn全局模式打开 https://web3incubators.com/
//客服联系方式 https://web3incubators.com/kefu.html


@ccclass('huanfuItemTs')
export class huanfuItemTs extends Component {
    // 装修背景
    @property(Sprite)
    hfBg: Sprite = null
    // 装修图片展示
    @property(Sprite)
    hfHead: Sprite = null
    // 装修名称
    @property(Sprite)
    hfName: Sprite = null
    // 装修样式介绍
    @property(Sprite)
    huanfuJieshao: Sprite = null
    //使用按钮
    @property(Node)
    shiyongBtn: Node = null
    //解锁按钮
    @property(Node)
    jiesuoBtn: Node = null
    //解锁按钮
    @property(Node)
    shiyongIng: Node = null
    // 装修数据
    private data = null
    // 装修样式ID
    private id: number = 0
    // 解锁状态
    private shifouJiesuo: boolean = false
    // 当前使用状态
    private shifouUse: boolean = false
    public get hfData() {
        return this.data
    }
    /**
  * 设置装饰物品的数据。
  * @param val - 要设置的装饰物品的数据对象。
  */
    public set hfData(val) {
        // 将传入的数据对象赋值给当前实例的data属性
        this.data = val;
        // 从传入的数据对象中获取id属性，并赋值给当前实例的id属性
        const id: number = val
        this.id = id
        // 装修图片展示
        this.hfHead.spriteFrame = resMgr.ins.getImg(`type_${id}`)
        //  装修名称
        this.hfName.spriteFrame = resMgr.ins.getImg(`name_${id}`)
        //  装修名称
        this.huanfuJieshao.spriteFrame = resMgr.ins.getImg(`des_${id}`)
        // 更新装饰列表
        this.updateData()
    }

    /**
      * 当点击解锁按钮时调用的方法。
      */
    onJiesuoBtn() {
        adMgr.showVideo(() => {
            this.jiesuoPifu()
        })
    }
    /**
    * 当点击使用按钮时调用的方法。
    */
    onShiyong() {
        // 调用装饰物品管理器的use方法来使用当前装饰物品
        huanfuMgr.usePifu(this.id)
        // 获取当前节点的父节点，并获取其所有子节点中的DecItem组件,getComponentsInChildren递归查找自身或所有子节点中指定类型的组件
        const huanfuItems: huanfuItemTs[] = this.node.parent.getComponentsInChildren(huanfuItemTs)
        // 遍历装修列表中的所有zxItemTs组件
        for (let i = 0; i < huanfuItems.length; i++) {
            // 获取当前DecItem组件
            const huanfuItem: huanfuItemTs = huanfuItems[i];
            // 更新DecItem组件的数据
            huanfuItem.updateData()
        }
    }
    jiesuoPifu() {
        // 调用装饰物品管理器的jiesuoZx方法来解锁当前装饰物品
        huanfuMgr.jiesuoHf(this.id)
        // 获取当前节点的父节点，并获取其所有子节点中的DecItem组件,getComponentsInChildren递归查找自身或所有子节点中指定类型的组件
        const huanfuItems: huanfuItemTs[] = this.node.parent.getComponentsInChildren(huanfuItemTs)
        // 遍历装修列表中的所有zxItemTs组件
        for (let i = 0; i < huanfuItems.length; i++) {
            // 获取当前DecItem组件
            const huanfuItem: huanfuItemTs = huanfuItems[i];
            // 更新DecItem组件的数据
            huanfuItem.updateData()
        }
        // 输出解锁成功的日志信息
        tishiMgr.titleTips(gameData.main, '成功解锁新风格')
    }
    /**
         * 更新装饰物品的数据。
         * 该方法会根据当前装饰物品的状态更新按钮的显示状态和条件标签的文本内容。
         */
    updateData(): void {
        // 获取当前装饰物品的id
        const id: number = this.id
        // 设置当前装饰物品的解锁状态
        this.shifouJiesuo = huanfuMgr.shifouJiesuo(id)
        // 设置当前装饰物品的使用状态
        this.shifouUse = huanfuMgr.isShiyong(id)
        // 设置使用状态的显示状态
        this.shiyongIng.active = this.shifouUse
        // 设置使用按钮的显示状态
        this.shiyongBtn.active = !this.shifouUse && this.shifouJiesuo
        // 设置解锁按钮的显示状态
        this.jiesuoBtn.active = !this.shifouJiesuo
    }
}


