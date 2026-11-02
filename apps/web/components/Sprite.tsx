import type { AgentProfile } from '@ai-office/shared';

/** A 10×14 pixel character, coloured per agent. */
export function Sprite({ agent, scale = 4 }: { agent: AgentProfile; scale?: number }) {
  const { hair, skin, shirt } = agent.sprite;
  return (
    <svg className="sprite" role="img" aria-label={`${agent.name}, ${agent.role}`} width={10 * scale} height={14 * scale} viewBox="0 0 10 14">
      <rect x="2" y="0" width="6" height="2" fill={hair} />
      <rect x="1" y="1" width="1" height="3" fill={hair} />
      <rect x="8" y="1" width="1" height="3" fill={hair} />
      <rect x="2" y="2" width="6" height="4" fill={skin} />
      <rect x="3" y="3" width="1" height="1" fill="#141A2A" />
      <rect x="6" y="3" width="1" height="1" fill="#141A2A" />
      <rect x="1" y="6" width="8" height="5" fill={shirt} />
      <rect x="0" y="7" width="1" height="3" fill={skin} />
      <rect x="9" y="7" width="1" height="3" fill={skin} />
      <rect x="2" y="11" width="2" height="3" fill="#2B2F3A" />
      <rect x="6" y="11" width="2" height="3" fill="#2B2F3A" />
    </svg>
  );
}
