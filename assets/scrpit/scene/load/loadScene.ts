import { _decorator, Component, director, math, Node, profiler, ProgressBar, Slider } from 'cc';
import { resMgr } from '../../managers/resMgr';
import { resPath } from '../../configs/pathName';
import { gameData } from '../../configs/gameData';
const { ccclass, property } = _decorator;

@ccclass('loadScene')
export class loadScene extends Component {
    // 进度条
    @property(ProgressBar)
    private jinDuTiao: ProgressBar
    // 滑动器
    @property(Slider)
    private huaDongQi: Slider
    // 滑动器节点
    @property(Node)
    private huaDongQiBtn: Node
    // 奔跑猫节点
    @property(Node)
    private runCat: Node
    // 是否已经加载完成
    private loadOk: boolean = false
    nowMaxJindu: number = 0
    start() {
        profiler.hideStats();
        // 开启进度条更新的调度, 每0.1秒更新一次
        this.schedule(() => { this.jiaZaiJinDu(this.nowMaxJindu) }, 0.01)
        this.loadRes()
    }
    update(deltaTime: number) {
        this.runCat.setPosition(this.huaDongQiBtn.getPosition())
    }
    /**
        * 更新加载进度条
        * 该方法会随机增加进度条的进度，并在资源加载完成后加载主场景
        */
    jiaZaiJinDu(val: number = 0.9) {
        // 随机增加进度条的进度,cocos封装的方法
        let suijiJIndu = math.randomRange(0.01, 0.03)
        let nowJindu = this.jinDuTiao.progress + suijiJIndu
        // 返回 nowJindu 和 0.9 中较小的那个值,如果nowJindu超过0.9，那就一直返回0.9
        this.jinDuTiao.progress = Math.min(nowJindu, val)
        this.huaDongQi.progress = Math.min(nowJindu, val)
        // 如果资源已经加载完成
        if (this.loadOk) {
            // 将进度条的进度设置为1.0
            this.jinDuTiao.progress = 1
            this.huaDongQi.progress = 1
            // 取消进度条更新的调度
            this.unscheduleAllCallbacks()
            // this.unschedule(this.jiaZaiJinDu);
            // 在0.1秒后加载主场景
            this.scheduleOnce(() => {
                if (gameData.putongLevel == 1) {
                    director.loadScene('game')
                } else {
                    director.loadScene('main')
                }
            }, 0.1)
        }
    }
    /**
     * 加载多个资源目录
     * 该方法会依次加载资源、图标、字体、音频、UI 和游戏资源目录
     * 当所有资源加载完成后，设置 loaded 标志为 true
     */
    async loadRes() {
        this.nowMaxJindu = 0.2
        await resMgr.ins.loadRes('other', resPath.img)
        this.nowMaxJindu = 0.4
        // 加载预制体目录
        await resMgr.ins.loadRes('prefabs', resPath.prefabs)
        this.nowMaxJindu = 0.5
        // 加载图片目录
        await resMgr.ins.loadRes('image', resPath.img)
        this.nowMaxJindu = 0.7
        // 加载音乐目录
        await resMgr.ins.loadRes('audio', resPath.audio)
        // 资源加载完成
        this.loadOk = true
    }
}


