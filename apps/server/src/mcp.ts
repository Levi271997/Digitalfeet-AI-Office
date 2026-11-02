import type { McpServerConfig } from '@anthropic-ai/claude-agent-sdk';

/**
 * Remote MCP connectors, read from env. A connector is only added when its
 * URL is set, so the office runs with none configured.
 *
 * The SDK will not run an OAuth sign-in for a headless server: a server that
 * needs one shows up as "needs-auth" and its tools are simply missing. Get a
 * token for each service yourself and set <NAME>_MCP_TOKEN.
 */
const CONNECTORS = ['clickup', 'monday', 'figma', 'canva', 'fireflies', 'wordpress', 'netlify'] as const;

export function mcpServers(): Record<string, McpServerConfig> {
  const servers: Record<string, McpServerConfig> = {};
  for (const name of CONNECTORS) {
    const url = process.env[`${name.toUpperCase()}_MCP_URL`];
    if (!url) continue;
    const token = process.env[`${name.toUpperCase()}_MCP_TOKEN`];
    servers[name] = {
      type: 'http',
      url,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    };
  }
  return servers;
}
