import BearerConfig from './BearerConfig'
import fbemitter from 'fbemitter'
import Events from './EventNames'
import postRobot from 'post-robot'

const BEARER_WINDOW_KEY = 'BEARER'
const IFRAME_NAME = 'BEARER-IFRAME'
const AUTHORIZED = 'true'

class Bearer {
  static emitter: fbemitter.EventEmitter = new fbemitter.EventEmitter()
  private static _instance: Bearer
  public static init(config: any): Bearer {
    if (process.env.NODE_ENV === 'development') {
      if (this._instance) {
        console.warn('One instance is already configured, reaplacing it')
      }
    }

    this._instance = new Bearer(config || {})

    return this.instance
  }

  public static get instance(): Bearer {
    return this._instance || this.init({})
  }

  public static get config(): BearerConfig {
    return this.instance.bearerConfig
  }

  static get version() {
    return 'LIB_VERSION'
  }

  private iframe: HTMLIFrameElement
  private isSessionInitialized: boolean = false
  private allowIntegrationRequests: () => void
  private _maybeInitialized: Promise<boolean>

  constructor(args) {
    this.bearerConfig = new BearerConfig(args || {})
    this.maybeInitialized = new Promise((resolve, reject) => {
      this.allowIntegrationRequests = resolve
    })
    this.initSession()
  }

  get bearerConfig(): BearerConfig {
    return window[BEARER_WINDOW_KEY]
  }

  set bearerConfig(config: BearerConfig) {
    window[BEARER_WINDOW_KEY] = config
  }

  get maybeInitialized(): Promise<boolean> {
    if (!this.isSessionInitialized) {
      console.warn('Waiting Bearer to be initialized')
    }
    return this._maybeInitialized
  }

  set maybeInitialized(promise) {
    this._maybeInitialized = promise
  }

  // messageReceived = ({ data: { event_id, data } }) => {
  //   switch (event_id) {
  //     case Events.BEARER_AUTHORIZED: {
  //       console.log('[BEARER]', 'Scenario authorized', data['scenarioId'])
  //       const scenarioId: string = data['scenarioId']
  //       localStorage.setItem(authorizedKey(scenarioId), AUTHORIZED)
  //       Bearer.emitter.emit(Events.SCENARIO_AUTHORIZED, {
  //         authorized: true,
  //         scenarioId
  //       })
  //       break
  //     }
  //   }
  // }
  static onAuthorized = (
    scenarioId: string,
    callback: (authorize: boolean) => void
  ) =>
    Bearer.emitter.addListener(Events.SCENARIO_AUTHORIZED, () => {
      callback(true)
    })

  static onRevoked = (
    scenarioId: string,
    callback: (authorize: boolean) => void
  ) =>
    Bearer.emitter.addListener(Events.SCENARIO_REVOKED, () => {
      callback(false)
    })

  authorized = (scenarioId: string) =>
    Bearer.emitter.emit(Events.SCENARIO_AUTHORIZED, { scenarioId })

  revoked = (scenarioId: string) =>
    Bearer.emitter.emit(Events.SCENARIO_REVOKED, { scenarioId })

  hasAuthorized = (scenarioId): Promise<boolean> =>
    new Promise((resolve, reject) => {
      postRobot
        .send(this.iframe, Events.HAS_AUTHORIZED, {
          scenarioId: scenarioId,
          integrationId: Bearer.config.integrationId
        })
        .then(data => {
          console.log('[BEARER]', 'data', data)
          data.authorized ? resolve(true) : reject(false)
        })
        .catch(e => {
          console.log('[BEARER]', 'e', e)
        })
    })

  revokeAuthorization = (scenarioId: string): void => {
    // TODO: revoke
    // localStorage.setItem(authorizedKey(scenarioId), undefined)
    // Bearer.emitter.emit(Events.SCENARIO_AUTHORIZED, {
    //   authorized: this.hasAuthorized(scenarioId),
    //   scenarioId
    // })
  }

  initSession() {
    if (
      typeof window !== 'undefined' &&
      !document.querySelector(`#${IFRAME_NAME}`)
    ) {
      postRobot.on(Events.SESSION_INITIALIZED, event => {
        this.sessionInitialized(event)
      })
      postRobot.on(Events.AUTHORIZED, this.authorized)
      postRobot.on(Events.SCENARIO_REVOKED, this.revoked)

      this.iframe = document.createElement('iframe')
      this.iframe.src = `${this.bearerConfig.integrationHost}v1/user/initialize`
      this.iframe.id = IFRAME_NAME
      this.iframe.width = '0'
      this.iframe.height = '0'
      this.iframe.frameBorder = '0'
      document.body.appendChild(this.iframe)
    }
  }

  private sessionInitialized(_event) {
    console.log('[BEARER]', 'session initialized')
    this.isSessionInitialized = true
    this.allowIntegrationRequests()
  }

  askAuthorizations({ scenarioId, setupId }) {
    if (this.isSessionInitialized) {
      const AUTHORIZED_URL = `${
        Bearer.config.integrationHost
      }v1/auth/${scenarioId}?setup_id=${setupId}`
      window.open(
        AUTHORIZED_URL,
        '',
        'resizable,scrollbars,status,centerscreen=yes,width=500,height=600'
      )
      return true
    }
    return false
  }
}

// function authorizedKey(scenarioId) {
//   return `authorized_${scenarioId}`
// }

export default Bearer
