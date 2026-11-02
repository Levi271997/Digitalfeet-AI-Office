import { ActivityFeed } from '@/components/ActivityFeed';
import { OfficeFloor } from '@/components/OfficeFloor';
import { TaskForm } from '@/components/TaskForm';

export default function FloorPage() {
  return (
    <div className="page">
      <main className="main">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 24 }}>Floor 1</h1>
          <div className="row muted">
            <span className="row"><span className="dot dot-working" />Working</span>
            <span className="row"><span className="dot dot-waiting" />Waiting for you</span>
            <span className="row"><span className="dot dot-idle" />Idle</span>
          </div>
        </div>
        <OfficeFloor />
      </main>
      <aside className="side card" aria-label="Live activity">
        <h2 style={{ fontSize: 18 }}>Live activity</h2>
        <ActivityFeed />
        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: 0 }} />
        <TaskForm />
      </aside>
    </div>
  );
}
