import React, {useEffect, useRef, useState} from 'react';
import CryptoJS from 'crypto-js';
import '../styles/TicketPage.css';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {VideoExtension} from '../../../utils/tiptap/extensions/VideoExtension';
import Dropdown from '../components/Dropdown';
import {useSetLayout} from '../../../shared/layouts/LayoutContext';
import {AddIcon, NotificationIcon, SearchIcon, UserIcon} from '../../../shared/icons/icons';
import {getCurrentUser} from '../../../utils/auth';
import {useNavigate, useParams} from '@tanstack/react-router';

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
    const params = useParams({from: '/_authenticated/tickets/$ticketId' as const});
    const rawParam = params?.ticketId ?? '';
    const ticketId = (() => {
        try {
            const s = decodeURIComponent(String(rawParam));
            try {
                const maybe = atob(s);
                return maybe || s;
            } catch {
                return s;
            }
        } catch {
            return String(rawParam);
        }
    })();

    const currentUser = getCurrentUser() ?? undefined;
    const isVendor = (currentUser?.userType || '').toLowerCase() === 'vendor';

    const [ticket, setTicket] = useState<StoredTicket | null>(null);
    const [editState, setEditState] = useState<Partial<StoredTicket> | null>(null);
    const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState<number | null>(null);
    const TICKET_SECRET = 'skyworld_ticket_secret_2025';
    const [status, setStatus] = useState<string>('Open');
    const [unauthorized, setUnauthorized] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const extensions = React.useMemo(() => [
        StarterKit,
        Underline,
        Link.configure({openOnClick: false}),
        TextAlign.configure({types: ['heading', 'paragraph']}),
        Image,
        VideoExtension,
    ], []);
    const editor = useEditor({
        extensions,
        content: '',
        onUpdate: ({editor}) => {
            const html = editor.getHTML();
            setEditState((s) => (s?.description === html ? s : {...(s || {}), description: html}));
        }
    });

    useEffect(() => {
        if (!ticketId) return;
        const TICKET_SECRET = 'skyworld_ticket_secret_2025';
        const encrypted = localStorage.getItem('tickets');
        if (!encrypted) return;
        try {
            let parsed: StoredTicket[];
            try {
                const decrypted = CryptoJS.AES.decrypt(encrypted, TICKET_SECRET).toString(CryptoJS.enc.Utf8);
                if (decrypted) {
                    parsed = JSON.parse(decrypted || '[]');
                } else {
                    parsed = JSON.parse(encrypted || '[]');
                }
            } catch {
                parsed = JSON.parse(encrypted || '[]');
            }
            const found = parsed.find(t => String(t.id) === String(ticketId));
            if (found) {
                // Access control for clients: must match company
                if (!isVendor) {
                    const userCompany = currentUser?.company || '';
                    const ticketCompany = (found as any).company || '';
                    const companyMatches = (ticketCompany && ticketCompany === userCompany) || (found.source && found.source.includes(userCompany));
                    if (!companyMatches) {
                        setUnauthorized(true);
                        return;
                    }
                }
                setTicket(found);
                // initialize editState with the whole ticket so inputs and files are available
                setEditState({...found});
                setStatus(found.status ?? 'Open');
                setTimeout(() => editor?.commands.setContent(found.description || ''), 0);
            }
        } catch (err) {
            console.error('Failed to load ticket:', err);
        }
    }, [ticketId, editor, isVendor, currentUser]);

    if (!ticketId) {
        return <div style={{padding: 24}}>No ticket specified.</div>;
    }
    if (unauthorized) {
        return <div style={{padding: 24}}>You are not authorized to view this ticket.</div>;
    }

    const statusOptions = ['Open', 'In Progress', 'Closed'];

    // Build consistent header right items based on role
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);
    useEffect(() => {
        navigateRef.current = navigate;
    }, [navigate]);
    const [saccoFilter, setSaccoFilter] = useState('');
    const headerRightItems = React.useMemo(() => {
        const items: React.ReactNode[] = [
            <div key="add" onClick={() => navigateRef.current({to: "/createTicket"})} style={{cursor: 'pointer'}}>
                <AddIcon/></div>,
            <div key="search" title="Coming Soon" style={{cursor: 'pointer'}}><SearchIcon/></div>,
        ];
        if (isVendor) {
            items.push(
                <Dropdown key="sacco-filter" options={["Apstar SACCO", "Mwalimu SACCO", "Defence SACCO", "Wetu SACCO"]}
                          value={saccoFilter} onChange={(e) => setSaccoFilter(e.target.value)}
                          placeholder="Apstar SACCO Limited" showIcon={false}/>
            );
        }
        items.push(
            <div key="notifications" title="Coming Soon" style={{cursor: 'pointer'}}><NotificationIcon/></div>,
            <div key="user" title="Coming Soon" style={{cursor: 'pointer'}}><UserIcon/></div>,
        );
        return items;
    }, [saccoFilter, isVendor]);

    useSetLayout({
        leftText: currentUser?.company || 'Help Desk',
        leftButtonText: currentUser?.userType || 'CLIENT',
        rightItems: headerRightItems,
        mainContentClassName: 'ticket-page',
    });

    const replaceSelectedAttachment = async (file: File) => {
        if (selectedAttachmentIndex === null) {
            alert('Select an attachment to replace first');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result);
            setEditState((s) => {
                const files = (s?.files ?? ticket?.files ?? []).slice();
                files[selectedAttachmentIndex] = {name: file.name, size: file.size, type: file.type, dataUrl};
                return {...(s || {}), files};
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <input ref={fileInputRef} type="file" style={{display: 'none'}} onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) replaceSelectedAttachment(f);
                if (e.target) (e.target as HTMLInputElement).value = '';
            }} accept=".jpg,.jpeg,.png,.pdf"/>
            <div style={{padding: 16}}>
                <h2>Ticket Details</h2>
                {/* Local toolbar for status selection visible only to Vendors */}
                {isVendor && (
                    <div style={{display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0 16px'}}>
                        <span>Status:</span>
                        <Dropdown key="status" options={statusOptions} value={status}
                                  onChange={(e) => setStatus(String(e.target.value))} placeholder="Status"
                                  showIcon={false}/>
                    </div>
                )}
                {!ticket ? (
                    <p>Ticket not found or loading...</p>
                ) : (
                    <div className="ticket-detail-grid">
                        <div className="ticket-detail-left">
                            <h3>Ticket #{ticket.id}</h3>
                            <label>
                                Category
                                <input value={editState?.mainCategory ?? ticket.mainCategory}
                                       onChange={(e) => setEditState((s) => ({
                                           ...(s || {}),
                                           mainCategory: e.target.value
                                       }))}/>
                            </label>
                            <label>
                                Sub Category
                                <input value={editState?.subCategory ?? ticket.subCategory}
                                       onChange={(e) => setEditState((s) => ({
                                           ...(s || {}),
                                           subCategory: e.target.value
                                       }))}/>
                            </label>
                            <label>
                                Problem
                                <input value={editState?.problem ?? ticket.problem}
                                       onChange={(e) => setEditState((s) => ({
                                           ...(s || {}),
                                           problem: e.target.value
                                       }))}/>
                            </label>
                            <label>
                                Description
                                <div style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 4,
                                    background: '#fff',
                                    padding: 8
                                }}>
                                    <EditorContent editor={editor}/>
                                </div>
                            </label>
                            <div style={{marginTop: 12}}>
                                <button onClick={async () => {
                                    const mainCategory = (editState?.mainCategory ?? ticket.mainCategory ?? '').trim();
                                    const subCategory = (editState?.subCategory ?? ticket.subCategory ?? '').trim();
                                    const problem = (editState?.problem ?? ticket.problem ?? '').trim();
                                    if (!mainCategory) {
                                        alert('Main category is required');
                                        return;
                                    }
                                    if (!subCategory) {
                                        alert('Sub category is required');
                                        return;
                                    }
                                    if (!problem) {
                                        alert('Problem/Issue is required');
                                        return;
                                    }
                                    const filesToValidate = (editState?.files ?? ticket.files ?? []) as StoredFile[];
                                    const MAX_FILES = 5;
                                    const MAX_SIZE_MB = 2;
                                    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.pdf', '.png'];
                                    if (filesToValidate.length > MAX_FILES) {
                                        alert('You can upload a maximum of 5 files.');
                                        return;
                                    }
                                    for (const f of filesToValidate) {
                                        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
                                            alert(`File "${f.name}" exceeds the maximum size of ${MAX_SIZE_MB}MB.`);
                                            return;
                                        }
                                        const fileExt = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
                                        if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
                                            alert(`File type for "${f.name}" is not allowed.`);
                                            return;
                                        }
                                    }

                                    const encrypted = localStorage.getItem('tickets');
                                    if (!encrypted) return;
                                    try {
                                        const decrypted = CryptoJS.AES.decrypt(encrypted, TICKET_SECRET).toString(CryptoJS.enc.Utf8);
                                        const parsed: StoredTicket[] = JSON.parse(decrypted || '[]');
                                        const idx = parsed.findIndex(t => String(t.id) === String(ticketId));
                                        if (idx === -1) return;
                                        const statusToSave = isVendor ? status : (parsed[idx].status ?? 'Open');
                                        parsed[idx] = {
                                            ...parsed[idx], ...(editState || {}),
                                            source: parsed[idx].source,
                                            status: statusToSave
                                        } as StoredTicket;
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
                                }} style={{marginRight: 8}}>Save
                                </button>
                                <button className="secondary" onClick={() => {
                                    setEditState(ticket ?? null);
                                    editor?.commands.setContent(ticket?.description || '');
                                }}>Cancel
                                </button>
                            </div>
                        </div>
                        <div className="ticket-detail-right">
                            <h4>Attachments</h4>
                            <div className="attachments-list">
                                {(editState?.files ?? ticket.files ?? []).map((f, idx) => (
                                    <div key={f.name + idx}
                                         style={{marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center'}}>
                                        <button onClick={() => setSelectedAttachmentIndex(idx)}
                                                style={{cursor: 'pointer'}}>{f.name} ({Math.round((f.size ?? 0) / 1024)} KB)
                                        </button>
                                        <button onClick={() => {
                                            setSelectedAttachmentIndex(idx);
                                            fileInputRef.current?.click();
                                        }} style={{cursor: 'pointer'}}>Replace
                                        </button>
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
                                        if (!f.dataUrl) return <p>No preview available for this file</p>;
                                        if (f.type === 'application/pdf' || (f.name && f.name.toLowerCase().endsWith('.pdf'))) {
                                            return <iframe title={f.name} src={f.dataUrl}
                                                           style={{width: '100%', height: '600px', border: 'none'}}/>;
                                        }
                                        return <img alt={f.name} src={f.dataUrl}
                                                    style={{maxWidth: '100%', maxHeight: '80vh'}}/>;
                                    })()
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default TicketDetailPage;
