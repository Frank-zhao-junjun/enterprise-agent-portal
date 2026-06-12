/**
 * 获取所有可用领域本体
 * GET /api/domains
 */
import { getAllDomains } from '@/lib/domain-registry';

export async function GET() {
  return new Response(
    JSON.stringify({ domains: getAllDomains() }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
