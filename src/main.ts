import 'reflect-metadata'
import { App } from './app'
import { config } from './configs'
import { LadBrokeRoute } from './modules/data-sport/lad-brokes/lad-broke.route'

const app = new App(config, [
    {
        version: 'v1',
        groups: [
            {
                routes: [LadBrokeRoute],
            },
        ],
    },
])

app.start()
