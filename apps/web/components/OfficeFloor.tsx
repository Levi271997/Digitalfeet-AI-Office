'use client';

import Link from 'next/link';
import { ROOMS } from '@ai-office/shared';
import { useOffice } from '@/lib/office-context';
import { Sprite } from './Sprite';

export function OfficeFloor() {
  const { agents } = useOffice();

  return (
    <div className="floor-grid">
      {ROOMS.map((room) => {
        const here = agents.filter((a) => a.room === room.id);
        return (
          <section key={room.id} className="room" aria-label={room.label}>
            <div className="room-label pixel">{room.label}</div>

            {here
              .filter((a) => a.activity)
              .map((a) => (
                <div key={a.id} className={`bubble ${a.status === 'waiting' ? 'bubble-waiting' : ''}`}>
                  <span className={`dot dot-${a.status}`} style={{ marginTop: 4 }} />
                  <span>
                    <strong>{a.name}:</strong> {a.activity}
                  </span>
                </div>
              ))}

            <div className="room-floor">
              {here.map((a) => (
                <Link key={a.id} href={`/agents/${a.id}`} className="agent-link" data-status={a.status}>
                  <Sprite agent={a} />
                  <span className="nameplate pixel">{a.name}</span>
                </Link>
              ))}
              {room.id !== 'meeting' && <div className="desk" aria-hidden="true" />}
            </div>
          </section>
        );
      })}
    </div>
  );
}
