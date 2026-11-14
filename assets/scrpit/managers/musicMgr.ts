import { _decorator, AudioSourceComponent, Component, Node } from 'cc';
import { resMgr } from './resMgr';
import { shezhiMgr } from './shezhiMgr';
const { ccclass, property } = _decorator;
@ccclass('musicMgr')
export class musicMgr extends Component {
    private soundComp: AudioSourceComponent = null;
    private bgmComp: AudioSourceComponent = null;
    /** 单例 */
    private static _ins: musicMgr = null!;

    public static get ins() {
        if (!this._ins) {
            this._ins = new musicMgr();
            this._ins.initAudio();
        }
        return this._ins;
    }

    /** 初始化音频组件 */
    private initAudio() {
        this.soundComp = new AudioSourceComponent();
        this.soundComp.loop = false;
        this.bgmComp = new AudioSourceComponent();
        this.bgmComp.loop = true;
    }

    /** 停止背景音乐 */
    public stopMusic() {
        this.bgmComp.stop();
    }

    /** 设置音量 */
    public setVolume(val) {
        this.bgmComp.volume = val;
    }

    /** 播放音乐 */
    public async playMusic(audio: string) {
        const clip = await resMgr.ins.getClip(audio);
        this.bgmComp.volume = shezhiMgr.YinyueValue;
        this.bgmComp.clip = clip;
        this.bgmComp.play();
    }

    /** 播放一次性音效 */
    public async playSound(audio: string, volumeScale: number = 1) {
        const clip = await resMgr.ins.getClip(audio);
        this.soundComp.playOneShot(clip, shezhiMgr.YinxiaoValue * volumeScale);
    }
}
