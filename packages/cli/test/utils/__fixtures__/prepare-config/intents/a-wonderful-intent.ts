import { SaveState } from '@bearer/intents'

export default class MyIntent extends SaveState implements SaveState {
  action = async (_event: any) => {
    return { data: 'something', state: 'something' }
  }
}
