import NodeCache from 'node-cache'

const cache = new NodeCache({
  stdTTL: Number(process.env.CACHE_TTL_SECONDS) || 60,
  checkperiod: 120,
  useClones: false,
})

export default cache
