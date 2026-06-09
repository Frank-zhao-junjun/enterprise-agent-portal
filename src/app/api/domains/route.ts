/**
 * 获取所有可用领域本体
 * GET /api/domains
 */
import { ALL_DOMAINS } from '@/lib/domain-registry';

export async function GET() {
  return new Response(
    JSON.stringify({ domains: ALL_DOMAINS }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
