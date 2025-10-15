import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom/client";
import Hls from "hls.js";

function Overlay({o, onUpdate}){
  const ref = useRef();
  useEffect(()=>{
    if(window.interact && ref.current){
      window.interact(ref.current)
        .draggable({
          listeners: {
            move (event) {
              const target = event.target;
              const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
              const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
              target.style.transform = `translate(${x}px, ${y}px)`;
              target.setAttribute('data-x', x);
              target.setAttribute('data-y', y);
            },
            end (event) {
              const target = event.target;
              const x = parseFloat(target.getAttribute('data-x')) || 0;
              const y = parseFloat(target.getAttribute('data-y')) || 0;
              const id = target.getAttribute('data-id');
              onUpdate(id, { x: Math.round(x), y: Math.round(y) });
            }
          }
        })
        .resizable({
          edges: { left:false, right:true, bottom:true, top:false },
          listeners: {
            move (event) {
              const target = event.target;
              let x = parseFloat(target.getAttribute('data-x')) || 0;
              let y = parseFloat(target.getAttribute('data-y')) || 0;
              // update the element's style
              target.style.width = event.rect.width + 'px';
              target.style.height = event.rect.height + 'px';
              // translate when resizing from top/left edges (not used here)
              x += event.deltaRect.left;
              y += event.deltaRect.top;
              target.style.transform = `translate(${x}px, ${y}px)`;
              target.setAttribute('data-x', x);
              target.setAttribute('data-y', y);
            },
            end (event) {
              const target = event.target;
              const id = target.getAttribute('data-id');
              const x = Math.round(parseFloat(target.getAttribute('data-x')) || 0);
              const y = Math.round(parseFloat(target.getAttribute('data-y')) || 0);
              const width = Math.round(parseFloat(target.style.width));
              const height = Math.round(parseFloat(target.style.height));
              onUpdate(id, { x, y, width, height });
            }
          },
          modifiers: [
            window.interact.modifiers.restrictSize({ min: { width: 50, height: 20 } })
          ]
        });
    }
  }, [o, onUpdate]);

  const style = {
    width: o.width + 'px',
    height: o.height + 'px',
    transform: `translate(${o.x}px, ${o.y}px)`,
    pointerEvents: 'auto',
    display: o.visible ? 'block' : 'none'
  };

  return (
    <div className="overlay-item border rounded p-1 bg-dark text-white" ref={ref} data-id={o.id} data-x={o.x} data-y={o.y} style={style}>
      {o.type === 'text' ? <div style={{fontSize:16}}>{o.content}</div> : <img src={o.content} alt={o.name} style={{width:'100%', height:'100%', objectFit:'contain'}} />}
      <div className="overlay-handle"></div>
    </div>
  );
}

