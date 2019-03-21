import { DBClient as CLIENT } from './db-client'

export * from './declaration'
export { FetchData } from './functions/fetch'

// tslint:disable-next-line:variable-name
export const DBClient = CLIENT.instance
