import {
    _decorator,
    assetManager,
    AssetManager,
    AudioClip,
    Component,
    Node,
    Prefab,
    SpriteFrame
} from 'cc';
import { poolMgr } from './poolMgr';
const { ccclass, property } = _decorator;
type Bundle = AssetManager.Bundle;
let log = 'resMgr';
@ccclass('resMgr')
export class resMgr extends Component {
    // 同名音乐和图片只缓存首次加载的资源。
    allAudio: { [key: string]: AudioClip } = {};
    allImg: { [key: string]: SpriteFrame } = {};
    /** 单例 */
    private static _ins: resMgr = null;

    public static get ins() {
        if (!this._ins) {
            this._ins = new resMgr();
        }
        return this._ins;
    }

    /** 加载资源包 */
    public async loadBundle(bundleName: string) {
        return new Promise<Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err: Error, bundle: Bundle) => {
                if (err) {
                    console.log(log, `资源包${bundleName}加载失败：报错：${err}`);
                    reject(err);
                } else {
                    console.log(log, `资源包${bundleName}加载完成......`, bundle);
                    resolve(bundle);
                }
            });
        });
    }

    /** 获取或加载资源包，再加载目录并登记资源；保留原有异步和错误处理方式。 */
    loadRes(bundleName: string, type) {
        return new Promise(async (resolve, reject) => {
            console.log(log, `开始加载资源包${bundleName}下的文件`);
            let bundle: Bundle = assetManager.getBundle(bundleName);
            if (!bundle) {
                bundle = await this.loadBundle(bundleName);
            }
            bundle.loadDir(type.path, type.type, (err: any, assets: any[]) => {
                if (err) {
                    console.log(log, `指定资源包${bundleName}中加载资源失败，报错：`, err);
                    reject(err);
                } else {
                    this.cacheLoadedAssets(type.type, assets);
                    resolve(assets);
                }
            });
        });
    }

    /** 获取已缓存图片资源数据 */
    public getImg(name: string) {
        return this.allImg[name];
    }

    /** 获取音乐数据 */
    public getClip(name: string) {
        return this.allAudio[name];
    }

    /** 按资源类型登记预制体，或缓存首次加载的音乐、图片。 */
    private cacheLoadedAssets(assetType, assets: any[]) {
        let asset = null;
        switch (assetType) {
            case Prefab:
                for (let i = 0; i < assets.length; i++) {
                    asset = assets[i];
                    const name = asset.data.name as string;
                    poolMgr.ins.setPrefab(name, asset);
                }
                break;
            case AudioClip:
                for (let i = 0; i < assets.length; i++) {
                    asset = assets[i];
                    if (!this.allAudio[asset.name]) {
                        this.allAudio[asset.name] = asset;
                    }
                }
                break;
            case SpriteFrame:
                for (let i = 0; i < assets.length; i++) {
                    asset = assets[i];
                    if (!this.allImg[asset.name]) {
                        this.allImg[asset.name] = asset;
                    }
                }
                break;
        }
    }
}