function App(){
  const [hlsUrl, setHlsUrl] = useState("");
  const [overlays, setOverlays] = useState([]);
  const [form, setForm] = useState({name:'', content:'', x:20, y:20, width:200, height:60, type:'text', visible:true});
  const [editingId, setEditingId] = useState(null);
  const videoRef = useRef();

  useEffect(()=>{
    fetch('/api/overlays').then(r=>r.json()).then(setOverlays).catch(()=>setOverlays([]));
  },[]);

  useEffect(()=>{
    if(!hlsUrl) return;
    const video = videoRef.current;
    if(Hls.isSupported()){
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(()=>{});
      });
      return ()=> hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')){
      video.src = hlsUrl;
    }
  }, [hlsUrl]);

  const saveOverlay = async ()=>{
    const body = {...form, x: Number(form.x), y: Number(form.y), width: Number(form.width), height: Number(form.height)};
    if(editingId){
      const res = await fetch(`/api/overlays/${editingId}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
      const updated = await res.json();
      setOverlays(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingId(null);
    } else {
      const res = await fetch('/api/overlays', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
      const created = await res.json();
      setOverlays(prev => [...prev, created]);
    }
    setForm({name:'', content:'', x:20, y:20, width:200, height:60, type:'text', visible:true});
  };

  const editOverlay = (o)=>{
    setEditingId(o.id);
    setForm({...o});
  };

  const deleteOverlay = async (id)=>{
    await fetch(`/api/overlays/${id}`, {method:'DELETE'});
    setOverlays(prev => prev.filter(p=>p.id!==id));
  };

  const toggleVisibility = async (o)=>{
    const res = await fetch(`/api/overlays/${o.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({visible: !o.visible})});
    const updated = await res.json();
    setOverlays(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const updateFromDrag = async (id, fields)=>{
    await fetch(`/api/overlays/${id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(fields)});
    setOverlays(prev => prev.map(p => p.id === id ? {...p, ...fields} : p));
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-2 sidebar bg-light p-0">
          <div className="d-flex flex-column p-3">
            <h4 className="mb-3">Overlay Dashboard</h4>
            <hr/>
            <div className="mb-3">
              <label className="form-label">HLS / M3U8 URL</label>
              <input className="form-control" value={hlsUrl} onChange={e=>setHlsUrl(e.target.value)} placeholder="Enter HLS URL..." />
            </div>
            <div className="mb-3">
              <button className="btn btn-primary w-100" onClick={()=>{ /* play handled by effect */ }}>Load Stream</button>
            </div>

            <h6 className="mt-4">Create / Edit Overlay</h6>
            <div className="card card-body mb-3 card-preview">
              <div className="mb-2">
                <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                <select className="form-select mb-2" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                  <option value="text">Text</option>
                  <option value="image">Image URL</option>
                </select>
                <input className="form-control mb-2" placeholder="Content (text or image URL)" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} />
                <div className="row g-2">
                  <div className="col"><input className="form-control" type="number" value={form.x} onChange={e=>setForm({...form, x:e.target.value})} placeholder="X" /></div>
                  <div className="col"><input className="form-control" type="number" value={form.y} onChange={e=>setForm({...form, y:e.target.value})} placeholder="Y" /></div>
                </div>
                <div className="row g-2 mt-2">
                  <div className="col"><input className="form-control" type="number" value={form.width} onChange={e=>setForm({...form, width:e.target.value})} placeholder="W" /></div>
                  <div className="col"><input className="form-control" type="number" value={form.height} onChange={e=>setForm({...form, height:e.target.value})} placeholder="H" /></div>
                </div>
                <div className="form-check form-switch mt-2">
                  <input className="form-check-input" type="checkbox" checked={form.visible} onChange={e=>setForm({...form, visible:e.target.checked})} id="visibleSwitch" />
                  <label className="form-check-label" htmlFor="visibleSwitch">Visible</label>
                </div>
                <div className="d-grid gap-2 mt-2">
                  <button className="btn btn-success" onClick={saveOverlay}>{editingId ? 'Save Changes' : 'Create Overlay'}</button>
                  <button className="btn btn-secondary" onClick={()=>{ setForm({name:'', content:'', x:20, y:20, width:200, height:60, type:'text', visible:true}); setEditingId(null); }}>Reset</button>
                </div>
              </div>
            </div>

            <h6>Live Preview</h6>
            <div className="card card-body mb-3">
              <div style={{minHeight:60, position:'relative', background:'#111'}}>
                {/* preview using form values */}
                {form.type==='text' ? <div className="text-white p-2" style={{position:'absolute', left:form.x, top:form.y}}>{form.content}</div> : <img src={form.content} alt="preview" style={{position:'absolute', left:form.x, top:form.y, width:form.width, height:form.height, objectFit:'contain'}} />}
              </div>
            </div>
          </div>
        </nav>

        <main className="col-10 ps-4">
          <div className="d-flex justify-content-between align-items-center topbar mb-3">
            <h3>Live Player & Overlays</h3>
            <div>Welcome — Demo</div>
          </div>

          <div className="row">
            <div className="col-8">
              <div id="player-box" style={{width:'100%', height:520, position:'relative'}} className="rounded overflow-hidden">
                <video ref={videoRef} style={{width:'100%', height:'100%'}} controls />
                {overlays.map(o => <Overlay key={o.id} o={o} onUpdate={updateFromDrag} />)}
              </div>
            </div>
            <div className="col-4">
              <div className="mb-3">
                <h5>Overlays</h5>
                <table className="table table-sm">
                  <thead>
                    <tr><th>Name</th><th>Type</th><th>Visible</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {overlays.map(o => (
                      <tr key={o.id}>
                        <td>{o.name}</td>
                        <td>{o.type}</td>
                        <td><input type="checkbox" checked={o.visible} onChange={()=>toggleVisibility(o)} /></td>
                        <td>
                          <button className="btn btn-sm btn-primary me-1" onClick={()=>editOverlay(o)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={()=>deleteOverlay(o.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h6>Quick Actions</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary" onClick={()=>{ setForm({name:'Timestamp', content: new Date().toLocaleString(), x:10, y:10, width:220, height:40, type:'text', visible:true}); }}>Add Timestamp</button>
                  <button className="btn btn-outline-secondary" onClick={()=>{ setForm({name:'Logo', content:'https://via.placeholder.com/150', x:600, y:10, width:120, height:60, type:'image', visible:true}); }}>Add Sample Logo</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);