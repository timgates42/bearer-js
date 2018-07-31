import { Component } from '@bearer/core'

@Component({
  tag: '{{componentTagName}}',
  styleUrl: '{{fileName}}.css',
  shadow: true
})
export class {{componentName}} {
  render() {
    return (
      <div class="root">
        <bearer-typography as="h2">
          {{componentName}} Component
        </bearer-typography>
      </div>
    )
  }
}
