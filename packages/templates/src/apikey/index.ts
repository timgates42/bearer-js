export default {
  SaveState: `
  static action(
    _context: TAPIKEYAuthContext,
    _params: any,
    body: any,
    state: any,
    callback: TSaveStateCallback
  ): void {
    const { item: { name } } = body
    const { items = [] }: any = state
    const newItem: any = { name }

    callback({
      state: {
        ...state,
        items: [...items, newItem]
      },
      data: [...items, newItem]
    })
  }
  `,
  RetrieveState: `
  static action(_context: TAPIKEYAuthContext, _params: any, state, callback: TRetrieveStateCallback) {
    callback({ data: state })
  }
  `,
  FetchData: `
  static action(context: TAPIKEYAuthContext, params: any, body: any, callback: TFetchDataCallback) {
    //... your code goes here
    // use the client defined in client.ts to fetch real object like that:
    // Client(context.authAccess.apiKey).get('/people')
    //   .then(({ data }) => {
    //     callback({ data })
    //   })
    //   .catch((error) => {
    //     callback({ error: error.toString() })
    //   })
    callback({ data: []})
  }
  `
}


