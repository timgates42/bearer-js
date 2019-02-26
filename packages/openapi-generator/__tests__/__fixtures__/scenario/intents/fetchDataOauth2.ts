import { FetchData, TFetchActionEvent, TFetchPromise, TOAUTH2AuthContext } from '@bearer/intents'

import { PullRequest } from '../views/types'

export default class SearchPullRequestsIntent extends FetchData
  implements FetchData<ReturnedData, any, TOAUTH2AuthContext> {
  async action(event: TFetchActionEvent<Params, TOAUTH2AuthContext>): TFetchPromise<ReturnedData> {
    return { data: [] }
  }
}

type ParamsId = {
  id: string
}

type ParamsSearch = {
  name: string
  query: string
}

export type ReturnedData = PullRequest[]
export type Params = ParamsId | ParamsSearch
