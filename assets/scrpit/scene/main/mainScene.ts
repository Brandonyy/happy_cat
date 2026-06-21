import { _decorator, Component, director, Label, Node, profiler } from 'cc';
import { gameData } from '../../configs/gameData';
import { tishiMgr } from '../../managers/tishiMgr';
import { gameMoshi } from '../../configs/gameMoshi';
import { poolMgr } from '../../managers/poolMgr';
import { musicMgr } from '../../managers/musicMgr';
import { dayflMgr } from '../../managers/dayflMgr';
import { adMgr } from '../../adWxDy/adMgr';
import { apiMgr } from '../../adWxDy/apiMgr';
import { eventType, pingtai } from '../../configs/pathName';
import { bendiUtil } from '../../utils/bendiUtil';
const { ccclass, property } = _decorator;

@ccclass('mainScene')
export class mainScene extends Component {
    @property(Label)
    level: Label
    protected onLoad(): void {
        // 收藏有礼
        director.on(eventType.addToMini, this.isAddToMini, this)
    }
    start() {
        this.init()
    }
    init() {
        profiler.hideStats();
        // 播放主界面音乐
        musicMgr.ins.playMusic('主界面音乐')
        gameData.main = this.node
        gameData.tcNode = this.node.getChildByName('tcNode')
        // 按钮显示关卡
        this.level.string = `第${gameData.putongLevel}关`;
        // weixin
        // adMgr.showBanner()
        this.isAddToMini()
        adMgr.showChaPing()
        apiMgr.topFenXiang()
        // dy
        this.isXianshiCebian()
    }
    /**
        * 微信游戏是否添加到我的小程序
        */
    isAddToMini() {
        if (gameData.pingtai == pingtai.wx) {
            const isAdd = bendiUtil.getItem('isAddToMini') || false
            console.log('isAdd', isAdd);
            if (isAdd) {
                console.log(this.node.getChildByPath('topUI/shoucang'));
                this.node.getChildByPath('topUI/shoucang').active = false
            } else {
                this.node.getChildByPath('topUI/shoucang').active = true
            }
        } else {
            this.node.getChildByPath('topUI/shoucang').active = false
        }
    }
    /**
    * 检测是否需要显示侧边栏按钮
    */
    isXianshiCebian() {
        if (gameData.pingtai == pingtai.dy) {
            apiMgr.checkSidebar(() => {
                this.node.getChildByPath('topUI/cebian').active = true
            }, () => {
                this.node.getChildByPath('topUI/cebian').active = false
            })
        } else {
            this.node.getChildByPath('topUI/cebian').active = false
        }
    }
    /**
     * 分享好友
     */
    onFenxiang() {
        apiMgr.fenXiang()
    }
    /**
     * 家园
     */
    onHome() {
        poolMgr.ins.getPoolNode('homePop', gameData.tcNode)
    }
    /**
    * 排名
    */
    onRank() {
        poolMgr.ins.getPoolNode('rankPop', gameData.main)
    }
    /**
     * 抽奖
     */
    onChoujiang() {
        poolMgr.ins.getPoolNode('choujiangView', gameData.tcNode)
    }
    /**
    * 更换皮肤
    */
    onHuanfu() {
        poolMgr.ins.getPoolNode('huanfuPop', gameData.main)
    }
    /**
    * 每日福利
    */
    onDayfl() {
        if (!dayflMgr.IsLingqu) {
            tishiMgr.titleTips(gameData.main, '您今日已领取过福利')
            return
        } else {
            dayflMgr.getfl()
        }
    }
    /**
     * 游戏设置
     */
    onShezhi() {
        poolMgr.ins.getPoolNode('shezhiPop', gameData.tcNode)
    }
    /**
   * 过关奖励
   */
    onjiangli() {
        poolMgr.ins.getPoolNode('guoguanJiangliPop', gameData.main)
    }
    /**
    * 侧边栏按钮
    */
    onCebian() {
        poolMgr.ins.getPoolNode('cebianlanPop', gameData.main)
    }
    /**
  * 收藏有礼
  */
    onShoucang() {
        poolMgr.ins.getPoolNode('shoucangPop', gameData.main)
    }
    /**
         * 打开图鉴
         */
    tujiBtn() {
        poolMgr.ins.getPoolNode('tujiPop', gameData.main)
    }
    /**
     * 开始游戏-挑战模式
     */
    tiaozhanBtn() {
        if (gameData.putongLevel < 10) {
            tishiMgr.titleTips(gameData.main, '通关10关后解锁')
            return
        }
        musicMgr.ins.stopMusic()
        gameData.moshi = gameMoshi.tiaozhan
        director.loadScene('game')
    }
    /**
   * 开始游戏-普通模式
   */
    putongBtn() {
        musicMgr.ins.stopMusic()
        // 处理按钮点击事件（btnExtendTs中接收）
        gameData.moshi = gameMoshi.putong
        director.loadScene('game')
    }
}


