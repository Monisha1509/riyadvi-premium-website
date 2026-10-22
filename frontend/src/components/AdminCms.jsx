import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api.js';

const TYPES = [
  { id: 'careers', label: 'Careers / Jobs', fields: ['title','slug','department','type','location','experience','description','responsibilities','qualifications','salary','status'] },
  { id: 'services', label: 'Services', fields: ['title','slug','category','description','excerpt','image','icon','features','order','status'] },
  { id: 'portfolio', label: 'Portfolio / Projects', fields: ['title','slug','category','description','excerpt','image','technologies','projectUrl','featured','status'] },
  { id: 'blog', label: 'Insights / Blog', fields: ['title','slug','category','excerpt','body','image','date','read','tags','status'] },
];
const blank = { title:'', slug:'', department:'', type:'Full-time', location:'Remote', experience:'', description:'', excerpt:'', category:'', image:'', icon:'', features:'', responsibilities:'', qualifications:'', salary:'', technologies:'', projectUrl:'', body:'', date:'', read:'', tags:'', order:'0', featured:'false', status:'published' };
const toForm = item => Object.fromEntries(Object.entries({ ...blank, ...item }).map(([k,v]) => [k, Array.isArray(v) ? v.join(', ') : (v == null ? '' : String(v))]));
const toPayload = form => {
  const result = { ...form };
  for (const key of ['features','responsibilities','qualifications','technologies','tags','body']) {
    if (typeof result[key] === 'string' && result[key].trim()) result[key] = result[key].split(/\n|,/).map(x => x.trim()).filter(Boolean);
  }
  if (result.order !== '') result.order = Number(result.order) || 0;
  result.featured = result.featured === 'true';
  return result;
};
export default function AdminCms({ token }) {
  const [type, setType] = useState('careers');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const headers = { Authorization: `Bearer ${token}` };
  const selected = TYPES.find(x => x.id === type) || TYPES[0];
  async function load() {
    setLoading(true); setError('');
    try { const data = await apiRequest(`/api/admin/content/${type}`, { headers }); setItems(data.items || []); }
    catch (e) { setError(e.message || 'Unable to load content'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); setEditing(null); setForm(blank); }, [type]);
  function edit(item) { setEditing(item._id); setForm(toForm(item)); setNotice(''); setError(''); }
  function reset() { setEditing(null); setForm(blank); setError(''); setNotice(''); }
  async function save(e) {
    e.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const payload = toPayload(form);
      const path = `/api/admin/content/${type}${editing ? `/${encodeURIComponent(editing)}` : ''}`;
      const result = await apiRequest(path, { method: editing ? 'PUT' : 'POST', headers, body: JSON.stringify(payload) });
      setNotice(editing ? 'Changes saved.' : 'Content created.'); setEditing(null); setForm(blank); await load();
      if (result.item?.status === 'draft') setNotice('Saved as draft. It will not appear on the public page until published.');
    } catch (e) { setError(e.message || 'Unable to save content'); }
    finally { setSaving(false); }
  }
  async function remove(item) {
    if (!window.confirm(`Delete “${item.title || item.name || item.slug}”? This cannot be undone.`)) return;
    setError(''); setNotice('');
    try { await apiRequest(`/api/admin/content/${type}/${encodeURIComponent(item._id)}`, { method:'DELETE', headers }); setNotice('Content deleted.'); if (editing === item._id) reset(); await load(); }
    catch (e) { setError(e.message || 'Unable to delete content'); }
  }
  const visible = items.filter(item => `${item.title||''} ${item.name||''} ${item.slug||''} ${item.category||''}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="cms-admin">
    <div className="cms-head"><div><h2>Website Content CMS</h2><p>Manage published services, portfolio projects, articles and job openings. Changes are saved to MongoDB.</p></div><button className="button button-outline" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    <div className="cms-tabs">{TYPES.map(t => <button key={t.id} className={type===t.id?'filter-chip active':'filter-chip'} onClick={()=>setType(t.id)}>{t.label}</button>)}</div>
    {error && <p className="error-text" role="alert">{error}</p>}{notice && <p className="cms-notice" role="status">{notice}</p>}
    <div className="cms-layout">
      <div className="cms-list-panel"><div className="cms-list-tools"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search content…" aria-label="Search content"/><button className="button button-gold" onClick={reset}>+ Add new</button></div>
        {loading ? <p className="cms-muted">Loading content…</p> : visible.length ? visible.map(item=><article className={`cms-item ${editing===item._id?'selected':''}`} key={item._id}><div><strong>{item.title||item.name||'(Untitled)'}</strong><small>/{item.slug} · {item.status||'published'}</small></div><div className="cms-item-actions"><button className="text-link" onClick={()=>edit(item)}>Edit</button><button className="text-link cms-delete" onClick={()=>remove(item)}>Delete</button></div></article>) : <p className="cms-muted">No content found. Add your first {selected.label.toLowerCase()} item.</p>}
      </div>
      <form className="cms-editor" onSubmit={save}><div className="cms-editor-title"><h3>{editing ? 'Edit content' : `Add ${selected.label}`}</h3>{editing&&<span className="cms-status">Editing</span>}</div>
        {selected.fields.map(field => <label key={field} className={['description','excerpt','body','features','responsibilities','qualifications','technologies','tags'].includes(field)?'cms-wide':''}><span>{field.replace(/[A-Z]/g, m=>` ${m}`).replace(/^./,m=>m.toUpperCase())}{['title'].includes(field)?' *':''}</span>
          {field==='status' ? <select value={form[field]||'published'} onChange={e=>setForm(v=>({...v,[field]:e.target.value}))}><option value="draft">Draft</option><option value="published">Published</option></select>
          : ['description','excerpt','body','features','responsibilities','qualifications','technologies','tags'].includes(field) ? <textarea rows={field==='body'||field==='description'?4:2} value={form[field]||''} onChange={e=>setForm(v=>({...v,[field]:e.target.value}))} placeholder={['features','responsibilities','qualifications','technologies','tags'].includes(field)?'Separate items with commas or new lines':''}/>
          : field==='featured' ? <select value={form[field]||'false'} onChange={e=>setForm(v=>({...v,[field]:e.target.value}))}><option value="false">No</option><option value="true">Yes</option></select>
          : <input required={field==='title'} value={form[field]||''} onChange={e=>setForm(v=>({...v,[field]:e.target.value}))} placeholder={field==='slug'?'Leave blank to generate from title':field==='image'?'Image URL (or supported public asset URL)':''}/>}</label>)}
        <div className="cms-editor-actions"><button className="button button-gold" disabled={saving}>{saving?'Saving…':editing?'Save changes':'Create content'}</button><button type="button" className="button button-outline" onClick={reset}>Clear</button></div>
        <p className="cms-muted">Published items are served by the public content APIs. Draft items stay hidden. Use a unique slug for each item.</p>
      </form>
    </div>
  </section>;
}
