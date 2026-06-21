import { _decorator, Button, Component, EventHandler, Node } from 'cc';
import { musicMgr } from '../managers/musicMgr';
import { eventType } from '../configs/pathName';
const { ccclass, property } = _decorator;

@ccclass('btnTouchYh')
export class btnTouchYh extends Component {
    // 点击音效
    private touchSound: string = '点击';
    // 按钮节点
    private btn: Button = null
    // 是否可以点击按钮
    private isDianji: boolean = true
    // 点击事件列表
    private dianjiEvent: EventHandler[]
    // range: [0, 1, 0.1]：设置数值属性的取值范围和步长，确保用户只能输入特定范围内的值。slide: true：启用滑动条控件，方便用户通过拖动滑块来调整数值。
    // safeTime：一个数值类型的属性，初始值为 0.5，取值范围为 0 到 1，步长为 0.1。
    @property({ range: [0, 1, 0.1], slide: true })
    public safeTime: number = 0.7
    /**
     * 生命周期方法，在节点加载后调用
     */
    onLoad() {
        // 获取当前节点上的 Button 组件
        this.btn = this.getComponent(Button);
        // 注册屏幕点击事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchSoun, this);
        // 监听自定义的 Click 事件，并绑定 onClick 方法
        this.btn.node.on(eventType.click, this.onTouch, this)
    }
    /**
           * 处理按钮的点击音效
           * 当按钮被点击时，会播放指定的音效
           */
    onTouchSoun() {
        // 播放点击音效
        this.touchSound && musicMgr.ins.playSound(this.touchSound)
    }
    /**
     * 处理按钮的安全点击机制
     * 当按钮被点击时，会有一个安全时间间隔，在这个时间间隔内，按钮的点击事件会被禁用
     * 这样可以防止按钮被连续点击，导致游戏逻辑出现问题
     */
    onTouch() {
        if (!this.isDianji) return
        // 设置当前状态为不安全
        this.isDianji = false
        // 获取当前按钮的点击事件列表
        this.dianjiEvent = this.btn.clickEvents
        // 清空当前按钮的点击事件列表
        this.btn.clickEvents = []
        // 在安全时间间隔后，恢复按钮的点击事件列表
        this.scheduleOnce(() => {
            this.isDianji = true
            this.btn.clickEvents = this.dianjiEvent
        }, this.safeTime)
    }

}


