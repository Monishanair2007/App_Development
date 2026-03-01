import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Plus, UserPlus, UserMinus } from 'lucide-react';

export default function ClubDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [tab, setTab] = useState('discussions');
  const [isMember, setIsMember] = useState(false);
  const [showDiscForm, setShowDiscForm] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [discForm, setDiscForm] = useState({ title: '', content: '', has_spoiler: false });
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''] });
  const [activeDisc, setActiveDisc] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSpoiler, setCommentSpoiler] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState({});

  useEffect(() => {
    api.getClub(id).then(c => { setClub(c); setIsMember(c.members?.some(m => m.id === user?.id)); }).catch(console.error);
    api.getDiscussions(id).then(setDiscussions).catch(console.error);
    api.getPolls(id).then(setPolls).catch(console.error);
  }, [id]);

  const join = async () => { await api.joinClub(id); setIsMember(true); setClub(c => ({ ...c, member_count: c.member_count + 1 })); };
  const leave = async () => { if (!confirm('Leave this club?')) return; await api.leaveClub(id); setIsMember(false); };
  const createDisc = async () => {
    if (!discForm.title || !discForm.content) return;
    await api.createDiscussion(id, { ...discForm, has_spoiler: discForm.has_spoiler ? 1 : 0 });
    setShowDiscForm(false); setDiscForm({ title: '', content: '', has_spoiler: false });
    api.getDiscussions(id).then(setDiscussions);
  };
  const openDisc = async (disc) => { setActiveDisc(disc); setComments(await api.getComments(id, disc.id)); };
  const postComment = async () => {
    if (!newComment.trim()) return;
    await api.addComment(id, activeDisc.id, { content: newComment, has_spoiler: commentSpoiler ? 1 : 0 });
    setNewComment(''); setCommentSpoiler(false);
    setComments(await api.getComments(id, activeDisc.id));
  };
  const createPoll = async () => {
    if (!pollForm.question || pollForm.options.filter(Boolean).length < 2) return;
    await api.createPoll(id, { question: pollForm.question, options: pollForm.options.filter(Boolean) });
    setShowPollForm(false); setPollForm({ question: '', options: ['', ''] });
    api.getPolls(id).then(setPolls);
  };
  const vote = async (pollId, option) => { await api.votePoll(id, pollId, option); api.getPolls(id).then(setPolls); };

  if (!club) return <div className="page"><div className="skeleton" style={{ height: 100, borderRadius: 12 }} /></div>;

  return (
    <div className="page">
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 4 }}>{club.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>{club.member_count} members · by {club.owner_name}</p>
            {club.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{club.description}</p>}
          </div>
          {isMember ? <button className="btn btn-danger btn-sm" onClick={leave}><UserMinus size={14} /> Leave</button> : <button className="btn btn-primary btn-sm" onClick={join}><UserPlus size={14} /> Join Club</button>}
        </div>
      </div>

      {activeDisc ? (
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveDisc(null)} style={{ marginBottom: 16 }}>← Back</button>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>{activeDisc.title}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>by {activeDisc.author_name}</p>
            {activeDisc.has_spoiler === 1 && !spoilerRevealed['disc'] ? (
              <div onClick={() => setSpoilerRevealed(p => ({...p, disc: true}))} style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', color: 'var(--text-muted)' }}>⚠ Spoiler — click to reveal</div>
            ) : <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{activeDisc.content}</p>}
          </div>
          <div className="section-title" style={{ marginBottom: 12 }}>Comments ({comments.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {comments.map(c => (
              <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                  <div className="avatar" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>{c.author_name?.[0]?.toUpperCase()}</div>
                  <strong style={{ fontSize: '0.875rem' }}>{c.author_name}</strong>
                  {c.has_spoiler === 1 && <span style={{ fontSize: '0.7rem', background: 'rgba(252,92,125,0.1)', color: 'var(--accent-2)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>SPOILER</span>}
                </div>
                {c.has_spoiler === 1 && !spoilerRevealed[c.id] ? (
                  <div onClick={() => setSpoilerRevealed(p => ({...p, [c.id]: true}))} style={{ background: 'var(--bg-hover)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}>⚠ Click to reveal</div>
                ) : <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{c.content}</p>}
              </div>
            ))}
          </div>
          {isMember && (
            <div>
              <textarea className="input" placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} style={{ marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer' }}><input type="checkbox" checked={commentSpoiler} onChange={e => setCommentSpoiler(e.target.checked)} /> Spoiler</label>
                <button className="btn btn-primary btn-sm" onClick={postComment}>Post</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab${tab === 'discussions' ? ' active' : ''}`} onClick={() => setTab('discussions')}>Discussions</button>
            <button className={`tab${tab === 'polls' ? ' active' : ''}`} onClick={() => setTab('polls')}>Polls</button>
            <button className={`tab${tab === 'members' ? ' active' : ''}`} onClick={() => setTab('members')}>Members ({club.member_count})</button>
          </div>

          {tab === 'discussions' && (
            <div>
              {isMember && <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setShowDiscForm(true)}><Plus size={16} /> New Discussion</button>}
              {discussions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No discussions yet.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {discussions.map(d => (
                    <div key={d.id} className="club-card" onClick={() => openDisc(d)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                            {d.title}
                            {d.has_spoiler === 1 && <span style={{ fontSize: '0.65rem', background: 'rgba(252,92,125,0.1)', color: 'var(--accent-2)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>SPOILER</span>}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>by {d.author_name}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                          <span>❤ {d.likes}</span>
                          <span><MessageCircle size={12} style={{ verticalAlign: 'middle' }} /> {d.comment_count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'polls' && (
            <div>
              {isMember && <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setShowPollForm(true)}><Plus size={16} /> Create Poll</button>}
              {polls.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No polls yet.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {polls.map(poll => {
                    const totalVotes = Object.values(poll.votes).length;
                    const myVote = poll.votes[user?.id];
                    return (
                      <div key={poll.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                        <div style={{ fontWeight: 800, marginBottom: 12 }}>{poll.question}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {poll.options.map((opt, i) => {
                            const votes = Object.values(poll.votes).filter(v => v === opt).length;
                            const pct = totalVotes > 0 ? Math.round(votes / totalVotes * 100) : 0;
                            return (
                              <div key={i} onClick={() => isMember && vote(poll.id, opt)} style={{ cursor: isMember ? 'pointer' : 'default', position: 'relative', background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 14px', border: myVote === opt ? '1px solid var(--accent)' : '1px solid transparent', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: myVote === opt ? 'var(--accent-glow)' : 'rgba(124,92,252,0.05)', transition: 'width 0.3s' }} />
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: myVote === opt ? 800 : 400 }}>{opt}</span>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{pct}% ({votes})</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>{totalVotes} votes · by {poll.creator_name}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'members' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {club.members?.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
                  <div className="avatar">{m.username?.[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{m.username}</div></div>
                  {m.role === 'owner' && <span style={{ fontSize: '0.7rem', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>OWNER</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showDiscForm && (
        <div className="modal-overlay" onClick={() => setShowDiscForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">New Discussion</span><button className="btn-icon" onClick={() => setShowDiscForm(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Title</label><input className="input" placeholder="Discussion title..." value={discForm.title} onChange={e => setDiscForm(f => ({...f, title: e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Content</label><textarea className="input" placeholder="What's on your mind?" value={discForm.content} onChange={e => setDiscForm(f => ({...f, content: e.target.value}))} style={{ minHeight: 120 }} /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}><input type="checkbox" checked={discForm.has_spoiler} onChange={e => setDiscForm(f => ({...f, has_spoiler: e.target.checked}))} /> Contains spoilers</label>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowDiscForm(false)}>Cancel</button><button className="btn btn-primary" onClick={createDisc}>Post</button></div>
          </div>
        </div>
      )}

      {showPollForm && (
        <div className="modal-overlay" onClick={() => setShowPollForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Create Poll</span><button className="btn-icon" onClick={() => setShowPollForm(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Question</label><input className="input" placeholder="Ask something..." value={pollForm.question} onChange={e => setPollForm(f => ({...f, question: e.target.value}))} /></div>
              <div className="form-group">
                <label className="form-label">Options</label>
                {pollForm.options.map((opt, i) => <input key={i} className="input" style={{ marginBottom: 8 }} placeholder={`Option ${i + 1}`} value={opt} onChange={e => setPollForm(f => ({ ...f, options: f.options.map((o, j) => j === i ? e.target.value : o) }))} />)}
                <button className="btn btn-secondary btn-sm" onClick={() => setPollForm(f => ({...f, options: [...f.options, '']}))}>+ Add Option</button>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowPollForm(false)}>Cancel</button><button className="btn btn-primary" onClick={createPoll}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
