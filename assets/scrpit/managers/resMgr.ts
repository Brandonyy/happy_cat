import { _decorator, assetManager, AssetManager, AudioClip, Component, Node, Prefab, SpriteFrame } from 'cc';
import { poolMgr } from './poolMgr';
const { ccclass, property } = _decorator;
type Bundle = AssetManager.Bundle
// 该脚本中Log的名称
let log = 'resMgr'
@ccclass('resMgr')
export class resMgr extends Component {
    // 储存音乐
    allAudio: { [key: string]: AudioClip } = {};
    // 储存SpriteFrame
    allImg: { [key: string]: SpriteFrame } = {};
    /**
     * 单例
     */
    private static _ins: resMgr = null;
    public static get ins() {
        if (!this._ins) {
            this._ins = new resMgr();
        }
        return this._ins;
    }
    /**
     * 加载资源包
     * @param Bundle - 资源包的名称
     * @param callBack - 资源包加载完成后的回调函数，默认为 null
     * @returns 当资源包加载完成时解析的 Promise
     */
    public async loadBundle(Bundle: string,) {
        return new Promise<Bundle>((resolve, reject) => {
            // 加载资源包，并在加载完成后调用回调函数
            assetManager.loadBundle(Bundle, (err: Error, bundle: Bundle) => {
                if (err) {
                    console.log(log, `资源包${Bundle}加载失败：报错：${err}`);
                    // 如果加载过程中发生错误，记录错误并拒绝 Promise
                    reject(err)
                } else {
                    console.log(log, `资源包${Bundle}加载完成......`, bundle);
                    resolve(bundle)
                }
            })
        })
    }
    /**
    * 从指定的资源包中加载资源
    */
    loadRes(Bundle: string, type) {
        return new Promise(async (resolve, reject) => {
            // 构建资源的完整路径
            console.log(log, `开始加载资源包${Bundle}下的文件`);
            // 获取资源包
            let bundle: Bundle = assetManager.getBundle(Bundle)
            // 如果资源包不存在，则加载资源包
            if (!bundle) {
                bundle = await this.loadBundle(Bundle)
            }
            // deBug.log(log, `从指定的资源包${Bundle}中加载资源`, bundle)
            bundle.loadDir(type.path, type.type, (err: any, assets: any[]) => {
                if (err) {
                    // 如果发生错误，记录错误并解决 Promise
                    console.log(log, `指定资源包${Bundle}中加载资源失败，报错：`, err);
                    reject(err)
                } else {
                    let linShiAss = null;
                    // 遍历加载的资源
                    switch (type.type) {
                        // 玩家及场景元素预制体
                        case Prefab:
                            for (let i = 0; i < assets.length; i++) {
                                linShiAss = assets[i];
                                const name = linShiAss.data.name as string;
                                poolMgr.ins.setPrefab(name, linShiAss);
                            }
                            break;
                        // 音乐资源
                        case AudioClip:
                            for (let i = 0; i < assets.length; i++) {
                                linShiAss = assets[i];
                                if (!this.allAudio[linShiAss.name]) {
                                    this.allAudio[linShiAss.name] = linShiAss;

                                }
                            }
                            break;
                        // 图片资源
                        case SpriteFrame:
                            for (let i = 0; i < assets.length; i++) {
                                linShiAss = assets[i];
                                if (!this.allImg[linShiAss.name]) {
                                    this.allImg[linShiAss.name] = linShiAss;
                                }
                            }
                            break;
                    }
                    resolve(assets)
                }
            })
        })
    }
    /**
    * 获取已缓存图片资源数据
    */
    public getImg(name: string) {
        return this.allImg[name];
    }
    /**
  * 获取音乐数据
  */
    public getClip(name: string) {
        return this.allAudio[name];
    }

}


