import { useEffect, useState } from 'react';
import { useRef } from 'react';
import MainLayout from '../shared/layouts/MainLayout';
import CryptoJS from 'crypto-js';
import '../styles/TicketPage.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { VideoExtension } from '../../../utils/tiptap/extensions/VideoExtension';
import Dropdown from '../components/Dropdown';

interface StoredFile {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

interface StoredTicket {
  id: number;
  mainCategory: string;
  subCategory: string;
  problem: string;
  description: string;
  files: StoredFile[];
  createdAt: string;
  source: string;
  status?: string;
}

function TicketDetailPage() {
  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
  const ticketIdEncoded = pathParts[pathParts.length - 1];
  let ticketId: string | null = null;
  try {
    ticketId = ticketIdEncoded ? atob(ticketIdEncoded) : null;
  } catch {
    ticketId = ticketIdEncoded || null;
  }
  const [ticket, setTicket] = useState<StoredTicket | null>(null);
  const [editState, setEditState] = useState<Partial<StoredTicket> | null>(null);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState<number | null>(null);
  const TICKET_SECRET = 'skyworld_ticket_secret_2025';
  const [status, setStatus] = useState<string>('Open');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false }), TextAlign.configure({ types: ['heading', 'paragraph'] }), Image, VideoExtension],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditState((s) => ({ ...(s || {}), description: html }));
    }
  });

  useEffect(() => {
    if (!ticketId) return;
    const TICKET_SECRET = 'skyworld_ticket_secret_2025';
    const encrypted = localStorage.getItem('tickets');
    if (!encrypted) return;
    try {
  const decrypted = CryptoJS.AES.decrypt(encrypted, TICKET_SECRET).toString(CryptoJS.enc.Utf8);
  const parsed: StoredTicket[] = JSON.parse(decrypted || '[]');
  const found = parsed.find(t => String(t.id) === String(ticketId));
      if (found) {
        setTicket(found);
        // initialize editState with the whole ticket so inputs and files are available
        setEditState({ ...found });
        setStatus(found.status ?? 'Open');
        setTimeout(() => editor?.commands.setContent(found.description || ''), 0);
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
    }
  }, [ticketId, editor]);

  if (!ticketId) {
    return <div style={{ padding: 24 }}>No ticket specified.</div>;
  }

  const statusOptions = ['Open', 'In Progress', 'Closed'];
  const rightItems = [
    <Dropdown key="status" options={statusOptions} value={status} onChange={(e) => setStatus(String(e.target.value))} placeholder="Status" showIcon={false} />
  ];

  const replaceSelectedAttachment = async (file: File) => {
    if (selectedAttachmentIndex === null) { alert('Select an attachment to replace first'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setEditState((s) => {
        const files = (s?.files ?? ticket?.files ?? []).slice();
        files[selectedAttachmentIndex] = { name: file.name, size: file.size, type: file.type, dataUrl };
        return { ...(s || {}), files };
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <MainLayout leftText="Help Desk" leftButtonText="VENDOR" userType="Vendor" username="Guest" rightItems={rightItems} mainContentClassName="ticket-page">
      <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) replaceSelectedAttachment(f);
        if (e.target) (e.target as HTMLInputElement).value = '';
      }} accept=".jpg,.jpeg,.png,.pdf" />
      <div style={{ padding: 16 }}>
        <h2>Ticket Details</h2>
        {!ticket ? (
          <p>Ticket not found or loading...</p>
        ) : (
          <div className="ticket-detail-grid">
            <div className="ticket-detail-left">
              <h3>Ticket #{ticket.id}</h3>
              <label>
                Category
                <input value={editState?.mainCategory ?? ticket.mainCategory} onChange={(e) => setEditState((s) => ({ ...(s || {}), mainCategory: e.target.value }))} />
              </label>
              <label>
                Sub Category
                <input value={editState?.subCategory ?? ticket.subCategory} onChange={(e) => setEditState((s) => ({ ...(s || {}), subCategory: e.target.value }))} />
              </label>
              <label>
                Problem
                <input value={editState?.problem ?? ticket.problem} onChange={(e) => setEditState((s) => ({ ...(s || {}), problem: e.target.value }))} />
              </label>
              <label>
                Description
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 4, background: '#fff', padding: 8 }}>
                  <EditorContent editor={editor} />
                </div>
              </label>
              <div style={{ marginTop: 12 }}>
                <button onClick={async () => {
                  // validate fields like CreateTicketForm
                  const mainCategory = (editState?.mainCategory ?? ticket.mainCategory ?? '').trim();
                  const subCategory = (editState?.subCategory ?? ticket.subCategory ?? '').trim();
                  const problem = (editState?.problem ?? ticket.problem ?? '').trim();
                  if (!mainCategory) { alert('Main category is required'); return; }
                  if (!subCategory) { alert('Sub category is required'); return; }
                  if (!problem) { alert('Problem/Issue is required'); return; }
                  const filesToValidate = (editState?.files ?? ticket.files ?? []) as StoredFile[];
                  const MAX_FILES = 5;
                  const MAX_SIZE_MB = 2;
                  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.pdf', '.png'];
                  if (filesToValidate.length > MAX_FILES) { alert('You can upload a maximum of 5 files.'); return; }
                  for (const f of filesToValidate) {
                    if (f.size > MAX_SIZE_MB * 1024 * 1024) { alert(`File "${f.name}" exceeds the maximum size of ${MAX_SIZE_MB}MB.`); return; }
                    const fileExt = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
                    if (!ALLOWED_EXTENSIONS.includes(fileExt)) { alert(`File type for "${f.name}" is not allowed.`); return; }
                  }

                  // commit changes
                  const encrypted = localStorage.getItem('tickets');
                  if (!encrypted) return;
                  try {
                    const decrypted = CryptoJS.AES.decrypt(encrypted, TICKET_SECRET).toString(CryptoJS.enc.Utf8);
                    const parsed: StoredTicket[] = JSON.parse(decrypted || '[]');
                    const idx = parsed.findIndex(t => String(t.id) === String(ticketId));
                    if (idx === -1) return;
                    parsed[idx] = { ...parsed[idx], ...(editState || {}), source: parsed[idx].source, status } as StoredTicket;
                    const reEncrypted = CryptoJS.AES.encrypt(JSON.stringify(parsed), TICKET_SECRET).toString();
                    localStorage.setItem('tickets', reEncrypted);
                    setTicket(parsed[idx]);
                    setEditState({
                      mainCategory: parsed[idx].mainCategory,
                      subCategory: parsed[idx].subCategory,
                      problem: parsed[idx].problem,
                      description: parsed[idx].description,
                      files: parsed[idx].files,
                      createdAt: parsed[idx].createdAt,
                      source: parsed[idx].source,
                      status: parsed[idx].status,
                    });
                    alert('Ticket saved');
                  } catch (err) {
                    console.error('Failed to save ticket', err);
                    alert('Failed to save ticket');
                  }
                }} style={{ marginRight: 8 }}>Save</button>
                <button className="secondary" onClick={() => { setEditState(ticket ?? null); editor?.commands.setContent(ticket?.description || ''); }}>Cancel</button>
              </div>
            </div>
            <div className="ticket-detail-right">
              <h4>Attachments</h4>
              <div className="attachments-list">
                {(editState?.files ?? ticket.files ?? []).map((f, idx) => (
                  <div key={f.name + idx} style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => setSelectedAttachmentIndex(idx)} style={{ cursor: 'pointer' }}>{f.name} ({Math.round((f.size ?? 0)/1024)} KB)</button>
                    <button onClick={() => { setSelectedAttachmentIndex(idx); fileInputRef.current?.click(); }} style={{ cursor: 'pointer' }}>Replace</button>
                  </div>
                ))}
              </div>
              <div className="attachment-preview">
                {selectedAttachmentIndex === null ? (
                  <p>Select an attachment to preview</p>
                ) : (
                  (() => {
                    const filesSource = editState?.files ?? ticket.files ?? [];
                    const f = filesSource[selectedAttachmentIndex];
                    if (!f) return <p>Attachment not found</p>;
                    if (f.type === 'application/pdf' || (f.name && f.name.toLowerCase().endsWith('.pdf'))) {
                      return <iframe title={f.name} src={f.dataUrl} style={{ width: '100%', height: '600px', border: 'none' }} />;
                    }
                    // default to image
                    return <img alt={f.name} src={f.dataUrl} style={{ maxWidth: '100%', maxHeight: '80vh' }} />;
                  })()
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default TicketDetailPage;
