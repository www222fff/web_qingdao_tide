export interface Env {
  MY_KV: KVNamespace;
}

const BASE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const KV_KEY = 'tide_data_daily';

/**
 * 拉取潮汐数据（cron 使用）
 */
async function getTideData() {
  const url =
    `${BASE_URL}?latitude=36.0649&longitude=120.3804` +
    `&hourly=sea_level_height_msl` +
    `&timezone=Asia%2FSingapore` +
    `&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Tide API failed: ${res.status}`);
  }

  return res.json();
}

/**
 * JSON Response helper
 */
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
  });
}

export default {
  /**
   * 对外 GET API
   * GET /api/tide
   */
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === 'GET' && url.pathname === '/api/tide') {
      const cached = await env.MY_KV.get(KV_KEY, 'json');

      if (!cached) {
        return json(
          { message: 'Tide data not available yet' },
          404
        );
      }

      return json(cached.data);
    }

    return json({ message: 'Not Found' }, 404);
  },

  /**
   * 每天 0 点定时更新 KV
   */
  async scheduled(
    _: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    ctx.waitUntil(
      (async () => {
        try {
          const data = await getTideData();

          await env.MY_KV.put(
            KV_KEY,
            JSON.stringify({
              data,
              fetchedAt: new Date().toISOString(),
            })
          );

          console.log('[TideCron] Updated');
        } catch (e) {
          console.error('[TideCron] Failed', e);
        }
      })()
    );
  },
};
