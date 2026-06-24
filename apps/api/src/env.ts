import path from 'node:path'

import { config as loadEnv } from 'dotenv'

loadEnv({ path: path.resolve(process.cwd(), '../../.env') })
