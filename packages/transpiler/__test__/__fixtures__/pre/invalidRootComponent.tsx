import {
  BearerFetch,
  BearerState,
  Intent,
  IntentType,
  RootComponent
} from '@bearer/core'

@RootComponent({
  group: 'attach-pull-request',
  role: 'display',
  shadow: false
})
export class AttachPullRequestDisplay {
  @Intent('ListRepositories')
  fetcher: BearerFetch
  @RetrieveStateIntent()
  retrieve: BearerFetch
  @BearerState()
  attachedPullRequests: Array<any>
  @BearerState({ statePropName: 'goats' })
  ducks: Array<any>
  @Intent('getPullRequest', IntentType.FetchData)
  fetchResource: BearerFetch

  render() {
    return <bearer-scrollable fetcher={this.fetcher} />
  }
}
